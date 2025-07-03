# api/views/dish/like_dislike_views.py

from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from api.models.dish import DishLikeDislike, Dish
from api.serializers.dish import DishLikeDislikeSerializer, SpecificDishLikeDislikeSerializer
from api.pagination import DefaultPagination
from api.permissions import IsNormalUser
from api.models.user import CustomUser
from rest_framework.exceptions import PermissionDenied

class SpecificListDishLikeDislikeView(generics.ListAPIView):
    serializer_class = SpecificDishLikeDislikeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        dish_id = self.kwargs.get("dish_id") 
        dish = get_object_or_404(Dish, id=dish_id)
        return DishLikeDislike.objects.filter(dish_id=dish_id).select_related('user')

class ListDishLikeDislikeView(generics.ListAPIView):
    serializer_class = DishLikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]
    pagination_class = DefaultPagination
    ordering = ["-created_at"]

    def get_queryset(self):
        return DishLikeDislike.objects.filter(user=self.request.user).select_related('dish', 'user')

class CreateDishLikeDislikeView(generics.CreateAPIView):
    serializer_class = DishLikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser] 

    def perform_create(self, serializer):
        user = self.request.user
        dish = serializer.validated_data['dish']
        instance = serializer.save(user=user)
        
        if instance.type == 'like':
            dish.increment_like_count()
        elif instance.type == 'dislike':
            dish.increment_dislike_count()
                
class UpdateDishLikeDislikeView(generics.RetrieveUpdateAPIView):
    serializer_class = DishLikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser] 

    def get_queryset(self):
        return DishLikeDislike.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        # Capture the old type before saving
        old_instance = self.get_object()
        old_type = old_instance.type

        instance = serializer.save()  # new data
        new_type = instance.type
        dish = instance.dish
        
        # If type didn't change, do nothing
        if old_type == new_type:
            return

        # Decrement old type counters
        if old_type == 'like':
            dish.decrement_like_count()
        elif old_type == 'dislike':
            dish.decrement_dislike_count()

        # Increment new type counters
        if new_type == 'like':
            dish.increment_like_count()
        elif new_type == 'dislike':
            dish.increment_dislike_count()

class DeleteDishLikeDislikeView(generics.DestroyAPIView):
    serializer_class = DishLikeDislikeSerializer
    permission_classes = [IsAuthenticated, IsNormalUser] 

    def get_queryset(self):
        # User can delete only their own like/dislike
        return DishLikeDislike.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        dish = instance.dish
        
        if instance.type == 'like':
            dish.decrement_like_count()
        elif instance.type == 'dislike':
            dish.decrement_dislike_count()
        
        super().perform_destroy(instance)


