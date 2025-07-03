# api/models/booking/general_time_slot.py
from django.db import models
from api.models.booking.booking_system import BookingSystem
from django.core.exceptions import ValidationError
from datetime import datetime

WEEKDAY_CHOICES = (
    (0, 'Monday'),
    (1, 'Tuesday'),
    (2, 'Wednesday'),
    (3, 'Thursday'),
    (4, 'Friday'),
    (5, 'Saturday'),
    (6, 'Sunday'),
)

class GeneralTimeSlot(models.Model):
    """
    Represents a recurring time slot for a booking system.
    Primary validation is handled by GeneralTimeSlotSerializer.
    """
    booking_system = models.ForeignKey(
        BookingSystem, 
        on_delete=models.CASCADE,
        related_name='general_time_slots'
    )
    weekday = models.IntegerField(
        choices=WEEKDAY_CHOICES,
        help_text="0=Monday, ... 6=Sunday"
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    interval_minutes = models.PositiveIntegerField(
        help_text="Interval between timeslots in minutes."
    )
    max_people = models.PositiveIntegerField(
        default=20,
        help_text="Maximum total number of people allowed in this time slot."
    )
    max_tables = models.PositiveIntegerField(
        default=5,
        help_text="Maximum number of tables allowed in this time slot."
    )
    min = models.PositiveIntegerField(
        default=1,
        help_text="Minimum number of people per booking allowed in this time slot."
    )
    max = models.PositiveIntegerField(
        default=8,
        help_text="Maximum number of people per booking allowed in this time slot."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["booking_system", "weekday"]),
        ]

    def clean(self):
        """
        Basic model-level validation for data integrity.
        Primary validation logic is in GeneralTimeSlotSerializer.
        """
        super().clean()
        
        # Convert strings to time objects if necessary
        if isinstance(self.start_time, str):
            try:
                self.start_time = datetime.strptime(self.start_time, "%H:%M:%S").time()
            except ValueError:
                raise ValidationError({"start_time": "Invalid time format. Use HH:MM:SS."})
                
        if isinstance(self.end_time, str):
            try:
                self.end_time = datetime.strptime(self.end_time, "%H:%M:%S").time()
            except ValueError:
                raise ValidationError({"end_time": "Invalid time format. Use HH:MM:SS."})

    def __str__(self):
        return (
            f"{self.booking_system.meal_type} - "
        )
