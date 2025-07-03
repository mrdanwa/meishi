# serializers/dish/__init__.py

from .category_serializer import CategorySerializer
from .course_serializer import CourseSerializer
from .dish_serializer import DishSerializer
from .favorite_serializer import DishFavoriteSerializer
from .like_dislike_serializer import DishLikeDislikeSerializer, SpecificDishLikeDislikeSerializer
