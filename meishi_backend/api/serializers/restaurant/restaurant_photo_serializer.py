from rest_framework import serializers
from api.models.restaurant.restaurant_photo import RestaurantPhoto

class RestaurantPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantPhoto
        fields = ['id', 'photo', 'created_at']
        read_only_fields = ['id', 'created_at']
