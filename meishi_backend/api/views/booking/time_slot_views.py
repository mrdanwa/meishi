# api/views/booking/time_slot_views.py

from datetime import datetime, timedelta
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from api.models.booking.time_slot import TimeSlot
from api.models.booking.booking_system import BookingSystem
from api.serializers.booking.time_slot_serializer import TimeSlotSerializer
from api.permissions import IsRestaurantAccount

class ListCreateTimeSlotView(generics.ListCreateAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]
    
    def get_queryset(self):
        # Restrict to time slots within booking systems owned by the authenticated user's restaurants
        queryset = TimeSlot.objects.filter(
            booking_system__restaurant__owner=self.request.user
        )
        
        # Apply restaurant filter if provided
        restaurant_id = self.request.query_params.get('restaurant_id')
        if restaurant_id:
            try:
                restaurant_id = int(restaurant_id)
                queryset = queryset.filter(booking_system__restaurant_id=restaurant_id)
            except ValueError:
                raise ValidationError({"detail": "Invalid restaurant ID. Expected an integer."})

        # Apply date filter if provided
        date_param = self.request.query_params.get('date')
        if date_param:
            try:
                date_obj = datetime.strptime(date_param, '%Y-%m-%d').date()
                queryset = queryset.filter(date=date_obj)
            except ValueError:
                raise ValidationError({"detail": "Invalid date format. Expected YYYY-MM-DD."})

        # Apply booking system filter if provided
        booking_system_param = self.request.query_params.get('booking_system')
        if booking_system_param:
            try:
                booking_system_id = int(booking_system_param)
                queryset = queryset.filter(booking_system_id=booking_system_id)
            except ValueError:
                raise ValidationError({"detail": "Invalid booking system ID. Expected an integer."})

        return queryset.order_by('time')

    def perform_create(self, serializer):
        booking_system_id = self.request.data.get('booking_system')
        if not booking_system_id:
            raise ValidationError({"detail": "Booking System field is required."})

        booking_system = BookingSystem.objects.filter(
            id=booking_system_id, 
            restaurant__owner=self.request.user
        ).first()

        if not booking_system:
            raise ValidationError({"detail": "Invalid BookingSystem ID or unauthorized access."})

        serializer.save(booking_system=booking_system)

class RetrieveUpdateDestroyTimeSlotView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        return TimeSlot.objects.filter(
            booking_system__restaurant__owner=self.request.user
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class CustomCreateTimeSlotView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def post(self, request, *args, **kwargs):
        booking_system_id = request.data.get('booking_system')
        date_str = request.data.get('date')
        start_time_str = request.data.get('start_time')
        end_time_str = request.data.get('end_time')
        interval_minutes = request.data.get('interval_minutes')
        max_people = request.data.get('max_people')
        max_tables = request.data.get('max_tables')
        min_people = request.data.get('min')
        max_people_allowed = request.data.get('max')

        # Validate inputs
        if not all([booking_system_id, date_str, start_time_str, end_time_str, interval_minutes, max_people, max_tables, min_people, max_people_allowed]):
            return Response(
                {"error: All fields (booking_system, date, start_time, end_time, interval_minutes, max_people, max_tables, min, max) are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d').date()
            start_time = datetime.strptime(start_time_str, '%H:%M').time()
            end_time = datetime.strptime(end_time_str, '%H:%M').time()
            interval_minutes = int(interval_minutes)
        except ValueError:
            return Response(
                {"error: Invalid date, time, or interval format."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check that interval_minutes is positive
        if interval_minutes <= 0:
            return Response(
                {"error: Interval must be greater than 0 minutes."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate the total duration between start_time and end_time
        start_datetime = datetime.combine(date_obj, start_time)
        end_datetime = datetime.combine(date_obj, end_time)

        if start_datetime >= end_datetime:
            return Response(
                {"error: start_time must be earlier than end_time."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_minutes = int((end_datetime - start_datetime).total_seconds() / 60)

        # Check if interval is smaller than the duration
        if interval_minutes > total_minutes:
            return Response(
                {"error: Interval must be smaller than the total duration between start_time and end_time."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking_system = BookingSystem.objects.filter(
            id=booking_system_id, 
            restaurant__owner=request.user
        ).first()

        if not booking_system:
            return Response(
                {"error: Invalid BookingSystem ID or unauthorized access."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for overlapping timeslots
        overlapping_timeslots = TimeSlot.objects.filter(
            booking_system=booking_system,
            date=date_obj,
            time__gte=start_time,
            time__lt=end_time
        ).exists()

        if overlapping_timeslots:
            return Response(
                {"error: Timeslots already exist within the specified start_time and end_time for this date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate timeslots
        current_time = start_datetime
        timeslots = []

        while current_time <= end_datetime:
            timeslots.append(TimeSlot(
                booking_system=booking_system,
                date=date_obj,
                time=current_time.time(),
                max_people=max_people,
                max_tables=max_tables,
                min=min_people,
                max=max_people_allowed,
            ))
            current_time += timedelta(minutes=interval_minutes)

        # Save timeslots in bulk
        TimeSlot.objects.bulk_create(timeslots)

        return Response(
            {"details:" f"Successfully created {len(timeslots)} timeslots."},
            status=status.HTTP_201_CREATED
        )
