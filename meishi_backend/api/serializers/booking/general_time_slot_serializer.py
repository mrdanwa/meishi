# api/serializers/booking/general_time_slot_serializer.py
from rest_framework import serializers
from api.models.booking.general_time_slot import GeneralTimeSlot
from django.db.models import Q
from datetime import datetime

class GeneralTimeSlotSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)

    class Meta:
        model = GeneralTimeSlot
        fields = [
            'id',
            'booking_system',
            'weekday',
            'weekday_display',
            'start_time',
            'end_time',
            'interval_minutes',
            'max_people',
            'max_tables',
            'min',
            'max',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

    def validate_start_time(self, value):
        """Validate start_time format if provided as string"""
        if isinstance(value, str):
            try:
                return datetime.strptime(value, "%H:%M:%S").time()
            except ValueError:
                raise serializers.ValidationError("Invalid time format. Use HH:MM:SS.")
        return value

    def validate_end_time(self, value):
        """Validate end_time format if provided as string"""
        if isinstance(value, str):
            try:
                return datetime.strptime(value, "%H:%M:%S").time()
            except ValueError:
                raise serializers.ValidationError("Invalid time format. Use HH:MM:SS.")
        return value

    def validate(self, attrs):
        """
        Comprehensive validation of general time slot data.
        """
        # Get required fields
        booking_system = attrs.get('booking_system')
        weekday = attrs.get('weekday')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        interval_minutes = attrs.get('interval_minutes')
        min_people = attrs.get('min')
        max_people = attrs.get('max')

        # Validate min/max people
        if min_people and max_people and min_people > max_people:
            raise serializers.ValidationError({
                "min": "Minimum number of people must be less than or equal to maximum number of people."
            })

        # Validate time range
        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError({
                "start_time": "Start time must be before end time."
            })

        # Validate interval
        if start_time and end_time and interval_minutes:
            total_minutes = (
                (end_time.hour * 60 + end_time.minute) -
                (start_time.hour * 60 + start_time.minute)
            )
            if interval_minutes > total_minutes:
                raise serializers.ValidationError({
                    "interval_minutes": "Interval minutes cannot exceed the total time range."
                })

        # Check for overlapping time slots
        if booking_system and weekday and start_time and end_time:
            overlapping_times = GeneralTimeSlot.objects.filter(
                booking_system=booking_system,
                weekday=weekday,
            ).exclude(id=self.instance.id if self.instance else None).filter(
                Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
            )
            if overlapping_times.exists():
                raise serializers.ValidationError({
                    "time_slot": "Time slots cannot overlap with existing slots."
                })

        return attrs