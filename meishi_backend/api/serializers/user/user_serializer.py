import re
from django.db import IntegrityError
from rest_framework import serializers

from api.models.user import CustomUser

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registration or updates that require extra fields,
    such as password, phone, email, etc.
    This is NOT the serializer used for public responses.
    """
    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "password",
            "profile_image",
            "email",
            "first_name",
            "last_name",
            "country_code",
            "phone_number",
            "user_type",
            "ghost",
        ]
        extra_kwargs = {
            "password": {"write_only": True, "required": True},
            "email": {"required": True},
            "first_name": {"required": True},
            "last_name": {"required": True},
            "country_code": {"required": True},
            "phone_number": {"required": True},
            "user_type": {"required": True},
        }

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        return value

    def create(self, validated_data):
        try:
            password = validated_data.pop("password")
            user = CustomUser(**validated_data)
            user.set_password(password)
            user.save()
            return user
        except IntegrityError as e:
            error_message = str(e)
            if 'unique_email_per_user_type' in error_message:
                raise serializers.ValidationError(
                    {"A user with this email and type already exists."}
                )
            elif 'unique_phone_per_user_type' in error_message:
                raise serializers.ValidationError(
                    {"A user with this phone number and type already exists."}
                )
            elif 'username' in error_message:
                raise serializers.ValidationError(
                    {"A user with this username already exists."}
                )
            else:
                raise serializers.ValidationError(
                    {"A registration error occurred."}
                )


class UserPublicSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = [
            "id",
            "username",
            "profile_image",
            "user_type",
        ]
