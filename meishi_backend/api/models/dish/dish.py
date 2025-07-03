import os
import uuid
from django.db import models
from api.models.restaurant import Restaurant
from api.models.dish.course import Course
from api.models.dish.category import Category
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import F

# Function to define the upload path for dish images
def dish_image_upload_path(instance, filename):
    # Extract the file extension
    ext = filename.split('.')[-1]
    # Generate a unique filename using UUID
    unique_filename = f"{uuid.uuid4()}.{ext}"
    # Return the path to the image file
    return os.path.join("dish_images", unique_filename)

class Dish(models.Model):
    name = models.CharField(max_length=30, null=False, blank=False)
    description = models.TextField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="dishes")
    type = models.CharField(max_length=20, null=False, blank=False) 
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, related_name="dishes", null=True)
    categories = models.ManyToManyField(Category,related_name="dishes", blank=False)
    image = models.ImageField(upload_to=dish_image_upload_path, blank=True, null=True)
    
    # Count fields
    favorites_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    dislike_count = models.PositiveIntegerField(default=0)
    weekly_like_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-created_at']
        
        indexes = [
            models.Index(fields=['restaurant']),
            models.Index(fields=['like_count']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

    def save(self, *args, **kwargs):
        # Delete the old image file if it is replaced
        if self.pk:
            old_instance = Dish.objects.get(pk=self.pk)
            if old_instance.image and old_instance.image != self.image:
                old_instance.image.delete(save=False)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Delete the image file when the instance is deleted
        if self.image:
            self.image.delete(save=False)
        super().delete(*args, **kwargs)
    
    def increment_favorites_count(self):
        # Increase favorites_count by 1 atomically
        Dish.objects.filter(pk=self.pk).update(
            favorites_count=F('favorites_count') + 1
        )
        self.refresh_from_db()

    def decrement_favorites_count(self):
        # Decrease favorites_count by 1 atomically
        Dish.objects.filter(pk=self.pk).update(
            favorites_count=F('favorites_count') - 1
        )
        self.refresh_from_db()
    
    def increment_like_count(self):
        Dish.objects.filter(pk=self.pk).update(
            like_count=F('like_count') + 1
        )
        self.refresh_from_db()

    def increment_dislike_count(self):
        Dish.objects.filter(pk=self.pk).update(
            dislike_count=F('dislike_count') + 1
        )
        self.refresh_from_db()
    
    def decrement_like_count(self):
        Dish.objects.filter(pk=self.pk).update(
            like_count=F('like_count') - 1
        )
        self.refresh_from_db()

    def decrement_dislike_count(self):
        Dish.objects.filter(pk=self.pk).update(
            dislike_count=F('dislike_count') - 1
        )
        self.refresh_from_db()

    def update_favorites_count(self):
        self.favorites_count = self.dish_favorites.count()
        self.save()

    def update_like_dislike_counts(self):
        self.like_count = self.dish_likes_dislikes.filter(type='like').count()
        self.dislike_count = self.dish_likes_dislikes.filter(type='dislike').count()
        self.save()
        
    def update_weekly_like_count(self):
        last_week = now() - timedelta(days=7)
        self.weekly_like_count = self.dish_likes_dislikes.filter(type='like', created_at__gte=last_week).count()
        self.save()