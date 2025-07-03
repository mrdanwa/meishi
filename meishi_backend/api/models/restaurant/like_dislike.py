# api/models/restaurant/like_dislike.py

from django.db import models
from api.models.user import CustomUser
from api.models.restaurant import Restaurant

class LikeDislike(models.Model):
    LIKE = 'like'
    DISLIKE = 'dislike'
    CHOICES = [
        (LIKE, 'Like'),
        (DISLIKE, 'Dislike'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="likes_dislikes")
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="likes_dislikes")
    type = models.CharField(max_length=10, choices=CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'restaurant'], name='unique_user_like_dislike')
        ]
        
    def __str__(self):
        return f"{self.user} - {self.type} - {self.restaurant}"