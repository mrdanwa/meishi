# api/serializers/booking/time_slot_serializer.py
from rest_framework import serializers
from api.models.booking.time_slot import TimeSlot
from django.db import transaction

class TimeSlotSerializer(serializers.ModelSerializer):
    current_booked_people = serializers.SerializerMethodField()
    current_number_of_tables = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = [
            'id',
            'booking_system',
            'time',
            'date',
            'is_open',
            'max_people',
            'max_tables',
            'min',
            'max',
            'created_at',
            'current_booked_people',
            'current_number_of_tables',
        ]
        read_only_fields = [
            'id', 
            'created_at', 
            'current_booked_people', 
            'current_number_of_tables'
        ]

    def validate(self, attrs):
        """
        Comprehensive validation of time slot data.
        """
        # Get values, handling both creation and update cases
        instance = self.instance
        booking_system = attrs.get('booking_system', instance.booking_system if instance else None)
        date = attrs.get('date', instance.date if instance else None)
        time = attrs.get('time', instance.time if instance else None)
        min_people = attrs.get('min', instance.min if instance else None)
        max_people = attrs.get('max', instance.max if instance else None)
        slot_max_people = attrs.get('max_people', instance.max_people if instance else None)

        # Validate min/max people constraints
        if min_people and max_people and min_people > max_people:
            raise serializers.ValidationError({
                "min": "Minimum number of people must be less than or equal to maximum number of people."
            })

        # Validate max_people against max
        if slot_max_people and max_people and slot_max_people < max_people:
            raise serializers.ValidationError({
                "max_people": "max_people must be greater than or equal to max."
            })

        # Check for overlapping time slots
        if booking_system and date and time:
            overlapping_time = TimeSlot.objects.filter(
                booking_system=booking_system,
                date=date,
                time=time
            ).exclude(id=instance.id if instance else None).exists()

            if overlapping_time:
                raise serializers.ValidationError({
                    "time": "A timeslot with the same time already exists for this BookingSystem on this date."
                })

        return attrs

    def get_current_booked_people(self, obj):
        """
        Calculate the total number of booked people for this time slot,
        excluding canceled bookings.
        """
        return sum(booking.people for booking in obj.bookings.exclude(status="canceled"))

    def get_current_number_of_tables(self, obj):
        """
        Calculate the total number of booked tables for this time slot,
        excluding canceled bookings.
        For simplicity, each booking is assumed to occupy one table.
        """
        return obj.bookings.exclude(status="canceled").count()

    def create(self, validated_data):
        with transaction.atomic():
            instance = TimeSlot.objects.create(**validated_data)
            return instance

    def update(self, instance, validated_data):
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance

class CustomerTimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = [
            'id',
            'booking_system',
            'time',
            'date',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']