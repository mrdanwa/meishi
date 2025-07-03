import { Link } from "react-router-dom";
import { useState } from "react";
import { Heart, ThumbsUp, ThumbsDown, MapPin } from "lucide-react";
import api from "../../../../config/api";

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

export default function DishCard({ dish, onInteraction }) {
  const [isLoading, setIsLoading] = useState(false);
  const [interactions, setInteractions] = useState({
    isFavorite: dish?.favorite_details?.is_favorite || false,
    isLike: dish?.like_dislike_details?.is_like || false,
    isDislike: dish?.like_dislike_details?.is_dislike || false,
    likeCount: dish?.like_count || 0,
    dislikeCount: dish?.dislike_count || 0,
    favoriteId: dish?.favorite_details?.favorite_id,
    likeDislikeId: dish?.like_dislike_details?.like_dislike_id,
  });

  const handleToggleLike = async (e) => {
    e.preventDefault();
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
        const response = await api.post("/api/likes-dislikes/dishes/create/", {
          dish: dish.id,
          type: "like",
        });
        setInteractions((prev) => ({
          ...prev,
          likeDislikeId: response.data.id,
        }));
      } else if (interactions.isLike) {
        await api.delete(
          `/api/likes-dislikes/dishes/${interactions.likeDislikeId}/delete/`
        );
      } else {
        await api.patch(
          `/api/likes-dislikes/dishes/${interactions.likeDislikeId}/update/`,
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
    e.preventDefault();
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
        const response = await api.post("/api/likes-dislikes/dishes/create/", {
          dish: dish.id,
          type: "dislike",
        });
        setInteractions((prev) => ({
          ...prev,
          likeDislikeId: response.data.id,
        }));
      } else if (interactions.isDislike) {
        await api.delete(
          `/api/likes-dislikes/dishes/${interactions.likeDislikeId}/delete/`
        );
      } else {
        await api.patch(
          `/api/likes-dislikes/dishes/${interactions.likeDislikeId}/update/`,
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
    e.preventDefault();
    if (isLoading) return;

    setInteractions((prev) => ({
      ...prev,
      isFavorite: !prev.isFavorite,
    }));

    setIsLoading(true);
    const prevState = { ...interactions };

    try {
      if (!interactions.isFavorite) {
        const response = await api.post("/api/favorites/dishes/create/", {
          dish: dish.id,
        });
        setInteractions((prev) => ({
          ...prev,
          favoriteId: response.data.id,
        }));
      } else {
        await api.delete(
          `/api/favorites/dishes/${interactions.favoriteId}/delete/`
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <Link to={`/dish/${dish.id}`} className="block">
        <div className="p-4">
          <div className="flex">
            <div className="flex-1">
              <div className="flex items-start space-x-4">
                {dish.image && (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start w-full">
                    <div className="flex-1 min-w-0 mr-4">
                      <h3 className="text-md font-semibold text-gray-900">
                        {dish.name}
                      </h3>
                    </div>
                    <div className="flex-shrink-0">
                      <p className="text-md font-medium text-gray-900 whitespace-nowrap">
                        {dish.price} {dish.currency}
                      </p>
                    </div>
                  </div>

                  {/* Categories */}
                  {dish.categories && dish.categories.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1.5 -ml-0.5">
                        {dish.categories.map((category) => (
                          <span
                            key={category.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restaurant name and location */}
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm font-medium text-gray-600">
                      {dish.restaurant_name}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {dish.city}, {dish.country}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Interaction buttons section */}
      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
        <div className="flex justify-end gap-4">
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
    </div>
  );
}
