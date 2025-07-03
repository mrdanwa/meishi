# api/views/booking_system/booking_system_views.py

from django.forms import ValidationError
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.permissions import IsRestaurantAccount
from api.models.booking.booking_system import BookingSystem
from api.models.restaurant import Restaurant
from api.serializers.booking.booking_system_serializer import BookingSystemSerializer

class ListCreateBookingSystemView(generics.ListCreateAPIView):
    serializer_class = BookingSystemSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        # Restrict to booking systems owned by the authenticated user's restaurants
        return BookingSystem.objects.filter(restaurant__owner=self.request.user)

    def perform_create(self, serializer):
        # Validate that the restaurant belongs to the authenticated user
        restaurant_id = self.request.data.get('restaurant')
        try:
            restaurant = Restaurant.objects.get(id=restaurant_id, owner=self.request.user)
        except Restaurant.DoesNotExist:
            raise ValidationError({"detail": "Invalid restaurant ID or unauthorized access."})
        serializer.save(restaurant=restaurant)

class RetrieveUpdateDestroyBookingSystemView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSystemSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        return BookingSystem.objects.filter(
            restaurant__owner=self.request.user
        )

class PauseBookingSystemView(APIView):
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def post(self, request, pk):
        try:
            # Restrict pausing to booking systems owned by the user's restaurants
            booking_system = BookingSystem.objects.get(
                pk=pk, 
                restaurant__owner=request.user
            )
            booking_system.pause()
            return Response({"detail": "Booking system paused successfully."}, status=status.HTTP_200_OK)
        except BookingSystem.DoesNotExist:
            return Response(
                {"detail": "Booking system not found or unauthorized access."}, 
                status=status.HTTP_404_NOT_FOUND
            )

class ResumeBookingSystemView(APIView):
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def post(self, request, pk):
        try:
            # Restrict resuming to booking systems owned by the user's restaurants
            booking_system = BookingSystem.objects.get(
                pk=pk, 
                restaurant__owner=request.user
            )
            booking_system.resume()
            return Response({"detail": "Booking system resumed successfully."}, status=status.HTTP_200_OK)
        except BookingSystem.DoesNotExist:
            return Response(
                {"detail": "Booking system not found or unauthorized access."}, 
                status=status.HTTP_404_NOT_FOUND
            )
