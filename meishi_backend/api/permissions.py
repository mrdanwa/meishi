# api/permissions.py

from rest_framework.permissions import BasePermission

class IsRestaurantAccount(BasePermission):
    message = "You must be a restaurant account to access this endpoint."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated 
            and getattr(request.user, 'user_type', None) == 'restaurant'
        )

class IsNormalUser(BasePermission):
    message = "You must be a normal user to access this endpoint."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated 
            and getattr(request.user, 'user_type', None) == 'normal'
        )

class IsSuperUser(BasePermission):
    message = "Only superusers have access to this endpoint."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated 
            and request.user.is_superuser
        )
