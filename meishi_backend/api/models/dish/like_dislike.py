# api/models/dish/like_dislike.py

from django.db import models
from api.models.user import CustomUser
from api.models.dish import Dish

class DishLikeDislike(models.Model):
    LIKE = 'like'
    DISLIKE = 'dislike'
    CHOICES = [
        (LIKE, 'Like'),
        (DISLIKE, 'Dislike'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="dish_likes_dislikes")
    dish = models.ForeignKey(Dish, on_delete=models.CASCADE, related_name="dish_likes_dislikes")
    type = models.CharField(max_length=10, choices=CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'dish'], name='unique_user_dish_like_dislike')
        ]
    
    def __str__(self):
        return f"{self.user} - {self.type} - {self.dish}"
    