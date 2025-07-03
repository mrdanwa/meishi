# api/views/booking/booking_views.py

from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.forms import ValidationError
from api.serializers.booking.booking_serializer import BookingSerializer, UserBookingSerializer
from api.models.booking.booking import Booking
from api.models.booking.time_slot import TimeSlot
from api.models.booking.booking_system import BookingSystem
from api.models.restaurant import Restaurant
from django.db import transaction

class AvailableTablesView(APIView):
    """
    Returns the list of available time slots (with remaining tables)
    for a given restaurant, date, and number of people.
    
    Query params:
      - restaurant_id
      - date (YYYY-MM-DD)
      - people (int)
    """

    permission_classes = [AllowAny]

    def get(self, request):
        restaurant_id = request.query_params.get('restaurant_id')
        query_date = request.query_params.get('date')
        people = request.query_params.get('people')

        # Basic validations
        if not restaurant_id or not query_date or not people:
            return Response(
                {"detail": "Missing one of the required query parameters: restaurant_id, date, people."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if date is valid
        try:
            query_date_obj = datetime.strptime(query_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"detail": "Invalid date format. Please use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if integer for people
        try:
            people = int(people)
        except ValueError:
            return Response(
                {"detail": "'people' must be an integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the restaurant
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        except Restaurant.DoesNotExist:
            return Response(
                {"detail": "Restaurant does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # For each BookingSystem of the restaurant, 
        # fetch all TimeSlot objects for the requested date,
        # and check if they can accommodate the number of people, 
        # are open, and not paused.
        booking_systems = BookingSystem.objects.filter(restaurant=restaurant)

        available_slots = []

        for system in booking_systems:
            if system.is_paused:
                continue

            time_slots = TimeSlot.objects.filter(
                booking_system=system,
                date=query_date_obj
            ).order_by('time')

            for ts in time_slots:
                if not ts.is_open:
                    continue

                if not (ts.min <= people <= ts.max):
                    continue

                # Check already-booked people (excluding canceled)
                total_booked_people = sum(b.people for b in ts.bookings.exclude(status='canceled'))
                if total_booked_people + people > ts.max_people:
                    continue

                # Check table capacity
                if ts.bookings.exclude(status='canceled').count() >= ts.max_tables:
                    continue

                # If we pass all checks, this slot is available
                available_slots.append({
                    "booking_system_id": system.id,
                    "meal_type": system.meal_type,
                    "time_slot_id": ts.id,
                    "time": str(ts.time),
                    "date": str(ts.date),
                    "available_people_capacity": ts.max_people - total_booked_people,
                    "available_table_capacity": ts.max_tables - ts.bookings.exclude(status='canceled').count(),
                })

        return Response({"available_times": available_slots}, status=status.HTTP_200_OK)

class ListCreateBookingView(generics.ListCreateAPIView):
    """
    List all bookings (for restaurant-owner usage) or create a new booking.
    """
    serializer_class = BookingSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = Booking.objects.filter(
            time_slot__booking_system__restaurant__owner=self.request.user
        )
        
        date_filter = self.request.query_params.get('date')
        if not date_filter:
            return Response(
                {"Missing date query parameter."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        
        try:
            date_obj = datetime.strptime(date_filter, "%Y-%m-%d").date()
            queryset = queryset.filter(time_slot__date=date_obj)
        except ValueError:
            raise ValidationError({"detail": "Invalid date format. Expected YYYY-MM-DD."})
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        booking_system_id = self.request.query_params.get('booking_system')
        if booking_system_id:
            queryset = queryset.filter(time_slot__booking_system=booking_system_id)
        
        order = self.request.query_params.get('order', '-created_at')
        queryset = queryset.order_by(order)

        return queryset
        
    def perform_create(self, serializer):
        with transaction.atomic():
            time_slot_id = self.request.data.get('time_slot')
            if not time_slot_id:
                raise ValidationError({"detail": "time_slot field is required."})

            time_slot = TimeSlot.objects.filter(id=time_slot_id).select_for_update().first()
            if not time_slot:
                raise ValidationError({"detail": "Invalid time slot ID."})

            user = self.request.user if self.request.user.is_authenticated else None
            # Always validate
            instance = serializer.save(time_slot=time_slot, user=user)
            instance.clean()  # Call clean() to apply all validations
            instance.save()

class UserCreateBookingView(generics.CreateAPIView):
    """
    Create a new booking.
    """
    serializer_class = UserBookingSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        with transaction.atomic():
            time_slot_id = self.request.data.get('time_slot')
            if not time_slot_id:
                raise ValidationError({"detail": "time_slot field is required."})

            time_slot = TimeSlot.objects.filter(id=time_slot_id).select_for_update().first()
            if not time_slot:
                raise ValidationError({"detail": "Invalid time slot ID."})

            user = self.request.user if self.request.user.is_authenticated else None
            instance = serializer.save(time_slot=time_slot, user=user)
            instance.clean()  # Call clean() to apply all validations
            instance.save()

class RetrieveUpdateDestroyBookingView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or destroy a booking for restaurant owners only.
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            time_slot__booking_system__restaurant__owner=self.request.user
        ).order_by('time_slot__time')

    def update(self, request, *args, **kwargs):
        with transaction.atomic():
            booking = self.get_object()
            if booking.time_slot.booking_system.restaurant.owner != request.user:
                return Response(
                    {"detail": "Not authorized - only restaurant owners can access this endpoint."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(booking, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            updated_booking = serializer.save()
            updated_booking.clean()  # Call clean() to apply all validations
            updated_booking.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        with transaction.atomic():
            booking = self.get_object()
            if booking.time_slot.booking_system.restaurant.owner != request.user:
                return Response(
                    {"detail": "Not authorized - only restaurant owners can access this endpoint."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            return super().destroy(request, *args, **kwargs)
    
class UserRetrieveUpdateBookingView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update a booking for authenticated users who own the booking.
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)

    def update(self, request, *args, **kwargs):
        with transaction.atomic():
            booking = self.get_object()
            if booking.user != request.user:
                return Response(
                    {"detail": "Not authorized - you can only modify your own bookings."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(booking, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            updated_booking = serializer.save()
            updated_booking.clean()  # Call clean() to apply all validations
            updated_booking.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

class RetrieveUpdateBookingByCodeView(APIView):
    """
    Retrieve or update a booking using the time slot and booking code.
    For unauthenticated users only.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        time_slot = request.query_params.get('time_slot')
        booking_code = request.query_params.get('booking_code')

        if not all([time_slot, booking_code]):
            return Response(
                {"detail": "Time slot and booking code are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking = Booking.objects.get(
                time_slot=time_slot,
                booking_code=booking_code,
                user=None
            )
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BookingSerializer(booking)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        time_slot = request.data.get('time_slot')
        booking_code = request.data.get('booking_code')

        if not all([time_slot, booking_code]):
            return Response(
                {"detail": "Time slot and booking code are required."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking = Booking.objects.get(
                time_slot=time_slot,
                booking_code=booking_code,
                user=None
            )
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BookingSerializer(booking, data=request.data, partial=True)
        if serializer.is_valid():
            updated_booking = serializer.save()
            updated_booking.clean()  # Call clean() to apply all validations
            updated_booking.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
