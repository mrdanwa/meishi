from django.db.models.signals import pre_delete
from django.dispatch import receiver
from api.models.dish.dish import Dish

@receiver(pre_delete, sender=Dish)
def delete_dish_image(sender, instance, **kwargs):
    """
    Deletes the dish's image file when the Dish instance is deleted.
    """
    if instance.image:
        instance.image.delete(save=False)
