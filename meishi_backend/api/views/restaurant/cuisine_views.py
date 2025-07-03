# api/views/restaurant/cuisine_views.py

from rest_framework import generics
from api.models.restaurant import Cuisine
from api.serializers.restaurant import CuisineSerializer
from api.permissions import IsSuperUser
from rest_framework.permissions import IsAuthenticatedOrReadOnly

class ListCreateCuisineView(generics.ListCreateAPIView):
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsSuperUser()]
        return super().get_permissions()

class DeleteCuisineView(generics.DestroyAPIView):
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer
    permission_classes = [IsSuperUser]
