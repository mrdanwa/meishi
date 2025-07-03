# api/serializers/dish/like_dislike_serializer.py

from rest_framework import serializers
from api.models.dish import DishLikeDislike
from api.serializers.dish import DishSerializer
from api.serializers.user import UserPublicSerializer

class DishLikeDislikeSerializer(serializers.ModelSerializer):
    dish_details = DishSerializer(read_only=True, source='dish')
    
    class Meta:
        model = DishLikeDislike
        fields = ["id", "user", "dish", "dish_details", "type", "created_at"]
        read_only_fields = ["user", "created_at"]

    def validate(self, attrs):
        user = self.context["request"].user

        # For updates
        if self.instance:
            new_type = attrs.get("type", None)
            if self.instance.type == new_type:
                raise serializers.ValidationError({"detail": "No change detected; already set to this value."})
        else:
            # For creation
            dish = attrs.get("dish")
            if not dish:
                raise serializers.ValidationError({"detail": "Dish is required."})
            
            # Check for existing reaction
            if DishLikeDislike.objects.filter(user=user, dish=dish).exists():
                raise serializers.ValidationError({"detail": "You have already reacted to this dish."})

        return attrs

class SpecificDishLikeDislikeSerializer(serializers.ModelSerializer):
    user = UserPublicSerializer(read_only=True)
    is_like = serializers.SerializerMethodField()

    class Meta:
        model = DishLikeDislike
        fields = ['user', 'is_like']

    def get_is_like(self, obj):
        return obj.type == 'like' 