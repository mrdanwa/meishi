# api/serializers/restaurant/cuisine_serializer.py

from rest_framework import serializers
from api.models.restaurant import Cuisine

class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = ["id", "name"]
