from django.forms import ValidationError
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied 
from api.models.user.user import CustomUser
from api.permissions import IsNormalUser
from api.serializers.user import (
    UserRegistrationSerializer,
    UserPublicSerializer,
)
from api.pagination import DefaultPagination 
from rest_framework.filters import SearchFilter


class ListUsersView(generics.ListAPIView):
    """
    List all users with pagination and the ability to search by username.
    Example usage:
        GET /api/users/?search=john
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = DefaultPagination

    # Add search functionality
    filter_backends = [SearchFilter]
    search_fields = ['username']

# --------------------- USER CRUD --------------------- #

class GetUserView(generics.RetrieveAPIView):
    """
    Retrieve details of the currently authenticated user.
    Uses UserPublicSerializer to show minimal fields.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user  # the logged-in user

class CreateUserView(generics.CreateAPIView):
    """
    Register a new user. Anyone can create an account.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

class UpdateUserView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update an existing user (self only).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user  # only allow updates to the logged-in user

class DeleteUserView(generics.DestroyAPIView):
    """
    Delete an existing user (self only).
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# --------------------- USER PROFILE --------------------- #

class UserProfileView(generics.RetrieveAPIView):
    """
    Retrieve another user's profile by their ID (pk).
    Returns minimal fields in the response.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserPublicSerializer
    permission_classes = [IsAuthenticated]
