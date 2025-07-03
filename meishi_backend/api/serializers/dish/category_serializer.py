# api/serializers/dish/category_serializer.py

from rest_framework import serializers
from api.models.dish import Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]