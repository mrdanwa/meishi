import { useState, useEffect } from "react";
import api from "../../../../config/api";
import RestaurantCard from "./RestaurantCard";

export default function RestaurantList({ SkeletonComponent }) {
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants(currentPage);
  }, [currentPage]);

  const fetchRestaurants = async (page) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/restaurants/?page=${page}`);
      setRestaurants(res.data.results);
      setTotalPages(Math.ceil(res.data.count / res.data.results.length));
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (deletedId) => {
    setRestaurants(
      restaurants.filter((restaurant) => restaurant.id !== deletedId)
    );
    if (restaurants.length === 1 && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleUpdate = () => {
    fetchRestaurants(currentPage);
  };

  const handleInteraction = (type, restaurantId) => {
    if (type === "delete") {
      handleDelete(restaurantId);
    } else if (type === "update") {
      handleUpdate();
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900">
          No restaurants found
        </h3>
        <p className="mt-2 text-gray-500">
          Add your first restaurant to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <RestaurantCard
              restaurant={restaurant}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              onInteraction={handleInteraction}
            />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-12 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 
              disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300
              bg-white text-gray-700 shadow-sm"
          >
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
              )
              .map((page, index, array) => (
                <div key={page} className="flex items-center">
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="mx-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                </div>
              ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 
              disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300
              bg-white text-gray-700 shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
