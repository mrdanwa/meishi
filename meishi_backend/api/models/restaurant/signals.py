from django.db.models.signals import pre_delete
from django.dispatch import receiver
from api.models.restaurant.restaurant import Restaurant

@receiver(pre_delete, sender=Restaurant)
def delete_restaurant_assets(sender, instance, **kwargs):
    """
    Deletes the restaurant's logo and all associated photos and their files
    when the Restaurant instance is deleted.
    """
    # Delete the restaurant's logo
    if instance.logo:
        instance.logo.delete(save=False)
    
    # Delete all photos and their files associated with the restaurant
    photos = instance.photos.all()
    for photo in photos:
        if photo.photo:
            photo.photo.delete(save=False)
