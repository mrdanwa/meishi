# api/views/restaurant/restaurant_views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from api.models.restaurant import Restaurant
from api.serializers.restaurant import RestaurantSerializer
from api.permissions import IsRestaurantAccount
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from api.pagination import DefaultPagination

class ListRestaurantView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]
    pagination_class = DefaultPagination  
    filter_backends = [SearchFilter, DjangoFilterBackend, OrderingFilter]
    search_fields = [
        'name',
        'description',
        'country',
        'state',
        'city',
        'street',
        'cuisine__name', 
    ]
    filterset_fields = ["name", "country", "state", "city", "cuisine"]
    ordering_fields = ["name", "created_at", "like_count", "dislike_count", "favorites_count"]
    ordering = ["-weekly_like_count"]  # Default ordering

    def get_queryset(self):
        if self.request.user.user_type == 'restaurant':
            return Restaurant.objects.filter(owner=self.request.user).select_related('cuisine', 'owner')
        return Restaurant.objects.all().select_related('cuisine', 'owner')

class GetRestaurantView(generics.RetrieveAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.user_type == 'restaurant':
            return Restaurant.objects.filter(owner=self.request.user)
        return Restaurant.objects.all()

class CreateRestaurantView(generics.CreateAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def perform_create(self, serializer):
        # Since permission ensures only restaurant accounts reach here, we simply save
        serializer.save(owner=self.request.user)

class UpdateRestaurantView(generics.UpdateAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        # Ensured that only restaurant accounts can update their own restaurants
        return Restaurant.objects.filter(owner=self.request.user)

class DeleteRestaurantView(generics.DestroyAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def get_queryset(self):
        # Ensured that only restaurant accounts can delete their own restaurants
        return Restaurant.objects.filter(owner=self.request.user)

