import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ThumbsUp, ThumbsDown, MapPin, X } from "lucide-react";
import api from "../../../config/api";
import { handleError } from "../../../utils/errorHandler";

const DEFAULT_LOGO = "https://placehold.co/200x200?text=Restaurant";

const InteractionButton = ({
  icon: Icon,
  count,
  isActive,
  onClick,
  isLoading,
  activeColor = "text-primary",
  showCount = true,
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
    {showCount && count !== undefined && (
      <span className="text-sm font-medium">{count}</span>
    )}
  </button>
);

export default function DishDetails() {
  const [dish, setDish] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [interactions, setInteractions] = useState({
    isFavorite: false,
    isLike: false,
    isDislike: false,
    favoritesCount: 0,
    likeCount: 0,
    dislikeCount: 0,
    likeDislikeId: null,
    favoriteId: null,
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const dishResponse = await api.get(`/api/dishes/${id}/`);
      setDish(dishResponse.data);
      setInteractions({
        isFavorite: dishResponse.data.favorite_details?.is_favorite || false,
        isLike: dishResponse.data.like_dislike_details?.is_like || false,
        isDislike: dishResponse.data.like_dislike_details?.is_dislike || false,
        favoritesCount: dishResponse.data.favorites_count,
        likeCount: dishResponse.data.like_count,
        dislikeCount: dishResponse.data.dislike_count,
        likeDislikeId:
          dishResponse.data.like_dislike_details?.like_dislike_id || null,
        favoriteId: dishResponse.data.favorite_details?.favorite_id || null,
      });

      if (dishResponse.data.restaurant) {
        const restaurantResponse = await api.get(
          `/api/restaurants/${dishResponse.data.restaurant}/`
        );
        setRestaurant(restaurantResponse.data);
      }
    } catch (error) {
      handleError(error);
      navigate("/user/home");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInteraction = async (type) => {
    if (isLoading || !dish) return;

    const prevState = { ...interactions };
    setInteractions((prev) => {
      let updatedState = { ...prev };
      if (type === "like") {
        if (!prev.isLike && !prev.isDislike) {
          updatedState = {
            ...prev,
            isLike: true,
            likeCount: prev.likeCount + 1,
          };
        } else if (prev.isLike) {
          updatedState = {
            ...prev,
            isLike: false,
            likeCount: prev.likeCount - 1,
          };
        } else {
          updatedState = {
            ...prev,
            isLike: true,
            isDislike: false,
            likeCount: prev.likeCount + 1,
            dislikeCount: prev.dislikeCount - 1,
          };
        }
      } else if (type === "dislike") {
        if (!prev.isLike && !prev.isDislike) {
          updatedState = {
            ...prev,
            isDislike: true,
            dislikeCount: prev.dislikeCount + 1,
          };
        } else if (prev.isDislike) {
          updatedState = {
            ...prev,
            isDislike: false,
            dislikeCount: prev.dislikeCount - 1,
          };
        } else {
          updatedState = {
            ...prev,
            isLike: false,
            isDislike: true,
            likeCount: prev.likeCount - 1,
            dislikeCount: prev.dislikeCount + 1,
          };
        }
      } else if (type === "favorite") {
        updatedState = {
          ...prev,
          isFavorite: !prev.isFavorite,
        };
      }
      return updatedState;
    });

    setIsLoading(true);

    try {
      if (type === "like") {
        if (!prevState.isLike && !prevState.isDislike) {
          const response = await api.post(
            "/api/likes-dislikes/dishes/create/",
            {
              dish: dish.id,
              type: "like",
            }
          );
          setInteractions((prev) => ({
            ...prev,
            likeDislikeId: response.data.id,
          }));
        } else if (prevState.isLike) {
          await api.delete(
            `/api/likes-dislikes/dishes/${prevState.likeDislikeId}/delete/`
          );
        } else {
          await api.patch(
            `/api/likes-dislikes/dishes/${prevState.likeDislikeId}/update/`,
            {
              type: "like",
            }
          );
        }
      } else if (type === "dislike") {
        if (!prevState.isLike && !prevState.isDislike) {
          const response = await api.post(
            "/api/likes-dislikes/dishes/create/",
            {
              dish: dish.id,
              type: "dislike",
            }
          );
          setInteractions((prev) => ({
            ...prev,
            likeDislikeId: response.data.id,
          }));
        } else if (prevState.isDislike) {
          await api.delete(
            `/api/likes-dislikes/dishes/${prevState.likeDislikeId}/delete/`
          );
        } else {
          await api.patch(
            `/api/likes-dislikes/dishes/${prevState.likeDislikeId}/update/`,
            {
              type: "dislike",
            }
          );
        }
      } else if (type === "favorite") {
        if (!prevState.isFavorite) {
          const response = await api.post("/api/favorites/dishes/create/", {
            dish: dish.id,
          });
          setInteractions((prev) => ({
            ...prev,
            favoriteId: response.data.id,
          }));
        } else {
          await api.delete(
            `/api/favorites/dishes/${prevState.favoriteId}/delete/`
          );
        }
      }
    } catch (err) {
      setInteractions(prevState);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              {/* Restaurant Card Skeleton */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Dish Header Section */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-36 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="flex gap-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-6 bg-gray-200 rounded w-24 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Description Column */}
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                  </div>
                </div>

                {/* Details Column */}
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Interaction Buttons Section */}
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
              <div className="flex justify-center gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-24 h-10 bg-gray-200 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!dish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Dish not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            {restaurant && (
              <div
                onClick={() => navigate(`/restaurant/${restaurant.id}/view`)}
                className="mb-6 p-4 border rounded-lg bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={restaurant.logo || DEFAULT_LOGO}
                    alt={restaurant.name}
                    className="w-20 h-20 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = DEFAULT_LOGO;
                    }}
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {restaurant.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {restaurant.city}, {restaurant.country}
                      </span>
                    </div>
                    {restaurant.cuisine && (
                      <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {restaurant.cuisine.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Header section with image and name */}
            <div className="flex items-start space-x-4 mb-6">
              {dish.image && (
                <button
                  onClick={() => setIsImageModalOpen(true)}
                  className="group relative w-36 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      View larger
                    </span>
                  </div>
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {dish.name}
                </h1>
                {dish.categories && dish.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {dish.categories.map((category) => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {dish.description && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line break-words max-h-48 overflow-y-auto">
                    {dish.description}
                  </p>
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Details
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600">{dish.course?.name}</p>
                  <p className="text-gray-600">{dish.type}</p>
                  <p className="text-gray-600">
                    {dish.price} {restaurant?.currency}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction buttons section */}
          <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
            <div className="flex justify-center gap-4">
              <InteractionButton
                icon={ThumbsUp}
                count={interactions.likeCount}
                isActive={interactions.isLike}
                onClick={() => handleToggleInteraction("like")}
                isLoading={isLoading}
                activeColor="text-blue-500"
              />
              <InteractionButton
                icon={ThumbsDown}
                count={interactions.dislikeCount}
                isActive={interactions.isDislike}
                onClick={() => handleToggleInteraction("dislike")}
                isLoading={isLoading}
                activeColor="text-blue-500"
              />
              <InteractionButton
                icon={Heart}
                isActive={interactions.isFavorite}
                onClick={() => handleToggleInteraction("favorite")}
                isLoading={isLoading}
                activeColor="text-red-500"
                showCount={false}
              />
            </div>
          </div>

          {/* Custom Image Modal */}
          {isImageModalOpen && dish.image && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
              onClick={() => setIsImageModalOpen(false)}
            >
              <div
                className="relative bg-white rounded-lg max-w-3xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {dish.name}
                  </h3>
                  <button
                    onClick={() => setIsImageModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="relative w-full aspect-video p-4">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
