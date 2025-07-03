import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Heart, ThumbsUp, ThumbsDown, MapPin } from "lucide-react";
import api from "../../../../config/api";
import PhotoCarousel from "../../../../components/shared/CardPhotoCarousel";

const DEFAULT_LOGO = "https://placehold.co/200x200?text=Restaurant";

const InteractionButton = ({
  icon: Icon,
  count,
  isActive,
  onClick,
  isLoading,
  activeColor = "text-primary",
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className={`flex items-center gap-2 px-2.5 py-2 rounded-full 
      transition-all duration-200 
      bg-gray-200/50 hover:bg-gray-300/50
      ${
        isActive
          ? `${activeColor} bg-primary/20 hover:bg-primary/30`
          : "text-gray-600"
      }
      ${isLoading ? "pointer-events-none" : ""}
    `}
  >
    <Icon
      className={`w-5 h-5 ${isActive ? "fill-current" : ""}`}
      strokeWidth={2.5}
    />
    {count !== undefined && (
      <span className="text-sm font-medium">{count}</span>
    )}
  </button>
);

export default function RestaurantCard({ restaurant, onInteraction }) {
  const [isLoading, setIsLoading] = useState(false);
  const [interactions, setInteractions] = useState({
    isFavorite: restaurant.favorite_details?.is_favorite || false,
    isLike: restaurant.like_dislike_details?.is_like || false,
    isDislike: restaurant.like_dislike_details?.is_dislike || false,
    likeCount: restaurant.like_count,
    dislikeCount: restaurant.dislike_count,
    favoriteId: restaurant.favorite_details?.favorite_id,
    likeDislikeId: restaurant.like_dislike_details?.like_dislike_id,
  });
  const [photos, setPhotos] = useState([]);

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

  const handleToggleLike = async (e) => {
    e.preventDefault(); // Prevent card navigation when clicking the button
    if (isLoading) return;

    setInteractions((prev) => {
      if (!prev.isLike && !prev.isDislike) {
        return {
          ...prev,
          isLike: true,
          likeCount: prev.likeCount + 1,
        };
      }
      if (prev.isLike) {
        return {
          ...prev,
          isLike: false,
          likeCount: prev.likeCount - 1,
        };
      }
      return {
        ...prev,
        isLike: true,
        isDislike: false,
        likeCount: prev.likeCount + 1,
        dislikeCount: prev.dislikeCount - 1,
      };
    });

    setIsLoading(true);
    const prevState = { ...interactions };

    try {
      if (!interactions.isLike && !interactions.isDislike) {
        const response = await api.post(
          "/api/likes-dislikes/restaurants/create/",
          {
            restaurant: restaurant.id,
            type: "like",
          }
        );
        setInteractions((prev) => ({
          ...prev,
          likeDislikeId: response.data.id,
        }));
      } else if (interactions.isLike) {
        await api.delete(
          `/api/likes-dislikes/restaurants/${interactions.likeDislikeId}/delete/`
        );
      } else {
        await api.patch(
          `/api/likes-dislikes/restaurants/${interactions.likeDislikeId}/update/`,
          {
            type: "like",
          }
        );
      }
      onInteraction && onInteraction();
    } catch (err) {
      setInteractions(prevState);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDislike = async (e) => {
    e.preventDefault(); // Prevent card navigation when clicking the button
    if (isLoading) return;

    setInteractions((prev) => {
      if (!prev.isLike && !prev.isDislike) {
        return {
          ...prev,
          isDislike: true,
          dislikeCount: prev.dislikeCount + 1,
        };
      }
      if (prev.isDislike) {
        return {
          ...prev,
          isDislike: false,
          dislikeCount: prev.dislikeCount - 1,
        };
      }
      return {
        ...prev,
        isLike: false,
        isDislike: true,
        likeCount: prev.likeCount - 1,
        dislikeCount: prev.dislikeCount + 1,
      };
    });

    setIsLoading(true);
    const prevState = { ...interactions };

    try {
      if (!interactions.isLike && !interactions.isDislike) {
        const response = await api.post(
          "/api/likes-dislikes/restaurants/create/",
          {
            restaurant: restaurant.id,
            type: "dislike",
          }
        );
        setInteractions((prev) => ({
          ...prev,
          likeDislikeId: response.data.id,
        }));
      } else if (interactions.isDislike) {
        await api.delete(
          `/api/likes-dislikes/restaurants/${interactions.likeDislikeId}/delete/`
        );
      } else {
        await api.patch(
          `/api/likes-dislikes/restaurants/${interactions.likeDislikeId}/update/`,
          {
            type: "dislike",
          }
        );
      }
      onInteraction && onInteraction();
    } catch (err) {
      setInteractions(prevState);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = async (e) => {
    e.preventDefault(); // Prevent card navigation when clicking the button
    if (isLoading) return;

    setInteractions((prev) => ({
      ...prev,
      isFavorite: !prev.isFavorite,
    }));

    setIsLoading(true);
    const prevState = { ...interactions };

    try {
      if (!interactions.isFavorite) {
        const response = await api.post("/api/favorites/restaurants/create/", {
          restaurant: restaurant.id,
        });
        setInteractions((prev) => ({
          ...prev,
          favoriteId: response.data.id,
        }));
      } else {
        await api.delete(
          `/api/favorites/restaurants/${interactions.favoriteId}/delete/`
        );
      }
      onInteraction && onInteraction();
    } catch (err) {
      setInteractions(prevState);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link
      to={`/restaurant/${restaurant.id}/view`}
      className="block bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg"
    >
      <div className="relative h-48">
        {/* Carousel */}
        <PhotoCarousel photos={photos} />

        {/* Interaction Buttons */}
        <div className="absolute top-2 right-2 flex gap-2">
          <InteractionButton
            icon={ThumbsUp}
            count={interactions.likeCount}
            isActive={interactions.isLike}
            onClick={handleToggleLike}
            isLoading={isLoading}
            activeColor="text-blue-500"
          />
          <InteractionButton
            icon={ThumbsDown}
            count={interactions.dislikeCount}
            isActive={interactions.isDislike}
            onClick={handleToggleDislike}
            isLoading={isLoading}
            activeColor="text-blue-500"
          />
          <InteractionButton
            icon={Heart}
            isActive={interactions.isFavorite}
            onClick={handleToggleFavorite}
            isLoading={isLoading}
            activeColor="text-red-500"
          />
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
    </Link>
  );
}
