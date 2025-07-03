# api/tests.py

"""
This test file contains all test classes and test methods (a total of 69 tests)
covering Users, Restaurants, Cuisines, Favorites, Likes/Dislikes, Dishes,
Dish Courses, Dish Categories, Dish Favorites, Dish Likes/Dislikes,
and specific user/restaurant endpoints.

The code is reorganized into clearer logical groupings.
"""

###############################################################################
#                                Imports & Setup
###############################################################################
from datetime import datetime
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

# Restaurant / Cuisine / Favorite / LikeDislike (Restaurant-level)
from api.models.restaurant import Restaurant, Cuisine, Favorite, LikeDislike

# Dishes
from api.models.dish.dish import Dish
from api.models.dish.course import Course
from api.models.dish.category import Category

# Dish Favorites and Dish Likes/Dislikes
from api.models.dish.favorite import DishFavorite
from api.models.dish.like_dislike import DishLikeDislike

CustomUser = get_user_model()

def authenticate(client, username, password="Password123"):
    """
    Helper to authenticate a client and set the Authorization header.
    """
    response = client.post("/api/token/", {
        "username": username,
        "password": password
    })
    if response.status_code == 200:
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
    return response


###############################################################################
#                                1. UserTests
###############################################################################
class UserTests(APITestCase):
    """
    Tests related to user registration, login, partial updates, and deletion.
    """
    def setUp(self):
        self.user_data = {
            "username": "testuser",
            "password": "Password123",
            "email": "testuser@example.com",
            "first_name": "Test",
            "last_name": "User",
            "country_code": 1,
            "phone_number": "2025550101",
            "user_type": "restaurant",
        }
        self.normal_user_data = {
            "username": "normal1",
            "password": "Password123",
            "email": "normal1@example.com",
            "first_name": "Normal",
            "last_name": "User",
            "country_code": "1",
            "phone_number": "2025550102",
            "user_type": "normal",
        }

    def test_user_registration(self):
        """Test that a new user can register."""
        response = self.client.post("/api/user/register/", self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_user_login(self):
        """Test that a user can obtain tokens (login)."""
        CustomUser.objects.create_user(**self.user_data)
        response = self.client.post("/api/token/", {
            "username": "testuser",
            "password": "Password123"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_user_update(self):
        """Test partial update of user info (e.g., phone_number)."""
        user = CustomUser.objects.create_user(**self.user_data)
        token_response = self.client.post("/api/token/", {
            "username": "testuser",
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")

        update_response = self.client.patch(f"/api/users/{user.id}/update/", {
            "phone_number": "2025550199"
        })
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual(user.phone_number, "2025550199")

    def test_user_delete(self):
        """Test deleting an existing user."""
        user = CustomUser.objects.create_user(**self.normal_user_data)
        token_response = self.client.post("/api/token/", {
            "username": "normal1",
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token_response.data['access']}")

        delete_response = self.client.delete(f"/api/users/{user.id}/delete/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(CustomUser.objects.filter(id=user.id).exists())


###############################################################################
#                                2. RestaurantTests
###############################################################################
class RestaurantTests(APITestCase):
    """
    Tests related to creating, updating, deleting, and listing restaurants,
    including checking permissions for different user types.
    """
    def setUp(self):
        # Create a cuisine object (since 'cuisine_id' is required).
        self.cuisine = Cuisine.objects.create(name="Test Cuisine")

        # Create two users: one restaurant user, one normal user.
        self.restaurant_user = CustomUser.objects.create_user(
            username="restaurantuser",
            password="Password123",
            email="restaurant@example.com",
            first_name="Restaurant",
            last_name="Owner",
            country_code="1",
            phone_number="2025550103",
            user_type="restaurant",
        )
        self.normal_user = CustomUser.objects.create_user(
            username="normaluser",
            password="Password123",
            email="normal@example.com",
            first_name="Normal",
            last_name="User",
            country_code="1",
            phone_number="2025550104",
            user_type="normal",
        )

        # Include all fields that the serializer may expect, including required 'cuisine_id'.
        # Updated location to guarantee it always passes location checks.
        self.restaurant_data = {
            "name": "Test Restaurant",
            "description": "A great place to eat.",
            "country": "España",
            "state": "Madrid",
            "city": "Madrid",
            "postal": "28015",
            "street": "Calle de Gaztambide, 11",
            "latitude": 0,
            "longitude": 0,
            "timezone": "Europe/Madrid",
            "contact_number": "5555555555",
            "contact_email": "contact@testrestaurant.com",
            "website_link": "http://testrestaurant.com",
            "social_media_link": "http://twitter.com/testrestaurant",
            "cuisine_id": self.cuisine.id,
        }

    def authenticate_user(self, user):
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_restaurant(self):
        """Test that a restaurant user can create a restaurant."""
        self.authenticate_user(self.restaurant_user)
        response = self.client.post("/api/restaurants/create/", self.restaurant_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Restaurant.objects.count(), 1)

    def test_create_restaurant_as_normal_user(self):
        """Test that a normal user cannot create a restaurant (should be 403)."""
        self.authenticate_user(self.normal_user)
        response = self.client.post("/api/restaurants/create/", self.restaurant_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_restaurants(self):
        """Test listing restaurants with pagination."""
        self.authenticate_user(self.restaurant_user)
        Restaurant.objects.create(owner=self.restaurant_user, **self.restaurant_data)
        response = self.client.get("/api/restaurants/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

#    def test_update_restaurant(self):
#        """Test partially updating a restaurant's name."""
#        self.authenticate_user(self.restaurant_user)
#        restaurant = Restaurant.objects.create(owner=self.restaurant_user, **self.restaurant_data)
#        updated_data = {"name": "Updated Restaurant", "cuisine_id": self.cuisine.id}
#        response = self.client.patch(f"/api/restaurants/{restaurant.id}/update/", updated_data)
#        print(response.data)
#        self.assertEqual(response.status_code, status.HTTP_200_OK)
#        restaurant.refresh_from_db()
#        self.assertEqual(restaurant.name, "Updated Restaurant")

    def test_delete_restaurant(self):
        """Test deleting a restaurant."""
        self.authenticate_user(self.restaurant_user)
        restaurant = Restaurant.objects.create(owner=self.restaurant_user, **self.restaurant_data)
        response = self.client.delete(f"/api/restaurants/{restaurant.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Restaurant.objects.count(), 0)

    def test_get_restaurant(self):
        """Test retrieving a single restaurant by ID."""
        self.authenticate_user(self.restaurant_user)
        restaurant = Restaurant.objects.create(owner=self.restaurant_user, **self.restaurant_data)
        response = self.client.get(f"/api/restaurants/{restaurant.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Restaurant")

    def test_restaurant_filtering_and_ordering(self):
        """
        Test listing restaurants with filter and ordering parameters.
        We expect the default ordering to be ascending by name.
        """
        self.authenticate_user(self.restaurant_user)
        # Create multiple restaurants to test ordering
        Restaurant.objects.create(
            owner=self.restaurant_user,
            name="Z-Restaurant",
            description="Z Desc",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="111",
            contact_email="z@example.com",
            website_link="http://z.com",
            social_media_link="http://twitter.com/z",
            cuisine_id=self.cuisine.id
        )
        Restaurant.objects.create(
            owner=self.restaurant_user,
            name="A-Restaurant",
            description="A Desc",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="222",
            contact_email="a@example.com",
            website_link="http://a.com",
            social_media_link="http://twitter.com/a",
            cuisine_id=self.cuisine.id
        )

        # Default ordering (by "name")
        response = self.client.get("/api/restaurants/?ordering=name")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # First result should be "A-Restaurant" in ascending name order
        self.assertEqual(response.data["results"][0]["name"], "A-Restaurant")

        # Explicit ordering: descending by name
        response_desc = self.client.get("/api/restaurants/?ordering=-name")
        self.assertEqual(response_desc.status_code, status.HTTP_200_OK)
        self.assertEqual(response_desc.data["results"][0]["name"], "Z-Restaurant")


###############################################################################
#                                3. CuisineTests
###############################################################################
class CuisineTests(APITestCase):
    """
    Tests for creating, listing, and deleting cuisines. Only superuser
    is allowed to create and delete cuisines.
    """
    def setUp(self):
        # Create a superuser (for creating cuisines)
        self.superuser = CustomUser.objects.create_superuser(
            username="admin",
            password="admin123",
            email="admin@example.com",
            first_name="Admin",
            last_name="User",
            country_code="1",
            phone_number="2025550105",
            user_type="normal",  # user_type can be arbitrary; superuser overrides it
        )
        # Create a normal user
        self.normal_user = CustomUser.objects.create_user(
            username="normalcuisine",
            password="Password123",
            email="normalcuisine@example.com",
            first_name="Normal",
            last_name="Cuisine",
            country_code="1",
            phone_number="2025550106",
            user_type="normal",
        )
        self.cuisine_data = {"name": "Italian"}

    def authenticate_user(self, user, raw_password="Password123"):
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": raw_password
        })
        if response.status_code != status.HTTP_200_OK:
            # If superuser had a different password (admin123), try again
            response = self.client.post("/api/token/", {
                "username": user.username,
                "password": "admin123"
            })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_list_cuisine(self):
        """Test listing all cuisines (no authentication required for GET)."""
        Cuisine.objects.create(name="Mexican")
        response = self.client.get("/api/cuisines/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_cuisine_as_superuser(self):
        """Only superuser can create a new cuisine."""
        self.authenticate_user(self.superuser, raw_password="admin123")
        response = self.client.post("/api/cuisines/", self.cuisine_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Cuisine.objects.filter(name="Italian").exists())

    def test_create_cuisine_as_normal_user(self):
        """A normal user (non-superuser) should get 403 Forbidden."""
        self.authenticate_user(self.normal_user)
        response = self.client.post("/api/cuisines/", self.cuisine_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Cuisine.objects.filter(name="Italian").exists())

    def test_delete_cuisine_as_superuser(self):
        """A superuser should be able to delete an existing cuisine."""
        self.authenticate_user(self.superuser, raw_password="admin123")
        cuisine = Cuisine.objects.create(name="Japanese")
        response = self.client.delete(f"/api/cuisines/{cuisine.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Cuisine.objects.filter(name="Japanese").exists())

    def test_delete_cuisine_as_normal_user(self):
        """A normal user should not be able to delete an existing cuisine."""
        self.authenticate_user(self.normal_user)
        cuisine = Cuisine.objects.create(name="Thai")
        response = self.client.delete(f"/api/cuisines/{cuisine.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Cuisine.objects.filter(name="Thai").exists())


###############################################################################
#                                4. FavoriteTests (Restaurant Favorites)
###############################################################################
class FavoriteTests(APITestCase):
    """
    Tests for favoriting restaurants, including creation, deletion,
    and listing favorites, and updating the restaurant's favorite_count.
    """
    def setUp(self):
        # Create a normal user
        self.normal_user = CustomUser.objects.create_user(
            username="normalfav",
            password="Password123",
            email="normalfav@example.com",
            first_name="Normal",
            last_name="Favorite",
            country_code="1",
            phone_number="2025550107",
            user_type="normal",
        )
        # Create another normal user
        self.another_normal_user = CustomUser.objects.create_user(
            username="anothernormalfav",
            password="Password123",
            email="anothernormalfav@example.com",
            first_name="AnotherNormal",
            last_name="Favorite",
            country_code="1",
            phone_number="2025550108",
            user_type="normal",
        )
        # Create a restaurant user
        self.restaurant_user = CustomUser.objects.create_user(
            username="restofav",
            password="Password123",
            email="restofav@example.com",
            first_name="Resto",
            last_name="Favorite",
            country_code="1",
            phone_number="2025550109",
            user_type="restaurant",
        )

        # Create required Cuisine
        self.cuisine = Cuisine.objects.create(name="FavoriteCuisine")

        # Create a test restaurant with fixed location
        self.test_restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="FavRestaurant",
            description="Test description",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="111-222-3333",
            contact_email="favrestaurant@example.com",
            website_link="http://favrestaurant.com",
            social_media_link="http://twitter.com/favrestaurant",
            cuisine=self.cuisine,
        )

    def authenticate_user(self, user):
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_favorite_as_normal_user(self):
        """
        Normal user should be able to favorite a restaurant.
        After creation, favorites_count should be 1.
        """
        self.authenticate_user(self.normal_user)
        data = {"restaurant": self.test_restaurant.id}
        response = self.client.post("/api/favorites/restaurants/create/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.test_restaurant.refresh_from_db()
        self.assertEqual(self.test_restaurant.favorites_count, 1)

    def test_create_favorite_as_restaurant_user(self):
        """
        Restaurant user cannot favorite a restaurant.
        The view raises a PermissionDenied => 403 FORBIDDEN.
        """
        self.authenticate_user(self.restaurant_user)
        data = {"restaurant": self.test_restaurant.id}
        response = self.client.post("/api/favorites/restaurants/create/", data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_favorite(self):
        """
        Normal user can delete their own favorite.
        favorites_count should decrement.
        """
        self.authenticate_user(self.normal_user)
        favorite = Favorite.objects.create(user=self.normal_user, restaurant=self.test_restaurant)
        # Manually update favorites_count for test clarity
        self.test_restaurant.update_favorites_count()
        self.assertEqual(self.test_restaurant.favorites_count, 1)

        response = self.client.delete(f"/api/favorites/restaurants/{favorite.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.test_restaurant.refresh_from_db()
        self.assertEqual(self.test_restaurant.favorites_count, 0)

    def test_list_favorites(self):
        """
        Normal user can list their favorites (paginated).
        """
        self.authenticate_user(self.normal_user)
        Favorite.objects.create(user=self.normal_user, restaurant=self.test_restaurant)

        # Create another restaurant with fixed location
        another_restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="Another Restaurant",
            description="Another description",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="999-888-7777",
            contact_email="another@example.com",
            website_link="http://another.com",
            social_media_link="http://twitter.com/another",
            cuisine=self.cuisine,
        )
        Favorite.objects.create(user=self.normal_user, restaurant=another_restaurant)

        response = self.client.get("/api/favorites/restaurants/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_multiple_users_favoriting_increments_count(self):
        """
        Verifies that when two different normal users favorite
        the same restaurant, favorites_count == 2.
        """
        # First user favorites the restaurant
        self.authenticate_user(self.normal_user)
        self.client.post("/api/favorites/restaurants/create/", {"restaurant": self.test_restaurant.id})
        self.test_restaurant.refresh_from_db()
        self.assertEqual(self.test_restaurant.favorites_count, 1)

        # Second user favorites the same restaurant
        self.authenticate_user(self.another_normal_user)
        self.client.post("/api/favorites/restaurants/create/", {"restaurant": self.test_restaurant.id})
        self.test_restaurant.refresh_from_db()
        self.assertEqual(self.test_restaurant.favorites_count, 2)

    def test_same_user_cannot_favorite_twice(self):
        """
        Verifies that if a user tries to favorite a restaurant they
        have already favorited, an error is returned and the
        favorites_count remains unchanged.
        """
        self.authenticate_user(self.normal_user)

        # First time favoriting should succeed
        response1 = self.client.post("/api/favorites/restaurants/create/", {"restaurant": self.test_restaurant.id})
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Attempt to favorite the same restaurant again
        response2 = self.client.post("/api/favorites/restaurants/create/", {"restaurant": self.test_restaurant.id})
        # Typically 400 Bad Request or 409 Conflict
        self.assertIn(response2.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_409_CONFLICT])

        # Ensure favorites_count did not increment
        self.test_restaurant.refresh_from_db()
        self.assertEqual(self.test_restaurant.favorites_count, 1)


###############################################################################
#                                5. LikeDislikeTests (Restaurant)
###############################################################################
class LikeDislikeTests(APITestCase):
    """
    Tests related to liking or disliking restaurants, including creation,
    updates, deletions, and verifying like_count/dislike_count changes.
    """
    def setUp(self):
        # Create a normal user
        self.normal_user = CustomUser.objects.create_user(
            username="normaluser",
            password="Password123",
            email="normaluser@example.com",
            first_name="Normal",
            last_name="User",
            country_code="1",
            phone_number="2025550110",
            user_type="normal",
        )

        # Create a restaurant user
        self.restaurant_user = CustomUser.objects.create_user(
            username="restaurantuser",
            password="Password123",
            email="restaurantuser@example.com",
            first_name="Restaurant",
            last_name="User",
            country_code="1",
            phone_number="2025550111",
            user_type="restaurant",
        )

        # Create a second normal user to test multiple likes/dislikes
        self.another_normal_user = CustomUser.objects.create_user(
            username="another_normaluser",
            password="Password123",
            email="anothernormaluser@example.com",
            first_name="Another",
            last_name="Normal",
            country_code="1",
            phone_number="2025550112",
            user_type="normal",
        )

        # Create a cuisine
        self.cuisine = Cuisine.objects.create(name="Test Cuisine")

        # Create a restaurant with fixed location
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="Test Restaurant",
            description="A great place to eat.",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="5555555555",
            contact_email="contact@testrestaurant.com",
            website_link="http://testrestaurant.com",
            social_media_link="http://twitter.com/testrestaurant",
            cuisine=self.cuisine,
        )

    def authenticate_user(self, user):
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_like(self):
        """Test that a normal user can like a restaurant."""
        self.authenticate_user(self.normal_user)
        response = self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "like"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 1)
        self.assertEqual(self.restaurant.dislike_count, 0)

    def test_create_dislike(self):
        """Test that a normal user can dislike a restaurant."""
        self.authenticate_user(self.normal_user)
        response = self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "dislike"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 0)
        self.assertEqual(self.restaurant.dislike_count, 1)

    def test_like_dislike_as_restaurant_user(self):
        """Test that a restaurant user cannot like or dislike a restaurant."""
        self.authenticate_user(self.restaurant_user)
        response = self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "like"
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_like_dislike(self):
        """Test updating a like to a dislike."""
        self.authenticate_user(self.normal_user)

        # Use POST to create the initial LikeDislike
        create_response = self.client.post(
            "/api/likes-dislikes/restaurants/create/",
            {"restaurant": self.restaurant.id, "type": "like"}
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        # Extract the created LikeDislike object ID
        like_dislike_id = create_response.data['id']

        # Use PATCH to update the LikeDislike from "like" to "dislike"
        update_response = self.client.patch(
            f"/api/likes-dislikes/restaurants/{like_dislike_id}/update/",
            {"type": "dislike"}
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        # Refresh the restaurant instance and check counts
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 0)
        self.assertEqual(self.restaurant.dislike_count, 1)


    def test_list_likes_dislikes(self):
        """Test listing likes and dislikes for a user."""
        self.authenticate_user(self.normal_user)
        LikeDislike.objects.create(
            user=self.normal_user,
            restaurant=self.restaurant,
            type="like"
        )

        response = self.client.get("/api/likes-dislikes/restaurants/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["type"], "like")

    def test_delete_like_dislike(self):
        """Test that a user can delete their like or dislike."""
        self.authenticate_user(self.normal_user)
        like_dislike = LikeDislike.objects.create(
            user=self.normal_user,
            restaurant=self.restaurant,
            type="like"
        )
        # Manually ensure the counts are correct before deletion
        self.restaurant.update_like_dislike_counts()
        self.assertEqual(self.restaurant.like_count, 1)
        self.assertEqual(self.restaurant.dislike_count, 0)

        response = self.client.delete(f"/api/likes-dislikes/restaurants/{like_dislike.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 0)
        self.assertEqual(self.restaurant.dislike_count, 0)

    def test_prevent_duplicate_like_dislike(self):
        """
        Test that a user cannot like or dislike the same restaurant multiple times.
        """
        self.authenticate_user(self.normal_user)

        # First time reacting should succeed
        response1 = self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "like"
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Attempt to react the same way again
        response2 = self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "like"
        })
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)

        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 1)

    def test_multiple_users_like_increments_count(self):
        """
        Two different normal users like the same restaurant => like_count = 2.
        """
        # First user
        self.authenticate_user(self.normal_user)
        self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "like"
        })
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 1)

        # Second user
        self.authenticate_user(self.another_normal_user)
        self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "like"
        })
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 2)

    def test_one_user_likes_and_another_dislikes(self):
        """
        One user likes, another user dislikes => like_count=1, dislike_count=1.
        """
        # First user likes
        self.authenticate_user(self.normal_user)
        self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "like"
        })
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 1)
        self.assertEqual(self.restaurant.dislike_count, 0)

        # Second user dislikes
        self.authenticate_user(self.another_normal_user)
        self.client.post("/api/likes-dislikes/restaurants/create/", {
            "restaurant": self.restaurant.id,
            "type": "dislike"
        })
        self.restaurant.refresh_from_db()
        self.assertEqual(self.restaurant.like_count, 1)
        self.assertEqual(self.restaurant.dislike_count, 1)


###############################################################################
#                                6. DishTests_1
###############################################################################
class DishTests_1(APITestCase):
    """
    Tests for creating, updating, deleting, and listing dishes,
    verifying that only restaurant users can manage dishes, and
    normal users cannot create or modify them.
    """

    def setUp(self):
        # Create a Course object
        self.course = Course.objects.create(name="Main Course")

        # Create a Category object
        self.category = Category.objects.create(name="Vegetarian")

        # Create two users: one restaurant user and one normal user
        self.restaurant_user = CustomUser.objects.create_user(
            username="dishowner",
            password="Password123",
            email="dishowner@example.com",
            first_name="Dish",
            last_name="Owner",
            country_code="1",
            phone_number="2025550113",
            user_type="restaurant",
        )
        self.normal_user = CustomUser.objects.create_user(
            username="normaldish",
            password="Password123",
            email="normaldish@example.com",
            first_name="Normal",
            last_name="User",
            country_code="1",
            phone_number="2025550114",
            user_type="normal",
        )

        # Create a cuisine
        self.cuisine = Cuisine.objects.create(name="Dish Cuisine")

        # Create a restaurant with fixed location
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="Dish Restaurant",
            description="Test restaurant for dishes",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="9999999999",
            contact_email="dish_rest@example.com",
            website_link="http://dishrestaurant.com",
            social_media_link="http://twitter.com/dishrestaurant",
            cuisine=self.cuisine,
        )

        # Dish data for creation
        self.dish_data = {
            "name": "Test Dish",
            "description": "A delicious test dish",
            "course_id": self.course.id,
            "category_ids": [self.category.id]
        }

    def authenticate_user(self, user):
        """Helper method to authenticate a user and set the authorization header."""
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_dish_as_restaurant_user(self):
        """A restaurant user should be able to create a new dish."""
        self.authenticate_user(self.restaurant_user)
        response = self.client.post(
            f"/api/restaurants/{self.restaurant.id}/dishes/create/",
            self.dish_data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Dish.objects.count(), 1)
        created_dish = Dish.objects.first()
        self.assertEqual(created_dish.name, "Test Dish")
        self.assertEqual(created_dish.course.id, self.course.id)
        self.assertIn(self.category, created_dish.categories.all())

    def test_create_dish_as_normal_user(self):
        """A normal user should not be able to create a dish."""
        self.authenticate_user(self.normal_user)
        response = self.client.post(
            f"/api/restaurants/{self.restaurant.id}/dishes/create/",
            self.dish_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Dish.objects.count(), 0)

    def test_list_dishes(self):
        """
        A user (restaurant or normal) can view the dish list.
        (Adjust logic based on whether your project filters by restaurant.)
        """
        dish = Dish.objects.create(
            name="Listable Dish",
            description="Listed for test",
            restaurant=self.restaurant,
            course=self.course,
        )
        dish.categories.add(self.category)

        self.authenticate_user(self.normal_user)
        response = self.client.get("/api/dishes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], "Listable Dish")

    def test_get_dish_by_id(self):
        """Ensure a user can retrieve details about a single dish."""
        dish = Dish.objects.create(
            name="Retrievable Dish",
            description="Details here",
            restaurant=self.restaurant,
            course=self.course,
        )
        dish.categories.add(self.category)

        self.authenticate_user(self.normal_user)
        response = self.client.get(f"/api/dishes/{dish.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrievable Dish")

    def test_update_dish(self):
        """A restaurant user can partially update their own dish."""
        dish = Dish.objects.create(
            name="Updatable Dish",
            description="Update me",
            restaurant=self.restaurant,
            course=self.course,
        )

        self.authenticate_user(self.restaurant_user)
        updated_data = {
            "name": "Updated Dish Name",
            "course_id": self.course.id,  # required if your serializer demands it
        }
        response = self.client.patch(f"/api/dishes/{dish.id}/update/", updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dish.refresh_from_db()
        self.assertEqual(dish.name, "Updated Dish Name")

    def test_delete_dish(self):
        """A restaurant user should be able to delete their own dish."""
        dish = Dish.objects.create(
            name="Deletable Dish",
            description="Delete me",
            restaurant=self.restaurant,
            course=self.course,
        )
        self.assertEqual(Dish.objects.count(), 1)

        self.authenticate_user(self.restaurant_user)
        response = self.client.delete(f"/api/dishes/{dish.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Dish.objects.count(), 0)

    def test_update_or_delete_dish_by_normal_user(self):
        """
        A normal user should get 403 when trying to update or delete a dish
        that belongs to a restaurant user.
        """
        dish = Dish.objects.create(
            name="Forbidden Dish",
            description="Normal user can't update",
            restaurant=self.restaurant,
            course=self.course,
        )
        self.authenticate_user(self.normal_user)

        # Try update
        update_response = self.client.patch(
            f"/api/dishes/{dish.id}/update/", {"name": "New Name"}
        )
        self.assertEqual(update_response.status_code, status.HTTP_403_FORBIDDEN)

        # Try delete
        delete_response = self.client.delete(f"/api/dishes/{dish.id}/delete/")
        self.assertEqual(delete_response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Dish.objects.filter(id=dish.id).exists())


###############################################################################
#                                7. CourseTests (Dish Courses)
###############################################################################
class CourseTests(APITestCase):
    """
    Tests for listing, creating, and deleting dish Courses.
    Only a superuser should be able to create and delete Courses.
    """
    def setUp(self):
        # Create a superuser
        self.superuser = CustomUser.objects.create_superuser(
            username="admin",
            password="admin123",
            email="admin@example.com",
            first_name="Admin",
            last_name="SuperUser",
            country_code="1",
            phone_number="2025550115",
            user_type="normal",  # user_type is overridden by is_superuser
        )
        # Create a normal user
        self.normal_user = CustomUser.objects.create_user(
            username="normal_type",
            password="Password123",
            email="normal_type@example.com",
            first_name="Normal",
            last_name="User",
            country_code="1",
            phone_number="2025550116",
            user_type="normal",
        )
        self.course_data = {"name": "Appetizer"}

    def test_list_courses(self):
        """Anyone can list courses (read-only)."""
        Course.objects.create(name="Dessert")
        response = self.client.get("/api/courses/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # no pagination in example

    def test_create_course_as_superuser(self):
        """A superuser should be able to create a course."""
        authenticate(self.client, username="admin", password="admin123")
        response = self.client.post("/api/courses/", self.course_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Course.objects.filter(name="Appetizer").exists())

    def test_create_course_as_non_superuser(self):
        """A normal user should not be able to create a course."""
        authenticate(self.client, username="normal_type", password="Password123")
        response = self.client.post("/api/courses/", self.course_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Course.objects.filter(name="Appetizer").exists())

    def test_delete_course_as_superuser(self):
        """A superuser can delete an existing course."""
        t = Course.objects.create(name="Deletable Course")
        authenticate(self.client, username="admin", password="admin123")
        response = self.client.delete(f"/api/courses/{t.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Course.objects.filter(name="Deletable Course").exists())

    def test_delete_course_as_non_superuser(self):
        """A normal user cannot delete an existing course."""
        t = Course.objects.create(name="Protected Course")
        authenticate(self.client, username="normal_type")
        response = self.client.delete(f"/api/courses/{t.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Course.objects.filter(name="Protected Course").exists())


###############################################################################
#                                8. CategoryTests (Dish Categories)
###############################################################################
class CategoryTests(APITestCase):
    """
    Tests for listing, creating, and deleting dish Categories.
    Only a superuser should be able to create and delete Categories.
    """
    def setUp(self):
        # Create a superuser
        self.superuser = CustomUser.objects.create_superuser(
            username="admin_category",
            password="admin123",
            email="admin_cat@example.com",
            first_name="AdminCat",
            last_name="SuperUser",
            country_code="1",
            phone_number="2025550117",
            user_type="normal",
        )
        # Create a normal user
        self.normal_user = CustomUser.objects.create_user(
            username="normal_category",
            password="Password123",
            email="normal_cat@example.com",
            first_name="Normal",
            last_name="User",
            country_code="1",
            phone_number="2025550118",
            user_type="normal",
        )
        self.category_data = {"name": "Vegan"}

    def test_list_categories(self):
        """Anyone can list categories (read-only)."""
        Category.objects.create(name="Vegetarian")
        response = self.client.get("/api/categories/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_category_as_superuser(self):
        """Superuser can create a new category."""
        authenticate(self.client, username="admin_category", password="admin123")
        response = self.client.post("/api/categories/", self.category_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Category.objects.filter(name="Vegan").exists())

    def test_create_category_as_normal_user(self):
        """Normal user cannot create a new category."""
        authenticate(self.client, username="normal_category")
        response = self.client.post("/api/categories/", self.category_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(Category.objects.filter(name="Vegan").exists())

    def test_delete_category_as_superuser(self):
        """A superuser should be able to delete an existing category."""
        c = Category.objects.create(name="Gluten-Free")
        authenticate(self.client, username="admin_category", password="admin123")
        response = self.client.delete(f"/api/categories/{c.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Category.objects.filter(name="Gluten-Free").exists())

    def test_delete_category_as_normal_user(self):
        """A normal user should not be able to delete a category."""
        c = Category.objects.create(name="Sugar-Free")
        authenticate(self.client, username="normal_category")
        response = self.client.delete(f"/api/categories/{c.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Category.objects.filter(name="Sugar-Free").exists())


###############################################################################
#                                9. DishTests_2
###############################################################################
class DishTests_2(APITestCase):
    """
    Tests for creating, listing, retrieving, updating, and deleting dishes,
    including invalid data scenarios, multiple categories, and filters.
    """

    def setUp(self):
        # Create a superuser (if needed for Course/Category creation)
        self.superuser = CustomUser.objects.create_superuser(
            username="admin_dish",
            password="admin123",
            email="admin_dish@example.com",
            first_name="AdminDish",
            last_name="SuperUser",
            country_code="1",
            phone_number="2025550119",
            user_type="normal",
        )

        # Create a restaurant user
        self.restaurant_user = CustomUser.objects.create_user(
            username="dishowner",
            password="Password123",
            email="dishowner@example.com",
            first_name="Dish",
            last_name="Owner",
            country_code="1",
            phone_number="2025550120",
            user_type="restaurant",
        )

        # Create a normal user
        self.normal_user = CustomUser.objects.create_user(
            username="normaldish",
            password="Password123",
            email="normaldish@example.com",
            first_name="Normal",
            last_name="User",
            country_code="1",
            phone_number="2025550121",
            user_type="normal",
        )

        # Create a Cuisine and a Restaurant
        self.cuisine = Cuisine.objects.create(name="DishCuisine")
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="Dish Restaurant",
            description="Test restaurant for dishes",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="9999999999",
            contact_email="dish_rest@example.com",
            website_link="http://dishrestaurant.com",
            social_media_link="http://twitter.com/dishrestaurant",
            cuisine=self.cuisine,
        )

        # Create a Course and Category
        self.course = Course.objects.create(name="Main Course")
        self.category1 = Category.objects.create(name="Vegetarian")
        self.category2 = Category.objects.create(name="Spicy")

        # Data for creating a Dish
        self.dish_data = {
            "name": "Test Dish",
            "description": "A delicious test dish",
            "course_id": self.course.id,
            "category_ids": [self.category1.id, self.category2.id]
        }

    def test_create_dish_as_restaurant_user(self):
        """A restaurant user should be able to create a new dish."""
        authenticate(self.client, username="dishowner")
        response = self.client.post(
            f"/api/restaurants/{self.restaurant.id}/dishes/create/",
            self.dish_data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Dish.objects.count(), 1)
        dish = Dish.objects.first()
        self.assertEqual(dish.name, "Test Dish")
        self.assertIn(self.category1, dish.categories.all())
        self.assertIn(self.category2, dish.categories.all())

    def test_create_dish_as_normal_user_fails(self):
        """A normal user should not be able to create a dish."""
        authenticate(self.client, username="normaldish")
        response = self.client.post(
            f"/api/restaurants/{self.restaurant.id}/dishes/create/",
            self.dish_data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Dish.objects.count(), 0)

    def test_create_dish_with_no_name(self):
        """Dish creation should fail if name is missing."""
        authenticate(self.client, username="dishowner")
        invalid_data = self.dish_data.copy()
        invalid_data.pop("name")  # remove name
        response = self.client.post(
            f"/api/restaurants/{self.restaurant.id}/dishes/create/",
            invalid_data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)
        self.assertEqual(Dish.objects.count(), 0)

    def test_create_dish_with_invalid_course_id(self):
        """Dish creation should fail if the provided course_id doesn't exist."""
        authenticate(self.client, username="dishowner")
        invalid_data = self.dish_data.copy()
        invalid_data["course_id"] = 9999  # non-existing course
        response = self.client.post(
            f"/api/restaurants/{self.restaurant.id}/dishes/create/",
            invalid_data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Dish.objects.count(), 0)

    def test_list_dishes(self):
        """Any authenticated user can list dishes."""
        dish = Dish.objects.create(
            name="Listable Dish",
            description="Listed for test",
            restaurant=self.restaurant,
            course=self.course
        )
        dish.categories.set([self.category1])

        authenticate(self.client, username="normaldish")
        response = self.client.get("/api/dishes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["name"], "Listable Dish")

    def test_retrieve_single_dish(self):
        """Fetch one dish by ID."""
        dish = Dish.objects.create(
            name="Retrievable Dish",
            description="Retrieve me",
            restaurant=self.restaurant,
            course=self.course
        )
        dish.categories.set([self.category2])

        authenticate(self.client, username="normaldish")
        response = self.client.get(f"/api/dishes/{dish.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Retrievable Dish")

    def test_filter_dishes_by_course(self):
        """Test filter by 'course' query param (if your code supports it)."""
        course2 = Course.objects.create(name="Dessert")
        dish1 = Dish.objects.create(name="Dish1", description="", restaurant=self.restaurant, course=self.course)
        dish2 = Dish.objects.create(name="Dish2", description="", restaurant=self.restaurant, course=course2)

        authenticate(self.client, username="normaldish")
        response = self.client.get(f"/api/dishes/?course={self.course.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["id"], dish1.id)

    def test_update_dish_as_restaurant_owner(self):
        """A restaurant user can partially update their own dish."""
        dish = Dish.objects.create(
            name="Old Dish",
            description="Update me",
            restaurant=self.restaurant,
            course=self.course
        )
        authenticate(self.client, username="dishowner")
        response = self.client.patch(f"/api/dishes/{dish.id}/update/", {"name": "New Dish Name"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        dish.refresh_from_db()
        self.assertEqual(dish.name, "New Dish Name")

    def test_update_dish_as_different_restaurant_owner_fails(self):
        """
        Another restaurant user should not be able to update a dish
        belonging to someone else's restaurant.
        """
        another_restaurant_user = CustomUser.objects.create_user(
            username="another_dishowner",
            password="Password123",
            email="anotherdish@example.com",
            first_name="AnotherDish",
            last_name="Owner",
            country_code="1",
            phone_number="2025550122",
            user_type="restaurant",
        )
        another_restaurant = Restaurant.objects.create(
            owner=another_restaurant_user,
            name="Another Restaurant",
            description="Separate place",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="7778889999",
            contact_email="another_rest@example.com",
            website_link="http://anotherrest.com",
            social_media_link="http://twitter.com/anotherrest",
            cuisine=self.cuisine,
        )
        dish = Dish.objects.create(
            name="Unreachable Dish",
            description="You can't update me",
            restaurant=another_restaurant,
            course=self.course
        )

        authenticate(self.client, username="dishowner")
        response = self.client.patch(f"/api/dishes/{dish.id}/update/", {"name": "Illegal Update"})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_dish(self):
        """A restaurant user can delete their own dish."""
        dish = Dish.objects.create(name="Deletable Dish", restaurant=self.restaurant, course=self.course)
        self.assertEqual(Dish.objects.count(), 1)

        authenticate(self.client, username="dishowner")
        response = self.client.delete(f"/api/dishes/{dish.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Dish.objects.count(), 0)


###############################################################################
#                               10. DishFavoriteTests
###############################################################################
class DishFavoriteTests(APITestCase):
    """
    Tests for favoriting dishes, including creation, deletion, listing,
    and verifying that favorites_count is updated correctly on the Dish.
    """

    def setUp(self):
        # Normal user for favoriting
        self.normal_user = CustomUser.objects.create_user(
            username="normalfavdish",
            password="Password123",
            email="normalfavdish@example.com",
            first_name="Normal",
            last_name="DishFavorite",
            country_code="1",
            phone_number="2025550123",
            user_type="normal",
        )
        # Restaurant user (cannot favorite a dish)
        self.restaurant_user = CustomUser.objects.create_user(
            username="restofdish",
            password="Password123",
            email="restofdish@example.com",
            first_name="Resto",
            last_name="Favorite",
            country_code="1",
            phone_number="2025550124",
            user_type="restaurant",
        )
        # Setup Dish to be favorited
        self.cuisine = Cuisine.objects.create(name="FavDishCuisine")
        self.course = Course.objects.create(name="FavDishCourse")
        self.category = Category.objects.create(name="FavDishCategory")

        self.dish_restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="FavDishRestaurant",
            description="For dish favorites",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="111-222-3333",
            contact_email="favdish@example.com",
            website_link="http://favdish.com",
            social_media_link="http://twitter.com/favdish",
            cuisine=self.cuisine,
        )
        self.dish = Dish.objects.create(
            name="Fav Dish",
            description="Test dish for favorites",
            restaurant=self.dish_restaurant,
            course=self.course,
        )
        self.dish.categories.set([self.category])

    def test_favorite_dish_as_normal_user(self):
        """A normal user can favorite a dish => favorites_count increments."""
        authenticate(self.client, "normalfavdish")
        data = {"dish": self.dish.id}
        response = self.client.post("/api/favorites/dishes/create/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.dish.refresh_from_db()
        self.assertEqual(self.dish.favorites_count, 1)

    def test_favorite_dish_as_restaurant_user_fails(self):
        """A restaurant user is forbidden from favoriting a dish."""
        authenticate(self.client, "restofdish")
        data = {"dish": self.dish.id}
        response = self.client.post("/api/favorites/dishes/create/", data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unfavorite_dish_decrements_count(self):
        """When a user deletes a favorite, favorites_count decrements."""
        fav = DishFavorite.objects.create(user=self.normal_user, dish=self.dish)
        self.dish.update_favorites_count()
        self.assertEqual(self.dish.favorites_count, 1)

        authenticate(self.client, "normalfavdish")
        response = self.client.delete(f"/api/favorites/dishes/{fav.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.favorites_count, 0)

    def test_list_user_dish_favorites(self):
        """A user can list their favorite dishes."""
        DishFavorite.objects.create(user=self.normal_user, dish=self.dish)
        self.dish.update_favorites_count()

        # Create a second dish
        dish2 = Dish.objects.create(
            name="Another Fav Dish",
            description="Test2",
            restaurant=self.dish_restaurant,
            course=self.course
        )
        DishFavorite.objects.create(user=self.normal_user, dish=dish2)

        authenticate(self.client, "normalfavdish")
        response = self.client.get("/api/favorites/dishes/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 2)

    def test_same_user_cannot_favorite_same_dish_twice(self):
        """If user tries to favorite the same dish again, an error is returned."""
        authenticate(self.client, "normalfavdish")
        response1 = self.client.post("/api/favorites/dishes/create/", {"dish": self.dish.id})
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        response2 = self.client.post("/api/favorites/dishes/create/", {"dish": self.dish.id})
        self.assertIn(response2.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_409_CONFLICT])
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.favorites_count, 1)


###############################################################################
#                               11. DishLikeDislikeTests
###############################################################################
class DishLikeDislikeTests(APITestCase):
    """
    Tests for liking or disliking dishes, ensuring counts update
    and preventing duplicate reactions from the same user.
    """

    def setUp(self):
        # Normal users
        self.normal_user1 = CustomUser.objects.create_user(
            username="normaldish1",
            password="Password123",
            email="normaldish1@example.com",
            first_name="Normal1",
            last_name="User",
            country_code="1",
            phone_number="2025550125",
            user_type="normal",
        )
        self.normal_user2 = CustomUser.objects.create_user(
            username="normaldish2",
            password="Password123",
            email="normaldish2@example.com",
            first_name="Normal2",
            last_name="User",
            country_code="1",
            phone_number="2025550126",
            user_type="normal",
        )
        # Restaurant user (cannot like or dislike)
        self.restaurant_user = CustomUser.objects.create_user(
            username="restodish",
            password="Password123",
            email="restodish@example.com",
            first_name="Resto",
            last_name="Dish",
            country_code="1",
            phone_number="2025550127",
            user_type="restaurant",
        )

        # Dish setup
        self.cuisine = Cuisine.objects.create(name="LikeDislikeCuisine")
        self.course = Course.objects.create(name="LikeDislikeCourse")
        self.category = Category.objects.create(name="LikeDislikeCategory")
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="LikeDislike Restaurant",
            description="Place for dish testing",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="9998887777",
            contact_email="ld@example.com",
            website_link="http://ld-restaurant.com",
            social_media_link="http://twitter.com/ldrestaurant",
            cuisine=self.cuisine,
        )
        self.dish = Dish.objects.create(
            name="LD Dish",
            description="Testing likes and dislikes",
            restaurant=self.restaurant,
            course=self.course,
        )
        self.dish.categories.set([self.category])

    def test_like_dish(self):
        """A normal user can like a dish => like_count increments."""
        authenticate(self.client, "normaldish1")
        response = self.client.post("/api/likes-dislikes/dishes/create/", {
            "dish": self.dish.id,
            "type": "like"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 1)
        self.assertEqual(self.dish.dislike_count, 0)

    def test_dislike_dish(self):
        """A normal user can dislike a dish => dislike_count increments."""
        authenticate(self.client, "normaldish1")
        response = self.client.post("/api/likes-dislikes/dishes/create/", {
            "dish": self.dish.id,
            "type": "dislike"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 0)
        self.assertEqual(self.dish.dislike_count, 1)

    def test_restaurant_user_cannot_like_dislike(self):
        """A restaurant user is forbidden from liking or disliking a dish."""
        authenticate(self.client, "restodish")
        response = self.client.post("/api/likes-dislikes/dishes/create/", {
            "dish": self.dish.id,
            "type": "like"
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 0)
        self.assertEqual(self.dish.dislike_count, 0)

    def test_cannot_like_same_dish_twice(self):
        """A user cannot like the same dish multiple times."""
        authenticate(self.client, "normaldish1")
        response1 = self.client.post("/api/likes-dislikes/dishes/create/", {
            "dish": self.dish.id,
            "type": "like"
        })
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)

        # Attempt second like
        response2 = self.client.post("/api/likes-dislikes/dishes/create/", {
            "dish": self.dish.id,
            "type": "like"
        })
        self.assertEqual(response2.status_code, status.HTTP_400_BAD_REQUEST)
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 1)

    def test_update_like_to_dislike(self):
        """A user can change an existing like to dislike => counts adjust."""
        authenticate(self.client, "normaldish1")
        ld = DishLikeDislike.objects.create(
            user=self.normal_user1, dish=self.dish, type="like"
        )
        self.dish.update_like_dislike_counts()
        self.assertEqual(self.dish.like_count, 1)
        self.assertEqual(self.dish.dislike_count, 0)

        response = self.client.patch(
            f"/api/likes-dislikes/dishes/{ld.id}/update/", {"type": "dislike"}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 0)
        self.assertEqual(self.dish.dislike_count, 1)

    def test_delete_like_dislike(self):
        """Deleting a like/dislike should decrement the appropriate count."""
        ld = DishLikeDislike.objects.create(user=self.normal_user1, dish=self.dish, type="like")
        self.dish.update_like_dislike_counts()
        self.assertEqual(self.dish.like_count, 1)

        authenticate(self.client, "normaldish1")
        response = self.client.delete(f"/api/likes-dislikes/dishes/{ld.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 0)
        self.assertEqual(self.dish.dislike_count, 0)

    def test_list_dish_likes_dislikes(self):
        """
        A user can list their own dish likes/dislikes or filter by dish_id
        to see all reactions for that dish (depending on your API design).
        """
        DishLikeDislike.objects.create(user=self.normal_user1, dish=self.dish, type="like")
        DishLikeDislike.objects.create(user=self.normal_user2, dish=self.dish, type="dislike")

        # normal_user1
        authenticate(self.client, "normaldish1")
        response1 = self.client.get("/api/likes-dislikes/dishes/")
        self.assertEqual(response1.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response1.data["results"]), 1)  # only user1's

        # Example if you want to see all reactions for that dish, you'd do:
        # response2 = self.client.get(f"/api/likes-dislikes/dishes/?dish_id={self.dish.id}")
        # self.assertEqual(response2.status_code, status.HTTP_200_OK)
        # self.assertEqual(len(response2.data["results"]), 2)  # user1 + user2

    def test_multiple_users_like_dislike_same_dish(self):
        """Multiple normal users => like_count / dislike_count reflect each user's action."""
        # User1 likes
        authenticate(self.client, "normaldish1")
        self.client.post("/api/likes-dislikes/dishes/create/", {"dish": self.dish.id, "type": "like"})
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 1)

        # User2 dislikes
        authenticate(self.client, "normaldish2")
        self.client.post("/api/likes-dislikes/dishes/create/", {"dish": self.dish.id, "type": "dislike"})
        self.dish.refresh_from_db()
        self.assertEqual(self.dish.like_count, 1)
        self.assertEqual(self.dish.dislike_count, 1)

from rest_framework import status
from rest_framework.test import APITestCase
from uuid import uuid4

# Updated model imports (adjust paths as needed)
from api.models.booking.booking_system import BookingSystem
from api.models.booking.general_time_slot import GeneralTimeSlot
from api.models.booking.time_slot import TimeSlot
from api.models.booking.booking import Booking

# Import related models
from api.models.restaurant import Restaurant, Cuisine
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

###############################################################################
#                                BookingSystemTests
###############################################################################
class BookingSystemTests(APITestCase):
    """
    Tests for creating, updating, pausing, and resuming Booking systems.
    """

    def setUp(self):
        # Create a restaurant user
        self.restaurant_user = CustomUser.objects.create_user(
            username="bookingsysowner",
            password="Password123",
            email="bookingsysowner@example.com",
            first_name="BookingSys",
            last_name="Owner",
            country_code="1",
            phone_number="2025550201",
            user_type="restaurant",
        )
        # Create a normal user
        self.normal_user = CustomUser.objects.create_user(
            username="normalbookingsys",
            password="Password123",
            email="normalbookingsys@example.com",
            first_name="Normal",
            last_name="User",
            country_code="1",
            phone_number="2025550202",
            user_type="normal",
        )

        # Restaurant setup (fixed location)
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="Booking System Restaurant",
            description="Test restaurant for BookingSystem",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="123-456-7890",
            contact_email="booking_system@example.com",
            cuisine=Cuisine.objects.create(name="BookingSystem Cuisine"),
        )
        # Data for creating a new BookingSystem
        self.booking_system_data = {
            "restaurant": self.restaurant.id,
            "meal_type": "lunch",
        }

    def authenticate_user(self, user):
        """Helper method to authenticate a user."""
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_booking_system(self):
        """Test that a restaurant user can create a BookingSystem."""
        self.authenticate_user(self.restaurant_user)
        response = self.client.post("/api/booking-systems/", self.booking_system_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BookingSystem.objects.count(), 1)

    def test_create_booking_system_as_normal_user(self):
        """Test that a normal user cannot create a BookingSystem."""
        self.authenticate_user(self.normal_user)
        response = self.client.post("/api/booking-systems/", self.booking_system_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(BookingSystem.objects.count(), 0)

    def test_pause_resume_booking_system(self):
        """Test pausing and resuming a BookingSystem."""
        self.authenticate_user(self.restaurant_user)
        booking_system = BookingSystem.objects.create(
            restaurant=self.restaurant,
            meal_type="dinner"
        )

        # Pause the system
        response = self.client.post(f"/api/booking-systems/{booking_system.id}/pause/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking_system.refresh_from_db()
        self.assertTrue(booking_system.is_paused)

        # Resume the system
        response = self.client.post(f"/api/booking-systems/{booking_system.id}/resume/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking_system.refresh_from_db()
        self.assertFalse(booking_system.is_paused)


###############################################################################
#                                GeneralTimeSlotTests
###############################################################################
class GeneralTimeSlotTests(APITestCase):
    """
    Tests for creating, updating, and deleting GeneralTimeSlot entries.
    """

    def setUp(self):
        self.restaurant_user = CustomUser.objects.create_user(
            username="generaltimeslotowner",
            password="Password123",
            email="generaltimeslotowner@example.com",
            first_name="GeneralTimeSlot",
            last_name="Owner",
            country_code="1",
            phone_number="2025550203",
            user_type="restaurant",
        )
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="General TimeSlot Restaurant",
            description="Restaurant for GeneralTimeSlot testing",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="987-654-3210",
            contact_email="general_timeslot@example.com",
            cuisine=Cuisine.objects.create(name="GeneralTimeSlot Cuisine"),
        )
        self.booking_system = BookingSystem.objects.create(
            restaurant=self.restaurant,
            meal_type="general"
        )

    def authenticate_user(self, user):
        """Helper method to authenticate a user."""
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_general_time_slot(self):
        """Test that a restaurant user can create a GeneralTimeSlot."""
        self.authenticate_user(self.restaurant_user)
        data = {
            "booking_system": self.booking_system.id,
            "weekday": 1,  # Tuesday
            "start_time": "10:00:00",
            "end_time": "14:00:00",
            "interval_minutes": 30,
            "max_people": 50,
            "max_tables": 10,
        }
        response = self.client.post("/api/general-time-slots/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(GeneralTimeSlot.objects.count(), 1)

    def test_create_overlapping_general_time_slot(self):
        """Test that overlapping GeneralTimeSlot entries are not allowed."""
        self.authenticate_user(self.restaurant_user)
        GeneralTimeSlot.objects.create(
            booking_system=self.booking_system,
            weekday=2,  # Wednesday
            start_time=datetime.strptime("12:00:00", "%H:%M:%S").time(),
            end_time=datetime.strptime("15:00:00", "%H:%M:%S").time(),
            interval_minutes=30,
            max_people=50,
            max_tables=10,
        )
        data = {
            "booking_system": self.booking_system.id,
            "weekday": 2,  # Wednesday
            "start_time": "14:00:00",
            "end_time": "16:00:00",
            "interval_minutes": 30,
            "max_people": 50,
            "max_tables": 10,
        }
        response = self.client.post("/api/general-time-slots/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("overlap", str(response.data).lower())


###############################################################################
#                                BookingTests
###############################################################################
class BookingTests(APITestCase):
    """
    Tests for creating, updating, deleting, and retrieving bookings (by code).
    """

    def setUp(self):
        self.restaurant_user = CustomUser.objects.create_user(
            username="bookingowner",
            password="Password123",
            email="bookingowner@example.com",
            first_name="Booking",
            last_name="Owner",
            country_code="1",
            phone_number="2025550204",
            user_type="restaurant",
        )
        self.normal_user = CustomUser.objects.create_user(
            username="normalbooking",
            password="Password123",
            email="normalbooking@example.com",
            first_name="Normal",
            last_name="Booking",
            country_code="1",
            phone_number="2025550205",
            user_type="normal",
        )
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_user,
            name="Booking Restaurant",
            description="Restaurant for Booking testing",
            country="España",
            state="Madrid",
            city="Madrid",
            postal="28015",
            street="Calle de Gaztambide, 11",
            latitude=0,
            longitude=0,
            timezone="Europe/Madrid",
            contact_number="456-789-0123",
            contact_email="booking@restaurant.com",
            cuisine=Cuisine.objects.create(name="Booking Cuisine"),
        )
        self.booking_system = BookingSystem.objects.create(
            restaurant=self.restaurant,
            meal_type="dinner"
        )
        self.time_slot = TimeSlot.objects.create(
            booking_system=self.booking_system,
            time="18:00:00",
            date="2025-01-01",
            is_open=True,
            max_people=20,
            max_tables=5,
        )

    def authenticate_user(self, user):
        """Helper method to authenticate a user."""
        response = self.client.post("/api/token/", {
            "username": user.username,
            "password": "Password123"
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_booking(self):
        """Test that a normal user can create a booking."""
        self.authenticate_user(self.normal_user)
        data = {
            "time_slot": self.time_slot.id,
            "first_name": "John",
            "last_name": "Doe",
            "people": 4,
            "phone": "1234567890",
            "email": "john.doe@example.com",
        }
        response = self.client.post("/api/bookings/", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Booking.objects.count(), 1)

    def test_create_booking_exceeding_capacity(self):
        """Test that bookings exceeding capacity are rejected."""
        self.authenticate_user(self.normal_user)
        data = {
            "time_slot": self.time_slot.id,
            "first_name": "John",
            "last_name": "Doe",
            "people": 25,  # Exceeds max_people
            "phone": "1234567890",
            "email": "john.doe@example.com",
        }
        response = self.client.post("/api/bookings/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(
            "maximum number of people for this time slot is 20",
            str(response.data).lower()
        )
        
    def test_retrieve_booking_by_code(self):
        """Test retrieving a booking by time_slot and booking_code using query parameters."""
        booking = Booking.objects.create(
            time_slot=self.time_slot,
            first_name="John",
            last_name="Doe",
            people=4,
            phone="1234567890",
            email="john.doe@example.com",
        )

        query_params = {
            "time_slot": str(self.time_slot.id),
            "booking_code": str(booking.booking_code),
        }
        response = self.client.get(f"/api/retrieve-booking/", query_params)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["first_name"], "John")

    def test_update_booking_as_restaurant_owner(self):
        """Test that the restaurant owner can update a booking."""
        booking = Booking.objects.create(
            time_slot=self.time_slot,
            first_name="John",
            last_name="Doe",
            people=4,
            phone="1234567890",
            email="john.doe@example.com",
        )
        self.authenticate_user(self.restaurant_user)
        data = {"people": 6}
        response = self.client.patch(f"/api/bookings/{booking.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.people, 6)

    def test_update_booking_by_booking_code(self):
        """Test updating a booking using just the booking_code (unauthenticated)."""
        booking = Booking.objects.create(
            time_slot=self.time_slot,
            first_name="John",
            last_name="Doe",
            people=4,
            phone="1234567890",
            email="john.doe@example.com",
        )
        # Clear credentials so we act as an unauthenticated user
        self.client.credentials()
        data = {
            "booking_code": str(booking.booking_code),
            "time_slot": booking.time_slot.id,
            "people": 7
        }
        response = self.client.patch(f"/api/retrieve-booking/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        booking.refresh_from_db()
        self.assertEqual(booking.people, 7)

    def test_unauthorized_update_booking(self):
        """Test that an unauthorized user cannot update a booking."""
        booking = Booking.objects.create(
            time_slot=self.time_slot,
            first_name="John",
            last_name="Doe",
            people=4,
            phone="1234567890",
            email="john.doe@example.com",
        )
        # Do not provide either auth credentials or a matching booking_code
        data = {"people": 6}
        response = self.client.patch(f"/api/bookings/{booking.id}/", data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_destroy_booking_as_restaurant_owner(self):
        """Test that the restaurant owner can delete a booking."""
        booking = Booking.objects.create(
            time_slot=self.time_slot,
            first_name="John",
            last_name="Doe",
            people=4,
            phone="1234567890",
            email="john.doe@example.com",
        )
        self.authenticate_user(self.restaurant_user)
        response = self.client.delete(f"/api/bookings/{booking.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Booking.objects.count(), 0)
