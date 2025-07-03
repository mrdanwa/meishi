# backend/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from api.views.user import CreateUserView, UpdateUserView, DeleteUserView, GetUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework.permissions import AllowAny

schema_view = get_schema_view(
    openapi.Info(
        title="API",
        default_version="v1",
        description="User API",
    ),
    public=True,
    permission_classes=(AllowAny,), 
)                    

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/user/", GetUserView.as_view(), name="get-user"),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/users/<int:pk>/update/", UpdateUserView.as_view(), name="update-user"),
    path("api/users/<int:pk>/delete/", DeleteUserView.as_view(), name="delete-user"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
    
    path("swagger/", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)