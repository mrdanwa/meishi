import { useState } from "react";
import api from "../../../../config/api";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  ThumbsUp,
  ThumbsDown,
  MapPin,
  Phone,
  Mail,
  Globe,
  Share2,
} from "lucide-react";
import PhotoCarousel from "../../../../components/shared/DetailPhotoCarousel";
import PhotoManager from "./PhotoManager";

const DEFAULT_LOGO = "https://placehold.co/200x200?text=Restaurant";

export default function RestaurantInfo({
  restaurant,
  photos,
  onPhotoChange,
  onEdit,
}) {
  const [showPhoto, setShowPhoto] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this restaurant?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.delete(
        `/api/restaurants/${restaurant.id}/delete/`
      );
      if (response.status === 204) {
        navigate("/restaurant/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete restaurant:", error);
      alert("Failed to delete restaurant");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="relative">
        <PhotoCarousel photos={photos} />

        {/* Interaction Stats - Updated for mobile */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-200/50 text-green-600">
            <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-medium">
              {restaurant.like_count}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-200/50 text-red-600">
            <ThumbsDown className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
            <span className="text-xs sm:text-sm font-medium">
              {restaurant.dislike_count}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-200/50 text-red-500">
            <Heart
              className="w-4 h-4 sm:w-5 sm:h-5"
              strokeWidth={2.5}
              fill="currentColor"
            />
            <span className="text-xs sm:text-sm font-medium">
              {restaurant.favorites_count}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start space-x-4 mb-6">
          <img
            src={restaurant.logo || DEFAULT_LOGO}
            alt={restaurant.name}
            className="w-20 sm:w-24 h-20 sm:h-24 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_LOGO;
            }}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {restaurant.name}
            </h1>
            <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
              {restaurant.cuisine?.name}
            </span>
          </div>
        </div>

        {restaurant.description && (
          <div className="mb-6">
            <h2 className="text-ls font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line">
              {restaurant.description}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {restaurant.contact_number && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                <a
                  href={`tel:${restaurant.contact_number}`}
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {restaurant.contact_number}
                </a>
              </div>
            )}

            {restaurant.contact_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                <a
                  href={`mailto:${restaurant.contact_email}`}
                  className="text-sm sm:text-base text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  {restaurant.contact_email}
                </a>
              </div>
            )}

            {(restaurant.website_link || restaurant.social_media_link) && (
              <div className="flex flex-col gap-2">
                {restaurant.website_link && (
                  <div className="flex items-center gap-2">
                    <a
                      href={restaurant.website_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Globe className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="text-sm sm:text-base">Website</span>
                    </a>
                  </div>
                )}
                {restaurant.social_media_link && (
                  <div className="flex items-center gap-2">
                    <a
                      href={restaurant.social_media_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                    >
                      <Share2 className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="text-sm sm:text-base">Social Media</span>
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${restaurant.name} ${restaurant.street} ${restaurant.city} ${restaurant.state} ${restaurant.postal} ${restaurant.country}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 group transition-colors duration-200"
              >
                <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 group-hover:text-blue-500" />
                <div className="group-hover:text-blue-500">
                  <p className="text-sm text-gray-600 group-hover:text-blue-500">
                    {restaurant.street}
                  </p>
                  <p className="text-sm text-gray-600 group-hover:text-blue-500">
                    {restaurant.city}, {restaurant.state} {restaurant.postal}
                  </p>
                  <p className="text-sm text-gray-600 group-hover:text-blue-500">
                    {restaurant.country}
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Updated for mobile */}
      <div className="border-t border-gray-100 bg-gray-50 px-3 sm:px-4 py-2">
        <div className="flex justify-end gap-2 sm:gap-4">
          <button
            onClick={() => setShowPhoto(true)}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white shadow-sm text-gray-700 hover:bg-gray-50 border border-gray-200 text-xs sm:text-sm transition-all duration-300"
          >
            Photos
          </button>
          <button
            onClick={onEdit}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-white shadow-sm text-gray-700 hover:bg-gray-50 border border-gray-200 text-xs sm:text-sm transition-all duration-300"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 text-xs sm:text-sm transition-all duration-300 shadow-sm"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      <PhotoManager
        isOpen={showPhoto}
        onClose={() => setShowPhoto(false)}
        restaurantId={restaurant.id}
        photos={photos}
        onPhotoChange={onPhotoChange}
      />
    </div>
  );
}
