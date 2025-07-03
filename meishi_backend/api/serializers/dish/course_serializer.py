# api/serializers/dish/course_serializer.py

from rest_framework import serializers
from api.models.dish import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["id", "name"]
