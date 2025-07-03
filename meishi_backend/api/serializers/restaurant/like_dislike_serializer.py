# api/serializers/restaurant/like_dislike_serializer.py

from rest_framework import serializers
from api.models.restaurant import LikeDislike
from api.serializers.restaurant import RestaurantSerializer
from api.serializers.user import UserPublicSerializer

class LikeDislikeSerializer(serializers.ModelSerializer):
    restaurant_details = RestaurantSerializer(read_only=True, source='restaurant')
    
    class Meta:
        model = LikeDislike
        fields = ['id', 'user', 'restaurant', 'restaurant_details', 'type', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate(self, attrs):
        user = self.context['request'].user

        # For updates
        if self.instance:
            new_type = attrs.get("type", None)
            if self.instance.type == new_type:
                raise serializers.ValidationError({"detail": "No change detected; the type is already set to this value."})
        else:
            # For creation
            restaurant = attrs.get('restaurant')
            if not restaurant:
                raise serializers.ValidationError({"detail": "Restaurant is required."})
            
            # Check for existing record
            if LikeDislike.objects.filter(user=user, restaurant=restaurant).exists():
                raise serializers.ValidationError({"detail": "You have already reacted to this restaurant."})
        
        return attrs


class SpecificLikeDislikeSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    is_like = serializers.SerializerMethodField()

    class Meta:
        model = LikeDislike
        fields = ['user', 'is_like']

    def get_is_like(self, obj):
        return obj.type == 'like' 