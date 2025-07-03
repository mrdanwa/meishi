import { useState, useEffect } from "react";
import api from "../../../../config/api";
import DishCard from "./DishCard";
import { handleError } from "../../../../utils/errorHandler";

const DishSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4">
      <div className="flex">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            {/* Image skeleton */}
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 animate-pulse" />

            <div className="flex-1 min-w-0">
              {/* Title and price row */}
              <div className="flex items-start w-full">
                <div className="flex-1 min-w-0 mr-4">
                  {/* Title skeleton */}
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
                <div className="flex-shrink-0">
                  {/* Price skeleton */}
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
        {/* Like button skeleton */}
        <div className="w-16 h-9 bg-gray-200 rounded-full animate-pulse" />
        {/* Dislike button skeleton */}
        <div className="w-16 h-9 bg-gray-200 rounded-full animate-pulse" />
        {/* Favorite button skeleton */}
        <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

export default function DishList({ restaurantId }) {
  const [dishes, setDishes] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [dishTypes, setDishTypes] = useState([]);

  useEffect(() => {
    fetchData();
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      const [dishesRes, restaurantRes] = await Promise.all([
        api.get(`/api/restaurants/${restaurantId}/dishes/`),
        api.get(`/api/restaurants/${restaurantId}/`),
      ]);

      const dishesData = dishesRes.data.results || dishesRes.data;
      const processedDishes = Array.isArray(dishesData) ? dishesData : [];

      const types = [
        ...new Set(processedDishes.map((dish) => dish.type)),
      ].sort();
      setDishTypes(types);

      if (types.length > 0 && !selectedType) {
        setSelectedType(types[0]);
      }

      setDishes(processedDishes);
      setRestaurant(restaurantRes.data);
    } catch (error) {
      handleError(error);
      setDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (dishId) => {
    try {
      await api.delete(`/api/dishes/${dishId}/delete/`);
      setDishes(dishes.filter((dish) => dish.id !== dishId));
    } catch (error) {
      handleError(error);
    }
  };

  const handleUpdate = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <DishSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (dishes.length === 0) {
    return (
      <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <span className="text-2xl">🍽️</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No dishes available
        </h3>
      </div>
    );
  }

  const filteredDishes = selectedType
    ? dishes.filter((dish) => dish.type === selectedType)
    : dishes;

  return (
    <div className="space-y-6">
      {/* Type selection buttons */}
      <div className="flex flex-wrap gap-2">
        {dishTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
              selectedType === type
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Dishes grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredDishes.map((dish) => (
          <div
            key={dish.id}
            className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <DishCard
              dish={dish}
              restaurant={restaurant}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
