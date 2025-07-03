import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import api from "../../../config/api";
import { handleError } from "../../../utils/errorHandler";
import PhotoCarousel from "../../../components/shared/DetailPhotoCarousel";
import DishList from "../components/restaurants/DishList";
import UserBookingForm from "../components/restaurants/UserBookingForm";

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

export default function RestaurantDetails() {
  const [restaurant, setRestaurant] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
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
      const [restaurantRes, photosRes] = await Promise.all([
        api.get(`/api/restaurants/${id}/`),
        api.get(`/api/restaurants/${id}/photos/`),
      ]);
      setRestaurant(restaurantRes.data);
      setPhotos(photosRes.data);
      setInteractions({
        isFavorite: restaurantRes.data.favorite_details?.is_favorite || false,
        isLike: restaurantRes.data.like_dislike_details?.is_like || false,
        isDislike: restaurantRes.data.like_dislike_details?.is_dislike || false,
        favoritesCount: restaurantRes.data.favorites_count,
        likeCount: restaurantRes.data.like_count,
        dislikeCount: restaurantRes.data.dislike_count,
        likeDislikeId:
          restaurantRes.data.like_dislike_details?.like_dislike_id || null,
        favoriteId: restaurantRes.data.favorite_details?.favorite_id || null,
      });
    } catch (error) {
      handleError(error);
      navigate("/user/home");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInteraction = async (type) => {
    if (isLoading || !restaurant) return;

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
        } else if (prevState.isLike) {
          await api.delete(
            `/api/likes-dislikes/restaurants/${prevState.likeDislikeId}/delete/`
          );
        } else {
          await api.patch(
            `/api/likes-dislikes/restaurants/${prevState.likeDislikeId}/update/`,
            {
              type: "like",
            }
          );
        }
      } else if (type === "dislike") {
        if (!prevState.isLike && !prevState.isDislike) {
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
        } else if (prevState.isDislike) {
          await api.delete(
            `/api/likes-dislikes/restaurants/${prevState.likeDislikeId}/delete/`
          );
        } else {
          await api.patch(
            `/api/likes-dislikes/restaurants/${prevState.likeDislikeId}/update/`,
            {
              type: "dislike",
            }
          );
        }
      } else if (type === "favorite") {
        if (!prevState.isFavorite) {
          const response = await api.post(
            "/api/favorites/restaurants/create/",
            {
              restaurant: restaurant.id,
            }
          );
          setInteractions((prev) => ({
            ...prev,
            favoriteId: response.data.id,
          }));
        } else {
          await api.delete(
            `/api/favorites/restaurants/${prevState.favoriteId}/delete/`
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
            {/* Photo Carousel Skeleton */}
            <div className="relative">
              <div className="w-full h-96 bg-gray-200 animate-pulse" />

              {/* Interaction Buttons Skeleton */}
              <div className="absolute top-4 right-4 flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-10 bg-gray-300 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="p-6">
              {/* Restaurant Header Skeleton */}
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                  <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
                </div>
              </div>

              {/* Description Skeleton */}
              <div className="mb-6 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-1/6 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>

              {/* Contact and Location Info Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Section Skeleton */}
          <div className="mt-8">
            <div className="space-y-6">
              {/* Type selection buttons skeleton */}
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
                  />
                ))}
              </div>

              {/* Dishes grid skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300"
                  >
                    <div className="p-4">
                      <div className="flex">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            {/* Dish image skeleton */}
                            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />

                            <div className="flex-1 min-w-0">
                              {/* Title and price row */}
                              <div className="flex items-start w-full">
                                <div className="flex-1 min-w-0 mr-4">
                                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                                </div>
                                <div className="flex-shrink-0">
                                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                                </div>
                              </div>

                              {/* Description skeleton */}
                              <div className="mt-2">
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse mt-2" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interaction buttons skeleton */}
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
                      <div className="flex justify-end gap-4">
                        <div className="w-16 h-9 bg-gray-200 rounded-full animate-pulse" />
                        <div className="w-16 h-9 bg-gray-200 rounded-full animate-pulse" />
                        <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Restaurant not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative">
            <PhotoCarousel photos={photos} />

            {/* Interaction Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
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

          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <img
                src={restaurant.logo || DEFAULT_LOGO}
                alt={restaurant.name}
                className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_LOGO;
                }}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {restaurant.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                  {restaurant.cuisine?.name}
                </span>
              </div>
              <button
                onClick={() => setShowBookingForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-sm"
              >
                Book a Table
              </button>
            </div>

            {restaurant.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  About
                </h2>
                <p className="text-ls text-gray-600 whitespace-pre-line">
                  {restaurant.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {restaurant.contact_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a
                      href={`tel:${restaurant.contact_number}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      {restaurant.contact_number}
                    </a>
                  </div>
                )}

                {restaurant.contact_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a
                      href={`mailto:${restaurant.contact_email}`}
                      className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
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
                          <span className="text-sm sm:text-base">
                            Social Media
                          </span>
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
                        {restaurant.city}, {restaurant.state}{" "}
                        {restaurant.postal}
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
        </div>

        <div className="mt-8">
          <DishList restaurantId={restaurant.id} />
        </div>

        <UserBookingForm
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          restaurantId={restaurant.id}
          onSuccess={() => {
            setShowBookingForm(false);
            // Optionally show a success message or refresh data
          }}
        />
      </div>
    </div>
  );
}
