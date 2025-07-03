# api/views/booking/general_time_slot_views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from django.forms import ValidationError
from api.models.booking.general_time_slot import GeneralTimeSlot
from api.serializers.booking.general_time_slot_serializer import GeneralTimeSlotSerializer
from api.permissions import IsRestaurantAccount
from api.models.booking.booking_system import BookingSystem

class ListCreateGeneralTimeSlotView(generics.ListCreateAPIView):
    serializer_class = GeneralTimeSlotSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        # Restrict to general time slots within booking systems owned by the authenticated user's restaurants
        return GeneralTimeSlot.objects.filter(
            booking_system__restaurant__owner=self.request.user
        ).order_by('weekday', 'start_time')

    def perform_create(self, serializer):
        booking_system_id = self.request.data.get('booking_system')
        if not booking_system_id:
            raise ValidationError({"detail": "Booking System field is required."})

        booking_system = BookingSystem.objects.filter(
            id=booking_system_id, 
            restaurant__owner=self.request.user
        ).first()

        if not booking_system:
            raise ValidationError({"detail": "Invalid booking system ID or unauthorized access."})

        serializer.save(booking_system=booking_system)


class RetrieveUpdateDestroyGeneralTimeSlotView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GeneralTimeSlotSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        return GeneralTimeSlot.objects.filter(
            booking_system__restaurant__owner=self.request.user
        )
