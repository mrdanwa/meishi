# api/serializers/restaurant/favorite_serializer.py

from rest_framework import serializers
from api.models.restaurant import Favorite
from api.serializers.restaurant import RestaurantSerializer

class FavoriteSerializer(serializers.ModelSerializer):
    restaurant_details = RestaurantSerializer(read_only=True, source='restaurant')
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'restaurant', 'restaurant_details', 'created_at']
        read_only_fields = ['user', 'created_at']
        
    def validate(self, attrs):
        user = self.context['request'].user
        restaurant = attrs.get('restaurant')
        
        if not restaurant:
            raise serializers.ValidationError({"detail": "Restaurant is required."})
        
        # Check for existing favorite record
        if Favorite.objects.filter(user=user, restaurant=restaurant).exists():
            raise serializers.ValidationError({"detail": "You have already favorited this restaurant."})
        
        return attrs