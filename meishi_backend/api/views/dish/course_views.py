# api/views/dish/course_views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from api.models.dish import Course
from api.serializers.dish import CourseSerializer
from api.permissions import IsSuperUser

class ListCreateCourseView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSuperUser()]
        return super().get_permissions()

class DeleteCourseView(generics.DestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsSuperUser]
