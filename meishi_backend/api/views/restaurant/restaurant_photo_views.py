# api/views/restaurant/restaurant_photo_views.py

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from api.models.restaurant import RestaurantPhoto
from api.models.restaurant import Restaurant
from api.serializers.restaurant import RestaurantPhotoSerializer

class ListCreateRestaurantPhotoView(generics.ListCreateAPIView):
    """
    GET: List all photos for a given restaurant.
    POST: Create a new photo for a restaurant (if < 20 photos exist).
    """
    serializer_class = RestaurantPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # We fetch the restaurant ID from the URL (e.g. /restaurants/<restaurant_id>/photos/)
        restaurant_id = self.kwargs['restaurant_id']
        # Make sure the user either owns the restaurant if they're a 'restaurant' type
        # or is otherwise allowed to view it. Adjust logic as needed for your app.
        return RestaurantPhoto.objects.filter(restaurant_id=restaurant_id)

    def perform_create(self, serializer):
        restaurant_id = self.kwargs['restaurant_id']
        restaurant = get_object_or_404(Restaurant, pk=restaurant_id)

        # If the user is a restaurant owner, ensure they own this restaurant
        if self.request.user.user_type == 'restaurant':
            if restaurant.owner != self.request.user:
                raise ValidationError({"detail":" You do not have permission to upload photos for this restaurant."})

        # Check how many photos already exist for this restaurant
        existing_photos_count = RestaurantPhoto.objects.filter(restaurant=restaurant).count()
        if existing_photos_count >= 20:
            raise ValidationError({"detail": "You can only upload up to 20 photos for a single restaurant."})

        # If all checks pass, save
        serializer.save(restaurant=restaurant)

class RetrieveUpdateDestroyRestaurantPhotoView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific photo.
    """
    serializer_class = RestaurantPhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Similarly ensure correct restaurant ownership if needed
        return RestaurantPhoto.objects.all()

    def perform_update(self, serializer):
        # (Optional) If you want to restrict updating photos to the restaurant owner
        photo = self.get_object()
        if self.request.user.user_type == 'restaurant':
            if photo.restaurant.owner != self.request.user:
                raise ValidationError({"detail": "You do not have permission to update this photo."})
        serializer.save()

    def perform_destroy(self, instance):
        # (Optional) Check permission
        if self.request.user.user_type == 'restaurant':
            if instance.restaurant.owner != self.request.user:
                raise ValidationError({"detail": "You do not have permission to delete this photo."})
        instance.delete()
