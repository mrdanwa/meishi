# api/serializers/dish/favorite_serializer.py

from rest_framework import serializers
from api.models.dish import DishFavorite
from api.serializers.dish import DishSerializer

class DishFavoriteSerializer(serializers.ModelSerializer):
    dish_details = DishSerializer(read_only=True, source='dish')
    
    class Meta:
        model = DishFavorite
        fields = ["id", "user", "dish", "dish_details", "created_at"]
        read_only_fields = ["user", "created_at"]

    def validate(self, attrs):
        # Ensure user hasn't already favorited this dish
        user = self.context["request"].user
        dish = attrs.get("dish")
        
        if not dish:
            raise serializers.ValidationError({"detail": "Dish is required."})
        
        # Check for existing favorite record
        if DishFavorite.objects.filter(user=user, dish=dish).exists():
            raise serializers.ValidationError({"detail": "You have already favorited this dish."})
        
        return attrs