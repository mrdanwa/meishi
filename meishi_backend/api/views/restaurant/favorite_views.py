# api/views/restaurant/favorite_views.py

from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from api.models.restaurant import Favorite
from api.serializers.restaurant import FavoriteSerializer
from api.pagination import DefaultPagination
from api.permissions import IsNormalUser
from api.models import CustomUser
from rest_framework.exceptions import PermissionDenied

class ListFavoriteView(generics.ListAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]
    pagination_class = DefaultPagination  
    ordering = ["-created_at"]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user).select_related('restaurant', 'user')
    
class CreateFavoriteView(generics.CreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]

    def perform_create(self, serializer):
        # Since `IsNormalUser` ensures only normal users reach here, no need to check user type
        restaurant = serializer.validated_data['restaurant']
        serializer.save(user=self.request.user)
        restaurant.increment_favorites_count()

class DeleteFavoriteView(generics.DestroyAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        restaurant = instance.restaurant  # Access the associated restaurant
        super().perform_destroy(instance)  # Perform the deletion
        restaurant.decrement_favorites_count()  # Update the favorites count after deletion