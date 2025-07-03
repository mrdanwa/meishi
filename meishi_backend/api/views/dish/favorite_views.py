from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from api.models.dish import DishFavorite
from api.serializers.dish import DishFavoriteSerializer
from api.pagination import DefaultPagination
from api.permissions import IsNormalUser
from api.models import CustomUser
from rest_framework.exceptions import PermissionDenied

class ListDishFavoriteView(generics.ListAPIView):
    serializer_class = DishFavoriteSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]
    pagination_class = DefaultPagination
    ordering = ["-created_at"]

    def get_queryset(self):
        return DishFavorite.objects.filter(user=self.request.user).select_related('dish', 'user')

class CreateDishFavoriteView(generics.CreateAPIView):
    serializer_class = DishFavoriteSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]

    def perform_create(self, serializer):
        # Since `IsNormalUser` ensures only normal users reach here, no need to check user type
        dish = serializer.validated_data['dish']
        serializer.save(user=self.request.user)
        dish.increment_favorites_count()

class DeleteDishFavoriteView(generics.DestroyAPIView):
    serializer_class = DishFavoriteSerializer
    permission_classes = [IsAuthenticated, IsNormalUser]

    def get_queryset(self):
        # User can delete only their own favorites
        return DishFavorite.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        dish = instance.dish
        super().perform_destroy(instance)
        dish.decrement_favorites_count()