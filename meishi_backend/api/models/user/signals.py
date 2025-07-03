from django.db.models.signals import pre_delete
from django.dispatch import receiver
from api.models.user.user import CustomUser
from api.models.restaurant.restaurant import Restaurant
from api.models.dish.dish import Dish
from django.db.models import F
from django.db.models import Q

@receiver(pre_delete, sender=CustomUser)
def handle_user_deletion(sender, instance, **kwargs):
    # Delete profile image if it exists
    if instance.profile_image:
        instance.profile_image.delete(save=False)
    
    # Decrement likes, dislikes, and favorites for associated restaurants
# Retrieve restaurants associated with the user via likes/dislikes or favorites
    restaurants = Restaurant.objects.filter(
        Q(likes_dislikes__user=instance) | Q(favorites__user=instance)
    )
    for restaurant in restaurants:
        like_count_change = restaurant.likes_dislikes.filter(user=instance, type='like').count()
        dislike_count_change = restaurant.likes_dislikes.filter(user=instance, type='dislike').count()
        favorite_count_change = restaurant.favorites.filter(user=instance).count()
        
        # Update the restaurant's counts
        Restaurant.objects.filter(pk=restaurant.pk).update(
            like_count=F('like_count') - like_count_change,
            dislike_count=F('dislike_count') - dislike_count_change,
            favorites_count=F('favorites_count') - favorite_count_change
        )

    # Decrement likes, dislikes, and favorites for associated dishes
    dishes = Dish.objects.filter(
        Q(dish_likes_dislikes__user=instance) | Q(dish_favorites__user=instance)
    )
    for dish in dishes:
        like_count_change = dish.dish_likes_dislikes.filter(user=instance, type='like').count()
        dislike_count_change = dish.dish_likes_dislikes.filter(user=instance, type='dislike').count()
        favorite_count_change = dish.dish_favorites.filter(user=instance).count()
        
        # Update the dish's counts
        Dish.objects.filter(pk=dish.pk).update(
            like_count=F('like_count') - like_count_change,
            dislike_count=F('dislike_count') - dislike_count_change,
            favorites_count=F('favorites_count') - favorite_count_change
        )
