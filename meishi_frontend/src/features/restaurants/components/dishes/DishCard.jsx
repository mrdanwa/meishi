import { useState } from "react";
import { Heart, ThumbsUp, ThumbsDown } from "lucide-react";
import DishForm from "./DishForm";

const DEFAULT_IMAGE = "https://placehold.co/400x400?text=No+Image";

export default function DishCard({ dish, restaurant, onDelete, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this dish?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(dish.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return `${price} ${restaurant?.currency || ""}`.trim();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <>
      <div className="w-full bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div className="p-6">
          <div className="flex gap-6">
            {/* Image Section - Always show with fallback */}
            <div className="flex-shrink-0">
              <img
                src={!imageError ? dish.image || DEFAULT_IMAGE : DEFAULT_IMAGE}
                alt={dish.name}
                onError={handleImageError}
                className="w-32 h-32 object-cover rounded-lg bg-gray-100"
              />
            </div>

            {/* Content Section */}
            <div className="flex-grow min-w-0">
              <h3 className="text-xl font-semibold text-gray-800">
                {dish.name}
              </h3>
              <p className="text-gray-600 mt-2 line-clamp-2">
                {dish.description}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {formatPrice(dish.price)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {dish.course?.name || "None"}
                  </p>
                </div>
                <div className="space-y-2">
                  {dish.categories && dish.categories.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1.5 mt-1">
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Section - Updated for better responsiveness */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 py-2 sm:py-3">
          <div className="flex justify-between items-center">
            {/* Stats - Made more compact on mobile */}
            <div className="flex gap-2 sm:gap-3">
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-200/50 text-green-600">
                <ThumbsUp className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                <span className="text-xs sm:text-sm font-medium">
                  {dish.like_count}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-200/50 text-red-600">
                <ThumbsDown
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  strokeWidth={2.5}
                />
                <span className="text-xs sm:text-sm font-medium">
                  {dish.dislike_count}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-full bg-gray-200/50 text-red-500">
                <Heart
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  strokeWidth={2.5}
                  fill="currentColor"
                />
                <span className="text-xs sm:text-sm font-medium">
                  {dish.favorites_count}
                </span>
              </div>
            </div>

            {/* Action Buttons - Made more compact on mobile */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowEdit(true)}
                className="px-2 sm:px-3 py-1 sm:py-1.5 border border-gray-300 text-xs sm:text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-sm"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-2 sm:px-3 py-1 sm:py-1.5 border border-transparent text-xs sm:text-sm font-medium rounded-xl text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-all duration-300 shadow-sm"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DishForm
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        restaurantId={restaurant.id}
        dish={dish}
        onSuccess={onUpdate}
      />
    </>
  );
}
