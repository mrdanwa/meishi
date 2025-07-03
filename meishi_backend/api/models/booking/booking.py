import uuid
from django.conf import settings
from django.db import models
from django.core.validators import MinValueValidator
from django.forms import ValidationError
from api.models.booking.time_slot import TimeSlot
from api.models.user import CustomUser
from api.models.booking import BookingSystem

class BookingTypes(models.Model):
    """
    Represents different types of bookings (e.g., menu, a la carte, omakase).
    """
    name = models.CharField(max_length=20, unique=True, help_text="Name of the booking type.")
    booking_system = models.ForeignKey(
        BookingSystem, 
        on_delete=models.CASCADE, 
        related_name='booking_types'
    )

    def __str__(self):
        return self.name

class Booking(models.Model):
    """
    Represents a single booking record with basic model-level validation.
    Primary validation is handled by the BookingSerializer.
    """
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('arrived', 'Arrived'),
        ('dessert', 'Dessert'),
        ('bill', 'Bill'),
        ('clean', 'Clean'),
        ('noshow', 'No Show'),
        ('gone', 'Gone'),
        ('canceled', 'Canceled'),
    ]
    
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='bookings',
        help_text="The user who created the booking (if authenticated)."
    )
    
    booking_code = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text="Unique code for unauthenticated users to manage the booking."
    )
    
    time_slot = models.ForeignKey(
        TimeSlot,
        on_delete=models.CASCADE,
        related_name='bookings',
        help_text="The specific time slot for this booking."
    )
    
    booking_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="The type of booking (e.g., menu, a la carte, omakase)."
    )
    
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=30, blank=True)
    people = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    phone = models.CharField(max_length=15, blank=True)
    email = models.EmailField(blank=True)
    notes = models.TextField(blank=True, max_length=50)
    
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='confirmed',
        help_text="The current status of the booking."
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['time_slot']),
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['user']),
            models.Index(fields=['booking_code']),
            models.Index(fields=['first_name', 'last_name', 'booking_code']),
        ]

    def clean(self):
        """
        Basic model-level validation for data integrity.
        Primary validation logic is in BookingSerializer.
        """
        super().clean()
        
        if not self.time_slot:
            raise ValidationError({"time_slot": "Time slot is required."})
        
        if self.people < 1:
            raise ValidationError({"people": "Number of people must be at least 1."})
            
        # Convert booking_code to UUID if provided as string
        if isinstance(self.booking_code, str):
            try:
                self.booking_code = uuid.UUID(self.booking_code)
            except ValueError:
                raise ValidationError({"booking_code": "Invalid UUID format."})

    def __str__(self):
        return f"Booking({self.first_name} {self.last_name} - {self.people} people @ {self.time_slot})"