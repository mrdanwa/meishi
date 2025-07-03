# api/models/views/restaurant/like_dislike_views.py

from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from api.models.restaurant import LikeDislike
from api.serializers.restaurant import LikeDislikeSerializer, SpecificLikeDislikeSerializer
from api.pagination import DefaultPagination
from api.permissions import IsNormalUser
from api.models import CustomUser
from api.models.restaurant import Restaurant
from rest_framework.exceptions import PermissionDenied

class SpecificListLikeDislikeView(generics.ListAPIView):
    serializer_class = SpecificLikeDislikeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        restaurant_id = self.kwargs.get("restaurant_id")
        restaurant = get_object_or_404(Restaurant, id=restaurant_id)
        return LikeDislike.objects.filter(restaurant_id=restaurant_id).select_related('restaurant', 'user')
    
class ListLikeDislikeView(generics.ListAPIView):
    serializer_class = LikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]
    pagination_class = DefaultPagination
    ordering = ["-created_at"]  # Default ordering by most recent

    def get_queryset(self):
        user = self.request.user
        return LikeDislike.objects.filter(user=self.request.user).select_related('restaurant', 'user')

class CreateLikeDislikeView(generics.CreateAPIView):
    serializer_class = LikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]

    def perform_create(self, serializer):
        user = self.request.user
        # Permission ensures only normal users can create
        restaurant = serializer.validated_data['restaurant']
        instance = serializer.save(user=user)
        
        if instance.type == 'like':
            restaurant.increment_like_count()
        elif instance.type == 'dislike':
            restaurant.increment_dislike_count()

class UpdateLikeDislikeView(generics.RetrieveUpdateAPIView):
    serializer_class = LikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]

    def get_queryset(self):
        # Restricted to likes/dislikes of the authenticated user
        return LikeDislike.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        # Capture the old type before saving
        old_instance = self.get_object()
        old_type = old_instance.type

        instance = serializer.save()  # new data
        new_type = instance.type
        restaurant = instance.restaurant
        
        # If type didn't change, do nothing
        if old_type == new_type:
            return

        # Decrement old type counters
        if old_type == 'like':
            restaurant.decrement_like_count()
        elif old_type == 'dislike':
            restaurant.decrement_dislike_count()

        # Increment new type counters
        if new_type == 'like':
            restaurant.increment_like_count()
        elif new_type == 'dislike':
            restaurant.increment_dislike_count()  

class DeleteLikeDislikeView(generics.DestroyAPIView):
    serializer_class = LikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]

    def get_queryset(self):
        # Restricted to likes/dislikes of the authenticated user
        return LikeDislike.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        restaurant = instance.restaurant  # Access the associated restaurant
        
        if instance.type == 'like':
            restaurant.decrement_like_count()
        elif instance.type == 'dislike':
            restaurant.decrement_dislike_count()
        
        super().perform_destroy(instance)  # Perform the deletion
        
