# api/models/booking/time_slot.py
from django.db import models
from django.forms import ValidationError
from api.models.booking.booking_system import BookingSystem

class TimeSlot(models.Model):
    """
    Represents a specific time slot for bookings.
    Primary validation is handled by TimeSlotSerializer.
    """
    booking_system = models.ForeignKey(
        BookingSystem, 
        on_delete=models.CASCADE,
        related_name='time_slots'
    )
    general_timeslot = models.ForeignKey(
        "api.GeneralTimeSlot",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='time_slots',
        help_text="Reference to the GeneralTimeSlot that spawned this TimeSlot."
    )
    time = models.TimeField(
        null=False,
        help_text="The time of the day for this timeslot."
    )
    date = models.DateField(
        null=False,
        help_text="The date of this timeslot."
    )
    is_open = models.BooleanField(
        default=True,
        help_text="Is this timeslot open for bookings?"
    )
    max_people = models.PositiveIntegerField(
        default=20,
        help_text="Maximum total number of people allowed in this timeslot."
    )
    max_tables = models.PositiveIntegerField(
        default=5,
        help_text="Maximum number of tables allowed in this timeslot."
    )
    min = models.PositiveIntegerField(
        default=1,
        help_text="Minimum number of people allowed in this timeslot."
    )
    max = models.PositiveIntegerField(
        default=20,
        help_text="Maximum number of people allowed in this timeslot."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('booking_system', 'date', 'time')
        indexes = [
            models.Index(fields=['booking_system', 'date']),
            models.Index(fields=['is_open']),
        ]

    def delete(self, *args, **kwargs):
        """
        Prevent deletion of a time slot if there are associated bookings.
        """
        if self.bookings.exists():
            raise ValidationError("Cannot delete this time slot as it has associated bookings.")
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.booking_system} @ {self.date} - {self.time}"