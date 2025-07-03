# api/models/restaurant/favorite.py

from django.db import models
from api.models.user import CustomUser
from api.models.restaurant import Restaurant

class Favorite(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="favorites")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'restaurant'], name='unique_user_favorite')
        ]
    
    def __str__(self):
        return f"{self.user} - {self.restaurant}"