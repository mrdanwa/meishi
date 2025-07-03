from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from api.serializers.booking.time_slot_serializer import CustomerTimeSlotSerializer
from django.db import transaction
from api.models.booking.booking import Booking, BookingTypes
import uuid

class BookingTypeSerializer(serializers.ModelSerializer):
    """
    A serializer for the BookingTypes model.
    """
    booking_system = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = BookingTypes
        fields = ['id', 'name', 'booking_system']

class UserBookingSerializer(serializers.ModelSerializer):
    """
    A serializer for the Booking model with comprehensive validation logic.
    """
    time_slot_details = CustomerTimeSlotSerializer(read_only=True, source='time_slot')
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'booking_code',
            'time_slot',
            'time_slot_details',
            'booking_type',
            'first_name',
            'last_name',
            'people',
            'phone',
            'email',
            'notes',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 
            'time_slot_details',
            'booking_code', 
            'created_at', 
            'updated_at',
            'user'
        ]

    def validate_booking_code(self, value):
        """Validate booking_code format if provided"""
        if value and isinstance(value, str):
            try:
                return uuid.UUID(value)
            except ValueError:
                raise serializers.ValidationError("Invalid UUID format for booking_code.")
        return value

    def validate(self, attrs):
        """
        Comprehensive validation of booking data.
        """
        # Get instance for update operations
        instance = self.instance
        people = attrs.get('people', instance.people if instance else None)
        time_slot = attrs.get('time_slot', instance.time_slot if instance else None)
        
        if not time_slot:
            raise serializers.ValidationError({"time_slot": "Time slot is required."})
            
        if not people:
            raise serializers.ValidationError({"people": "Number of people is required."})

        # 1. Validate minimum and maximum people constraints
        if people < time_slot.min:
            raise serializers.ValidationError({
                "people": f"Minimum number of people for this time slot is {time_slot.min}."
            })
        
        if people > time_slot.max:
            raise serializers.ValidationError({
                "people": f"Maximum number of people for this time slot is {time_slot.max}."
            })

        # 2. Check if time slot is open
        if not time_slot.is_open:
            raise serializers.ValidationError({
                "time_slot": "This time slot is closed."
            })

        # 3. Check if booking system is paused
        if time_slot.booking_system.is_paused:
            raise serializers.ValidationError({
                "time_slot": "Bookings are paused for this booking system."
            })

        # 4. Check total capacity (max_people) for the time slot
        current_booked_people = sum(
            b.people for b in time_slot.bookings.exclude(status="canceled")
            if not instance or b.id != instance.id
        )
        if current_booked_people + people > time_slot.max_people:
            raise serializers.ValidationError({
                "people": "This time slot has reached its maximum capacity of people."
            })

        # 5. Check table capacity (max_tables)
        current_number_of_tables = (
            time_slot.bookings.exclude(status="canceled")
            .exclude(id=instance.id if instance else None)
            .count()
        )
        if current_number_of_tables >= time_slot.max_tables:
            raise serializers.ValidationError({
                "time_slot": "No more tables are available in this time slot."
            })

        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            instance = Booking(**validated_data)
            instance.save()
            return instance

    def update(self, instance, validated_data):
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance
        

class BookingSerializer(serializers.ModelSerializer):
    """
    A serializer for the Booking model with comprehensive validation logic.
    """
    time_slot_details = CustomerTimeSlotSerializer(read_only=True, source='time_slot')
    
    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'booking_code',
            'time_slot',
            'time_slot_details',
            'booking_type',
            'first_name',
            'last_name',
            'people',
            'phone',
            'email',
            'notes',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id', 
            'time_slot_details',
            'booking_code', 
            'created_at', 
            'updated_at',
            'user'
        ]

    def validate_booking_code(self, value):
        """Validate booking_code format if provided"""
        if value and isinstance(value, str):
            try:
                return uuid.UUID(value)
            except ValueError:
                raise serializers.ValidationError("Invalid UUID format for booking_code.")
        return value

    def validate(self, attrs):
        """
        Comprehensive validation of booking data.
        """
        # Get instance for update operations
        instance = self.instance
        people = attrs.get('people', instance.people if instance else None)
        time_slot = attrs.get('time_slot', instance.time_slot if instance else None)
        
        if not time_slot:
            raise serializers.ValidationError({"time_slot": "Time slot is required."})
            
        if not people:
            raise serializers.ValidationError({"people": "Number of people is required."})

        return attrs

    def create(self, validated_data):
        with transaction.atomic():
            instance = Booking(**validated_data)
            instance.save()
            return instance

    def update(self, instance, validated_data):
        with transaction.atomic():
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            return instance