# api/serializers/restaurant/restaurant_serializer.py

from rest_framework import serializers
from api.models.restaurant import Restaurant
from api.serializers.restaurant.cuisine_serializer import CuisineSerializer
from api.models.restaurant import Cuisine, Favorite, LikeDislike
from api.serializers.restaurant.restaurant_photo_serializer import RestaurantPhotoSerializer
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from timezonefinder import TimezoneFinder

class RestaurantSerializer(serializers.ModelSerializer):
    cuisine = CuisineSerializer(read_only=True)  # Show cuisine details
    cuisine_id = serializers.PrimaryKeyRelatedField(
        queryset=Cuisine.objects.all(), source="cuisine", write_only=True
    )  # Allow setting cuisine by ID
    favorite_details = serializers.SerializerMethodField()
    like_dislike_details = serializers.SerializerMethodField()
    
    photos = RestaurantPhotoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Restaurant
        fields = [
            # Identification and Basic Info
            "id", "name", "description", "created_at", "owner",

            # Address Fields
            "country", "state", "city", "postal", "street",

            # Contact Information
            "contact_number", "contact_email", "website_link", "social_media_link", "maps_link",

            # Cuisine and Media
            "cuisine", "cuisine_id", "logo", "photos",

            # Location and Timezone
            "latitude", "longitude", "timezone",

            # Engagement Metrics
            "favorites_count", "like_count", "dislike_count", "weekly_like_count", "favorite_details", "like_dislike_details",

            # Miscellaneous
            "currency"
        ]
        read_only_fields = [
            "owner", "created_at", "timezone", "latitude", "longitude", "favorites_count", "like_count",
            "dislike_count", "weekly_like_count", "is_favorite", "is_like", "is_dislike"
        ]

        extra_kwargs = {
            "contact_number": {"allow_blank": True},
            "contact_email": {"allow_blank": True},
            "website_link": {"allow_blank": True},
            "social_media_link": {"allow_blank": True},
            "maps_link": {"allow_blank": True},
            "logo": {"required": False},
            "cuisine": {"required": False}
        }
    
    def get_favorite_details(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            favorite = Favorite.objects.filter(user=user, restaurant=obj).first()
            return {
                "is_favorite": bool(favorite),
                "favorite_id": favorite.id if favorite else None
            }
        return {"is_favorite": False, "favorite_id": None}

    def get_like_dislike_details(self, obj):
        user = self.context.get('request').user
        if user.is_authenticated:
            like_dislike = LikeDislike.objects.filter(user=user, restaurant=obj).first()
            if like_dislike:
                return {
                    "is_like": like_dislike.type == "like",
                    "is_dislike": like_dislike.type == "dislike",
                    "like_dislike_id": like_dislike.id
                }
        return {"is_like": False, "is_dislike": False, "like_dislike_id": None}

    def validate(self, data):
        request = self.context.get('request')
        if request and request.method == "POST":
            if not data.get("name"):
                raise serializers.ValidationError({"detail": "Restaurant name is required."})

            if not data.get("cuisine") and not data.get("cuisine_id"):
                raise serializers.ValidationError({"detail": "Cuisine is required and must be valid."})

            contact_email = data.get("contact_email")
            if contact_email and "@" not in contact_email:
                raise serializers.ValidationError({"detail": "Enter a valid email address."})

            contact_number = data.get("contact_number")
            if contact_number and not contact_number.isdigit():
                raise serializers.ValidationError({"detail": "Contact number must contain only digits."})

            website_link = data.get("website_link")
            if website_link and not website_link.startswith(("http://", "https://")):
                raise serializers.ValidationError({"detail": "Website link must start with http:// or https://."})
            
            social_media_link = data.get("social_media_link")
            if social_media_link and not social_media_link.startswith(("http://", "https://")):
                raise serializers.ValidationError({"detail": "Social media link must start with http:// or https://."})

            maps_link = data.get("maps_link")
            if maps_link and not maps_link.startswith(("http://", "https://")):
                raise serializers.ValidationError({"detail": "Maps link must start with http:// or https://."})
        
         # Geocode the address
        address = f"{data.get('street', '')}, {data.get('city', '')}, {data.get('state', '')}, {data.get('postal', '')}, {data.get('country', '')}"
        geolocator = Nominatim(user_agent="restaurant_locator")
        try:
            location = geolocator.geocode(address)
            if location:
                data['latitude'] = location.latitude
                data['longitude'] = location.longitude

                # Determine the timezone
                tf = TimezoneFinder()
                data['timezone'] = tf.timezone_at(lat=location.latitude, lng=location.longitude)
            else:
                raise serializers.ValidationError({"detail": f"Invalid location. Please check the address details."})
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            raise serializers.ValidationError({"detail": "Invalid location"})
            
        return data
    

