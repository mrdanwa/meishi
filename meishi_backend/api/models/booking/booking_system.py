# api/models/booking/booking_system.py

from django.db import models
from api.models.restaurant import Restaurant

MEAL_TYPE_CHOICES = (
    ('breakfast', 'Breakfast'),
    ('lunch', 'Lunch'),
    ('dinner', 'Dinner'),
    ('brunch', 'Brunch'),
    ('general', 'General'),
)

class BookingSystem(models.Model):
    restaurant = models.ForeignKey(
        Restaurant, 
        on_delete=models.CASCADE, 
        related_name='booking_systems'
    )
    meal_type = models.CharField(
        max_length=20, 
        choices=MEAL_TYPE_CHOICES, 
        default='general'
    )
    #type = models.CharField(
    #    max_length=20, 
    #    default='General'
    #)
    is_paused = models.BooleanField(
        default=False, 
        help_text="If True, new bookings are disallowed for this system."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.restaurant.name} - {self.meal_type}"
    
    class Meta:
        indexes = [
            # Add indexes if needed
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['restaurant', 'meal_type'], 
                name='unique_meal_type_per_restaurant'
            )
        ]

    def pause(self):
        """Pause this booking system (no new bookings allowed)."""
        self.is_paused = True
        self.save()

    def resume(self):
        """Resume this booking system (allow new bookings)."""
        self.is_paused = False
        self.save()
