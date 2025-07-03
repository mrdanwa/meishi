import os
import uuid
import phonenumbers
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ValidationError

def user_profile_image_upload_path(instance, filename):
    """Generate a unique file path for user profile images."""
    ext = filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join("user_profile_images", unique_filename)

class CustomUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    """
    USER_TYPE_CHOICES = (
        ('normal', 'Normal User'),
        ('restaurant', 'Restaurant Account'),
    )

    ghost = models.CharField(blank=True, null=True, max_length=10)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    profile_image = models.ImageField(
        upload_to=user_profile_image_upload_path,
        blank=True,
        null=True
    )
    country_code = models.CharField(max_length=3)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    first_name = models.CharField(max_length=20)
    last_name = models.CharField(max_length=40)

    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'phone_number', 'country_code', 'user_type']

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['email', 'user_type'], name='unique_email_per_user_type'),
            models.UniqueConstraint(fields=['country_code', 'phone_number', 'user_type'], name='unique_phone_per_user_type')
        ]
        indexes = [
            models.Index(fields=['username']),
        ]

    def clean(self):
        """Validate the phone number format using the phonenumbers library."""
        super().clean()
        full_phone_number = f"+{self.country_code}{self.phone_number}"
        try:
            parsed_number = phonenumbers.parse(full_phone_number, None)
            if not phonenumbers.is_valid_number(parsed_number):
                raise ValidationError('The phone number is not valid.')
        except phonenumbers.NumberParseException:
            raise ValidationError('The phone number format is incorrect.')

    def save(self, *args, **kwargs):
        """Ensure validation and handle profile image replacement."""
        if self.pk:
            old_instance = CustomUser.objects.filter(pk=self.pk).first()
            if old_instance and old_instance.profile_image != self.profile_image:
                old_instance.profile_image.delete(save=False)
        self.full_clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Delete profile image when the user is deleted."""
        if self.profile_image:
            self.profile_image.delete(save=False)
        super().delete(*args, **kwargs)
