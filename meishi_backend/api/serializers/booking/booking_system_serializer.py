# api/serializers/booking/booking_system_serializer.py

from rest_framework import serializers
from api.models.booking.booking_system import BookingSystem

class BookingSystemSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingSystem
        fields = [
            'id',
            'restaurant',
            'meal_type',
            'is_paused',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
