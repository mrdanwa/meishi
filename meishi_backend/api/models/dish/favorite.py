# api/models/restaurant/favorite.py

from django.db import models
from api.models.user import CustomUser
from api.models.dish import Dish

class DishFavorite(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="dish_favorites")
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name="dish_favorites")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'dish'], name='unique_user_dish_favorite')
        ]
    
    def __str__(self):
        return f"{self.user} - {self.dish}"
    
    