# api/views/dish/dish_views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import OrderingFilter,  SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied
from api.models.dish import Dish
from api.serializers.dish import DishSerializer
from api.pagination import DefaultPagination
from api.permissions import IsRestaurantAccount

class ListDishView(generics.ListAPIView):
    serializer_class = DishSerializer
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = [
        'name',
        'description',
        'categories__name',
        'course__name',
    ]
    filterset_fields = [
        "course", 
        "categories", 
        "restaurant",  
        "restaurant__country",  
        "restaurant__city",    
        "restaurant__state",]
    ordering_fields = ["name", "created_at", "like_count", "dislike_count", "favorites_count"]
    ordering = ["-weekly_like_count"]  # Default ordering

    def get_queryset(self):
        user = self.request.user
        # If the user is a restaurant, show only their dishes
        if user.user_type == 'restaurant':
            return Dish.objects.filter(restaurant__owner=user).prefetch_related("categories", "restaurant", "course")
        # Otherwise, show all dishes
        return Dish.objects.all().prefetch_related("categories", "restaurant", "course")

class GetRestaurantDishView(generics.ListAPIView):
    serializer_class = DishSerializer
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination
    filter_backends = [DjangoFilterBackend, OrderingFilter]

    # Example filter and ordering fields (reuse or adjust as needed)
    filterset_fields = ["course", "categories"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        restaurant_id = self.kwargs.get("pk")
        user = self.request.user

        # Ensure that the user has permission to view this restaurant's dishes
        if user.user_type == 'restaurant' and not user.restaurants.filter(pk=restaurant_id).exists():
            raise PermissionDenied({"detail": "You are not allowed to view dishes for this restaurant or restaurant does not exist."})

        return Dish.objects.filter(restaurant_id=restaurant_id).prefetch_related("categories", "restaurant", "course")

class GetDishView(generics.RetrieveAPIView):
    serializer_class = DishSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        # If user is a restaurant, they can only retrieve their own dishes
        if user.user_type == 'restaurant':
            return Dish.objects.filter(restaurant__owner=user)
        return Dish.objects.all()

class CreateDishView(generics.CreateAPIView):
    serializer_class = DishSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def perform_create(self, serializer):
        # `IsRestaurantAccount` ensures only restaurants can create dishes
        restaurant_id = self.kwargs.get("pk")
        user = self.request.user
        
        # Ensure the restaurant exists
        if not user.restaurants.filter(pk=restaurant_id).exists():
            raise PermissionDenied({"detail": "You are not allowed to add dishes to this restaurant or restaurant does not exist."})

        # Save the dish with the corresponding restaurant
        serializer.save(restaurant_id=restaurant_id)

class UpdateDishView(generics.UpdateAPIView):
    serializer_class = DishSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        # Only the dish's owner restaurant can update
        return Dish.objects.filter(restaurant__owner=self.request.user)

class DeleteDishView(generics.DestroyAPIView):
    serializer_class = DishSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        # Only the dish's owner restaurant can delete
        return Dish.objects.filter(restaurant__owner=self.request.user)
