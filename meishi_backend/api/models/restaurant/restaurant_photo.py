import os
import uuid
from django.db import models
from django.conf import settings

from api.models.restaurant.restaurant import Restaurant

def restaurant_photo_upload_path(instance, filename):
    """
    Dynamically build the upload path for restaurant photos
    using a unique filename.
    """
    ext = filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("restaurant_photos", unique_filename)

class RestaurantPhoto(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='photos'
    )
    photo = models.ImageField(upload_to=restaurant_photo_upload_path)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.pk:
            old_instance = RestaurantPhoto.objects.get(pk=self.pk)
            if old_instance.photo and old_instance.photo != self.photo:
                old_instance.photo.delete(save=False)
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        if self.photo:
            self.photo.delete(save=False)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"Photo of {self.restaurant.name} ({self.id})"
