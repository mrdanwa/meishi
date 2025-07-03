from django import forms
from django.contrib import admin
from django.db.models import Q
from django.contrib.auth.admin import UserAdmin
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError
from timezonefinder import TimezoneFinder

from api.models.restaurant import Cuisine, Restaurant
from api.models.dish import Category, Course, Dish
from api.models.user import CustomUser
from api.models.booking import Booking, GeneralTimeSlot, BookingSystem, TimeSlot, BookingTypes  

### Cuisine Admin
@admin.register(Cuisine)
class CuisineAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

### Category Admin
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

### Course Admin
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

### Custom User Admin
class CustomUserAdminForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = "__all__"

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    form = CustomUserAdminForm
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'phone_number', 'is_active')
    list_filter = ('user_type', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone_number')
    ordering = ('username',)

### Restaurant Admin
class RestaurantAdminForm(forms.ModelForm):
    class Meta:
        model = Restaurant
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['owner'].queryset = CustomUser.objects.filter(
            Q(user_type='restaurant') | Q(is_superuser=True)
        )

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    form = RestaurantAdminForm
    list_display = ("id", "name", "owner", "country", "city", "latitude", "longitude", "timezone", "created_at")
    search_fields = ("name", "owner__email", "country", "city")
    list_filter = ("country", "state", "cuisine")
    readonly_fields = ("latitude", "longitude", "timezone", "favorites_count", "like_count", "dislike_count", "weekly_like_count", "created_at")

    def save_model(self, request, obj, form, change):
        address = f"{obj.street}, {obj.city}, {obj.state}, {obj.postal}, {obj.country}"
        geolocator = Nominatim(user_agent="restaurant_locator")

        try:
            location = geolocator.geocode(address)
            if location:
                obj.latitude = location.latitude
                obj.longitude = location.longitude
                tf = TimezoneFinder()
                obj.timezone = tf.timezone_at(lat=location.latitude, lng=location.longitude)
            else:
                self.message_user(
                    request,
                    f"Unable to geocode the address: {address}. Please check the address details.",
                    level='error'
                )
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            self.message_user(
                request,
                f"Error fetching geolocation data: {str(e)}",
                level='error'
            )

        super().save_model(request, obj, form, change)

### Dish Admin
@admin.register(Dish)
class DishAdmin(admin.ModelAdmin):
    list_display = ("id", 'name', 'get_restaurant_info', 'course', 'price', 'created_at')
    list_filter = ('course', 'restaurant', 'categories', 'created_at')
    search_fields = ('name', 'description', 'restaurant__name')
    ordering = ('-created_at',)
    readonly_fields = ('favorites_count', 'like_count', 'dislike_count', 'weekly_like_count', 'created_at')
    filter_horizontal = ('categories',)

    def get_restaurant_info(self, obj):
        return f"{obj.restaurant.name} (ID: {obj.restaurant.id})"
    get_restaurant_info.short_description = 'Restaurant'
    get_restaurant_info.admin_order_field = 'restaurant__name'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "restaurant":
            class RestaurantModelChoiceField(forms.ModelChoiceField):
                def label_from_instance(self, obj):
                    return f"{obj.name} (ID: {obj.id})"

            return RestaurantModelChoiceField(
                queryset=Restaurant.objects.all().order_by('name'),
                required=not db_field.null
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

### Booking System Admin
@admin.register(BookingSystem)
class BookingSystemAdmin(admin.ModelAdmin):
    list_display = ('id', 'restaurant', 'meal_type', 'is_paused', 'created_at')
    list_filter = ('meal_type', 'is_paused', 'created_at', 'restaurant')
    search_fields = ('restaurant__name', 'meal_type')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

### General Time Slot Admin
@admin.register(GeneralTimeSlot)
class GeneralTimeSlotAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking_system', 'weekday', 'start_time', 'end_time', 'interval_minutes', 'max_people', 'max_tables', 'min', 'max', 'created_at')
    list_filter = ('weekday', 'booking_system', 'created_at')
    search_fields = ('booking_system__restaurant__name', 'booking_system__meal_type')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

### Time Slot Admin
@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking_system', 'date', 'time', 'is_open', 'max_people', 'max_tables', 'min', 'max', 'created_at')
    list_filter = ('date', 'booking_system', 'is_open')
    search_fields = ('booking_system__restaurant__name', 'booking_system__meal_type')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)

### Booking Admin
@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'get_date', 'get_time', 'first_name', 'last_name', 'people', 'phone', 'email', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'time_slot__date', 'time_slot__booking_system__restaurant')
    search_fields = ('booking_code', 'first_name', 'last_name', 'phone', 'email', 'user__username', 'time_slot__booking_system__restaurant__name')
    ordering = ('-created_at',)
    readonly_fields = ('booking_code', 'created_at', 'updated_at')

    def get_date(self, obj):
        return obj.time_slot.date if obj.time_slot else None
    get_date.short_description = 'Date'
    get_date.admin_order_field = 'time_slot__date'

    def get_time(self, obj):
        return obj.time_slot.time if obj.time_slot else None
    get_time.short_description = 'Time'
    get_time.admin_order_field = 'time_slot__time'

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "time_slot":
            class TimeSlotModelChoiceField(forms.ModelChoiceField):
                def label_from_instance(self, slot_obj):
                    return f"{slot_obj.date} - {slot_obj.time} (ID: {slot_obj.id})"

            kwargs['queryset'] = db_field.related_model.objects.all().order_by('date', 'time')
            return TimeSlotModelChoiceField(**kwargs)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

### Booking Types Admin
@admin.register(BookingTypes)
class BookingTypesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'booking_system')
    search_fields = ('name', 'booking_system__restaurant__name', 'booking_system__meal_type')
    list_filter = ('booking_system',)
    ordering = ('name',)
