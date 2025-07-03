# api/serializers/dish/dish_serializer.py

from rest_framework import serializers
from api.models.dish import Dish, DishFavorite, DishLikeDislike
from api.serializers.dish import CourseSerializer
from api.serializers.dish import CategorySerializer
from api.models.dish import Course
from api.models.dish import Category

class DishSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    course_id = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source="course", write_only=True, required=False
    )
    # Many-to-many for categories
    categories = CategorySerializer(many=True, read_only=True)
    category_ids = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        many=True,
        required=False,
        source="categories"
    )
    favorite_details = serializers.SerializerMethodField()
    like_dislike_details = serializers.SerializerMethodField()
    currency = serializers.SerializerMethodField()
    restaurant_name = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    country = serializers.SerializerMethodField()
    restaurant = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Dish
        fields = [
            "id", "name", "description", "price", "created_at", "restaurant", "course", "course_id",
            "categories", "category_ids", "type", "image", "favorites_count", "like_count", 
            "dislike_count", "favorite_details", "like_dislike_details", "weekly_like_count", "currency", "city", "country", "restaurant_name"
        ]
        extra_kwargs = {
            "restaurant": {"read_only": True},  # Set automatically in view
            "favorites_count": {"read_only": True},
            "like_count": {"read_only": True},
            "dislike_count": {"read_only": True},
            "weekly_like_count": {"read_only": True},
            "is_favorite": {"read_only": True},
            "is_like": {"read_only": True},
            "is_dislike": {"read_only": True},
        }
    
    def get_favorite_details(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            favorite = DishFavorite.objects.filter(user=user, dish=obj).first()
            return {
                "is_favorite": bool(favorite),
                "favorite_id": favorite.id if favorite else None
            }
        return {"is_favorite": False, "favorite_id": None}

    def get_like_dislike_details(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            like_dislike = DishLikeDislike.objects.filter(user=user, dish=obj).first()
            if like_dislike:
                return {
                    "is_like": like_dislike.type == "like",
                    "is_dislike": like_dislike.type == "dislike",
                    "like_dislike_id": like_dislike.id
                }
        return {"is_like": False, "is_dislike": False, "like_dislike_id": None}
    
    def get_currency(self, obj):
        """
        Fetch the currency from the related restaurant.
        """
        return obj.restaurant.currency
    
    def get_restaurant_name(self, obj):
        """
        Fetch the name from the related restaurant.
        """
        return obj.restaurant.name
    
    def get_country(self, obj):
        """
        Fetch the country from the related restaurant.
        """
        return obj.restaurant.country
    
    def get_city(self, obj):
        """
        Fetch the city from the related restaurant.
        """
        return obj.restaurant.city

    def validate(self, data):
        request = self.context.get('request')
        if request and request.method == "POST":
            if not data.get("name"):
                raise serializers.ValidationError({"name": "Dish name is required."})
        return data
