# api/views/dish/category_views.py

from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from api.models.dish import Category
from api.serializers.dish import CategorySerializer
from api.permissions import IsSuperUser

class ListCreateCategoryView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSuperUser()]
        return super().get_permissions()

class DeleteCategoryView(generics.DestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsSuperUser]
