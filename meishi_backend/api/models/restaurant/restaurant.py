# api/models/restaurant/restaurant.py

import os
import uuid
from django.db import models
from api.models.user.user import CustomUser
from api.models.restaurant.cuisine import Cuisine
from datetime import timedelta
from django.utils.timezone import now
from django.db.models import F

def restaurant_logo_upload_path(instance, filename):
    # Extract the file extension
    ext = filename.split('.')[-1]
    # Generate a unique filename using UUID
    unique_filename = f"{uuid.uuid4()}.{ext}"
    # Return the path to the logo file
    return os.path.join("restaurant_logos", unique_filename)

class Restaurant(models.Model):
    
    name = models.CharField(max_length=25)
    description = models.TextField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="restaurants")
    
    # Address fields
    country = models.CharField(max_length=25, blank=False, null=False)
    state = models.CharField(max_length=25, blank=False, null=False)
    city = models.CharField(max_length=25, blank=False, null=False)
    street = models.CharField(max_length=100, blank=False, null=False)
    postal = models.CharField(max_length=15, blank=False, null=False)
    latitude = models.FloatField(blank=False, null=False)
    longitude = models.FloatField(blank=False, null=False)
    
    # Contact fields
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    website_link = models.URLField(blank=True, null=True)
    social_media_link = models.URLField(blank=True, null=True)
    maps_link = models.URLField(blank=True, null=True)
    
    # Cuisine and logo
    cuisine = models.ForeignKey(Cuisine, on_delete=models.SET_NULL, null=True, related_name="restaurants")
    logo = models.ImageField(upload_to=restaurant_logo_upload_path, blank=True, null=True)
    
    # Additional fields
    timezone = models.CharField(max_length=15, blank=False, null=False)
    favorites_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    dislike_count = models.PositiveIntegerField(default=0)
    weekly_like_count = models.PositiveIntegerField(default=0)
    currency = models.CharField(max_length=3, default="€")
    
    class Meta:
        ordering = ['-created_at']
        
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['like_count']),
        ]

    def __str__(self):
        return f"{self.name} - {self.owner.username}"
    
    def save(self, *args, **kwargs):
        # Delete the old logo file if it is replaced
        if self.pk:
            old_instance = Restaurant.objects.get(pk=self.pk)
            if old_instance.logo and old_instance.logo != self.logo:
                old_instance.logo.delete(save=False)
        super().save(*args, **kwargs)
        
    def delete(self, *args, **kwargs):
        # Delete the logo file when the instance is deleted
        if self.logo:
            self.logo.delete(save=False)
        super().delete(*args, **kwargs)
    
    def increment_favorites_count(self):
        # Increase favorites_count by 1 atomically
        Restaurant.objects.filter(pk=self.pk).update(
            favorites_count=F('favorites_count') + 1
        )
        self.refresh_from_db()

    def decrement_favorites_count(self):
        # Decrease favorites_count by 1 atomically
        Restaurant.objects.filter(pk=self.pk).update(
            favorites_count=F('favorites_count') - 1
        )
        self.refresh_from_db()
    
    def increment_like_count(self):
        Restaurant.objects.filter(pk=self.pk).update(
            like_count=F('like_count') + 1
        )
        self.refresh_from_db()

    def increment_dislike_count(self):
        Restaurant.objects.filter(pk=self.pk).update(
            dislike_count=F('dislike_count') + 1
        )
        self.refresh_from_db()
    
    def decrement_like_count(self):
        Restaurant.objects.filter(pk=self.pk).update(
            like_count=F('like_count') - 1
        )
        self.refresh_from_db()

    def decrement_dislike_count(self):
        Restaurant.objects.filter(pk=self.pk).update(
            dislike_count=F('dislike_count') - 1
        )
        self.refresh_from_db()
    
    def update_favorites_count(self):
        self.favorites_count = self.favorites.count()
        self.save()
    
    def update_like_dislike_counts(self):
        self.like_count = self.likes_dislikes.filter(type='like').count()
        self.dislike_count = self.likes_dislikes.filter(type='dislike').count()
        self.save()

    def update_weekly_like_count(self):
        last_week = now() - timedelta(days=7)
        self.weekly_like_count = self.likes_dislikes.filter(type='like', created_at__gte=last_week).count()
        self.save()
