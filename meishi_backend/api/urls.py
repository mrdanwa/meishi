# api/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from api.views.user import (
    UserProfileView,
    ListUsersView
)

from api.views.restaurant import (
    ListRestaurantView,
    GetRestaurantView,
    CreateRestaurantView,
    UpdateRestaurantView,
    DeleteRestaurantView,
    ListCreateCuisineView,
    DeleteCuisineView,
    ListFavoriteView,
    CreateFavoriteView,
    DeleteFavoriteView,
    SpecificListLikeDislikeView,
    ListLikeDislikeView,
    CreateLikeDislikeView,
    UpdateLikeDislikeView,
    DeleteLikeDislikeView,
    ListCreateRestaurantPhotoView,
    RetrieveUpdateDestroyRestaurantPhotoView,
)

from api.views.dish import (
    ListDishView,
    GetDishView,
    GetRestaurantDishView,
    CreateDishView,
    UpdateDishView,
    DeleteDishView,
    SpecificListDishLikeDislikeView,
    ListDishFavoriteView,
    CreateDishFavoriteView,
    DeleteDishFavoriteView,
    ListDishLikeDislikeView,
    CreateDishLikeDislikeView,
    UpdateDishLikeDislikeView,
    DeleteDishLikeDislikeView,
    ListCreateCourseView,
    DeleteCourseView,
    ListCreateCategoryView,
    DeleteCategoryView,
)


urlpatterns = [
    # ---------------- RESTAURANT ENDPOINTS ----------------
    path("restaurants/", ListRestaurantView.as_view(), name="restaurant-list"),
    path("restaurants/<int:pk>/", GetRestaurantView.as_view(), name="get-restaurant"),
    path("restaurants/create/", CreateRestaurantView.as_view(), name="create-restaurant"),
    path("restaurants/<int:pk>/update/", UpdateRestaurantView.as_view(), name="update-restaurant"),
    path("restaurants/<int:pk>/delete/", DeleteRestaurantView.as_view(), name="delete-restaurant"),
    
    # ---------------- RESTAURANT PHOTOS ----------------
    path("restaurants/<int:restaurant_id>/photos/", ListCreateRestaurantPhotoView.as_view(), name="restaurant-photo-list-create"),
    path("restaurants/<int:restaurant_id>/photos/<int:pk>/", RetrieveUpdateDestroyRestaurantPhotoView.as_view(), name='restaurant-photo-detail'),

    # ---------------- CUISINE ENDPOINTS ----------------
    path("cuisines/", ListCreateCuisineView.as_view(), name="list-create-cuisines"),

    # ---------------- RESTAURANT FAVORITE ENDPOINTS ----------------
    path("favorites/restaurants/", ListFavoriteView.as_view(), name="list-favorites"),
    path("favorites/restaurants/create/", CreateFavoriteView.as_view(), name="create-favorite"),
    path("favorites/restaurants/<int:pk>/delete/", DeleteFavoriteView.as_view(), name="delete-favorite"),

    # ---------------- RESTAURANT LIKE/DISLIKE ENDPOINTS ----------------
    path("likes-dislikes/restaurants/", ListLikeDislikeView.as_view(), name="list-like-dislike"),
    path("restaurants/<int:restaurant_id>/likes-dislikes/", SpecificListLikeDislikeView.as_view(), name='restaurant-list-like-dislike'),
    path("likes-dislikes/restaurants/create/", CreateLikeDislikeView.as_view(), name="create-like-dislike"),
    path("likes-dislikes/restaurants/<int:pk>/update/", UpdateLikeDislikeView.as_view(), name="update-like-dislike"),
    path("likes-dislikes/restaurants/<int:pk>/delete/", DeleteLikeDislikeView.as_view(), name="delete-like-dislike"),
    
    # ---------------- COURSE ENDPOINTS ----------------
    path("courses/", ListCreateCourseView.as_view(), name="list-create-course"),

    # ---------------- CATEGORY ENDPOINTS ----------------
    path("categories/", ListCreateCategoryView.as_view(), name="list-create-category"),

    # ---------------- DISH ENDPOINTS ----------------
    path("dishes/", ListDishView.as_view(), name="list-dishes"),
    path("dishes/<int:dish_id>/likes-dislikes/", SpecificListDishLikeDislikeView.as_view(), name='dish-list-like-dislike'),
    path("dishes/<int:pk>/", GetDishView.as_view(), name="get-dish"),
    path("restaurants/<int:pk>/dishes/", GetRestaurantDishView.as_view(), name="get-restaurant-dish"),
    path("restaurants/<int:pk>/dishes/create/", CreateDishView.as_view(), name="create-dish"),
    path("dishes/<int:pk>/update/", UpdateDishView.as_view(), name="update-dish"),
    path("dishes/<int:pk>/delete/", DeleteDishView.as_view(), name="delete-dish"),

    # ---------------- DISH FAVORITE ENDPOINTS ----------------
    path("favorites/dishes/", ListDishFavoriteView.as_view(), name="list-dish-favorites"),
    path("favorites/dishes/create/", CreateDishFavoriteView.as_view(), name="create-dish-favorite"),
    path("favorites/dishes/<int:pk>/delete/", DeleteDishFavoriteView.as_view(), name="delete-dish-favorite"),

    # ---------------- DISH LIKE/DISLIKE ENDPOINTS ----------------
    path("likes-dislikes/dishes/", ListDishLikeDislikeView.as_view(), name="list-dish-like-dislike"),
    path("likes-dislikes/dishes/create/", CreateDishLikeDislikeView.as_view(), name="create-dish-like-dislike"),
    path("likes-dislikes/dishes/<int:pk>/update/", UpdateDishLikeDislikeView.as_view(), name="update-dish-like-dislike"),
    path("likes-dislikes/dishes/<int:pk>/delete/", DeleteDishLikeDislikeView.as_view(), name="delete-dish-like-dislike"),
]


# ---------------- BOOKING SYSTEM ----------------

from django.urls import path

# Booking System Views
from api.views.booking import (
    ListCreateBookingSystemView,
    RetrieveUpdateDestroyBookingSystemView,
    PauseBookingSystemView,
    ResumeBookingSystemView,
)

# General Time Slot Views
from api.views.booking import (
    ListCreateGeneralTimeSlotView,
    RetrieveUpdateDestroyGeneralTimeSlotView,
)

# Time Slot Views
from api.views.booking import (
    ListCreateTimeSlotView,
    RetrieveUpdateDestroyTimeSlotView,
    CustomCreateTimeSlotView,
)

# Booking Views
from api.views.booking import (
    ListCreateBookingView,
    RetrieveUpdateDestroyBookingView,
    AvailableTablesView,
    RetrieveUpdateBookingByCodeView,
    BookingTypesDeleteView,
    BookingTypesListCreateView,
    UserCreateBookingView,
    UserRetrieveUpdateBookingView,
)

urlpatterns += [
    # ---------------- BOOKING SYSTEM ENDPOINTS ----------------
    path("booking-systems/", ListCreateBookingSystemView.as_view(), name="list-create-booking-system"),
    path("booking-systems/<int:pk>/", RetrieveUpdateDestroyBookingSystemView.as_view(), name="retrieve-update-destroy-booking-system"),
    path("booking-systems/<int:pk>/pause/", PauseBookingSystemView.as_view(), name="pause-booking-system"),
    path("booking-systems/<int:pk>/resume/", ResumeBookingSystemView.as_view(), name="resume-booking-system"),

    # ---------------- GENERAL TIME SLOT ENDPOINTS ----------------
    path("general-time-slots/", ListCreateGeneralTimeSlotView.as_view(), name="list-create-general-time-slot"),
    path("general-time-slots/<int:pk>/", RetrieveUpdateDestroyGeneralTimeSlotView.as_view(), name="retrieve-update-destroy-general-time-slot"),

    # ---------------- TIME SLOT ENDPOINTS ----------------
    path("time-slots/", ListCreateTimeSlotView.as_view(), name="list-create-time-slot"),
    path("time-slots/<int:pk>/", RetrieveUpdateDestroyTimeSlotView.as_view(), name="retrieve-update-destroy-time-slot"),
    path("time-slots/create/", CustomCreateTimeSlotView.as_view(), name="custom-create-time-slot"),

    # ---------------- BOOKING ENDPOINTS ----------------
    path("bookings/", ListCreateBookingView.as_view(), name="list-create-booking"),
    path("bookings/<int:pk>/", RetrieveUpdateDestroyBookingView.as_view(), name="retrieve-update-destroy-booking"),
    
    # User endpoints (with validation for create)
    path("user/bookings/create/", UserCreateBookingView.as_view(), name="user-create-booking"),
    path("user/bookings/<int:pk>/", UserRetrieveUpdateBookingView.as_view(), name="user-retrieve-update-booking"),
    
    # ---------------- AVAILABILITY & RETRIEVAL ENDPOINTS ----------------
    path("available-tables/", AvailableTablesView.as_view(), name="available-tables"),
    path("retrieve-booking/", RetrieveUpdateBookingByCodeView.as_view(), name="retrieve-update-booking"),
    
    # ---------------- BOOKING TYPE ENDPOINTS ----------------
    path('booking-system/<int:id>/booking-types/', BookingTypesListCreateView.as_view(), name='list-create-booking-types'),
    path('booking-types/<int:pk>/', BookingTypesDeleteView.as_view(), name='delete-booking-type'),
]
