import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../config/api";
import { handleError } from "../../../utils/errorHandler";
import RestaurantForm from "../components/restaurant/RestaurantForm";
import RestaurantInfo from "../components/restaurant/RestaurantInfo";
import DishList from "../components/dishes/DishList";
import DishForm from "../components/dishes/DishForm";

export default function RestaurantDetails() {
  const [restaurant, setRestaurant] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [loading, setLoading] = useState(true);
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
    } catch (error) {
      handleError(error);
      navigate("/restaurant/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSuccess = () => {
    fetchData();
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
        <RestaurantInfo
          restaurant={restaurant}
          photos={photos}
          onPhotoChange={fetchData}
          onEdit={() => setShowEditModal(true)}
        />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
            <button
              onClick={() => setShowDishModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-sm"
            >
              Add Dish
            </button>
          </div>
          <DishList restaurantId={restaurant.id} />
        </div>

        <RestaurantForm
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          restaurant={restaurant}
          onSuccess={handleUpdateSuccess}
        />

        <DishForm
          isOpen={showDishModal}
          onClose={() => setShowDishModal(false)}
          restaurantId={restaurant.id}
          onSuccess={handleUpdateSuccess}
        />
      </div>
    </div>
  );
}
