# api/apps.py

from django.apps import AppConfig

class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    
    def ready(self):
        import api.models # This ensures models are properly loaded
        import api.models.booking.signals
        import api.models.dish.signals
        import api.models.restaurant.signals
        import api.models.user.signals