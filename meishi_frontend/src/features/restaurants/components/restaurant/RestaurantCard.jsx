import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ThumbsUp, ThumbsDown, MapPin } from "lucide-react";
import api from "../../../../config/api";
import PhotoCarousel from "../../../../components/shared/CardPhotoCarousel";

const DEFAULT_LOGO = "https://placehold.co/200x200?text=Restaurant";

export default function RestaurantCard({ restaurant, onInteraction }) {
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotos();
  }, [restaurant.id]);

  const fetchPhotos = async () => {
    try {
      const response = await api.get(
        `/api/restaurants/${restaurant.id}/photos/`
      );
      setPhotos(response.data);
    } catch (error) {
      console.error("Failed to fetch photos:", error);
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation(); // Prevent event propagation
    navigate(`/restaurant/${restaurant.id}`);
  };

  const handleManageBookings = (e) => {
    e.stopPropagation();
    navigate(`/restaurant/bookings?id=${restaurant.id}`);
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
      onClick={handleViewDetails}
    >
      <div className="relative h-48">
        <PhotoCarousel photos={photos} />

        {/* Stats display */}
        <div className="absolute top-2 right-2 flex gap-2">
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-full bg-gray-200/50 text-green-600">
            <ThumbsUp className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-sm font-medium">{restaurant.like_count}</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-full bg-gray-200/50 text-red-600">
            <ThumbsDown className="w-5 h-5" strokeWidth={2.5} />
            <span className="text-sm font-medium">
              {restaurant.dislike_count}
            </span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-full bg-gray-200/50 text-red-500">
            <Heart className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
            <span className="text-sm font-medium">
              {restaurant.favorites_count}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            <img
              src={restaurant.logo || DEFAULT_LOGO}
              alt={restaurant.name}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_LOGO;
              }}
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {restaurant.name}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {restaurant.cuisine?.name}
              </span>
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {restaurant.city}, {restaurant.country}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
        <div className="flex justify-end">
          <button
            onClick={handleManageBookings}
            className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-sm"
          >
            Manage Bookings
          </button>
        </div>
      </div>
    </div>
  );
}
