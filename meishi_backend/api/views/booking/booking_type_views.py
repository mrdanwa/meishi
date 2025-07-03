from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from api.models.booking.booking_system import BookingSystem
from api.models.booking.booking import BookingTypes
from api.serializers.booking import BookingTypeSerializer
from api.permissions import IsRestaurantAccount
from rest_framework.permissions import IsAuthenticated

class BookingTypesListCreateView(generics.ListCreateAPIView):
    """
    Handles listing and creating booking types for a specific booking system.
    """
    serializer_class = BookingTypeSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsRestaurantAccount(), IsAuthenticated()]
        return []

    def get_queryset(self):
        id = self.kwargs.get('id')
        try:
            booking_system = BookingSystem.objects.get(id=id)
        except BookingSystem.DoesNotExist:
            raise NotFound({"detail": "Booking system not found."})
        return BookingTypes.objects.filter(booking_system=booking_system)

    def perform_create(self, serializer):
        id = self.kwargs.get('id')
        try:
            booking_system = BookingSystem.objects.get(id=id)
        except BookingSystem.DoesNotExist:
            raise NotFound({"detail": "Booking system not found."})

        # Ensure the user is associated with the restaurant of the booking system
        if booking_system.restaurant.owner != self.request.user:
            return Response(
                {"detail": "You do not have permission to create booking types for this restaurant."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer.save(booking_system=booking_system)

class BookingTypesDeleteView(generics.DestroyAPIView):
    """
    Handles deleting a specific booking type.
    """
    queryset = BookingTypes.objects.all()
    serializer_class = BookingTypeSerializer
    permission_classes = [IsAuthenticated, IsRestaurantAccount]

    def perform_destroy(self, instance):
        # Ensure the user is associated with the restaurant of the booking system
        if instance.booking_system.restaurant.owner != self.request.user:
            raise Response(
                {"detail": "You do not have permission to delete this booking type."},
                status=status.HTTP_403_FORBIDDEN
            )
        instance.delete()
