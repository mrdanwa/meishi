import { useState, useEffect } from "react";
import api from "../../../config/api";
import { handleError } from "../../../utils/errorHandler";
import RestaurantCard from "../components/restaurants/RestaurantCard";
import DishCard from "../components/dishes/DishCard";

export default function UserReactions() {
  const [reactions, setReactions] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [dishesLoading, setDishesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("restaurants");

  useEffect(() => {
    fetchReactions();
  }, [currentPage, activeTab]);

  const fetchReactions = async () => {
    try {
      const endpoint = activeTab === "restaurants" ? "restaurants" : "dishes";
      const response = await api.get(
        `/api/likes-dislikes/${endpoint}/?page=${currentPage}`
      );
      setReactions(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 18));
    } catch (error) {
      handleError(error);
    } finally {
      if (activeTab === "restaurants") {
        setRestaurantsLoading(false);
      } else {
        setDishesLoading(false);
      }
    }
  };

  const handleInteraction = () => {
    fetchReactions();
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    if (activeTab === "restaurants") {
      setRestaurantsLoading(true);
    } else {
      setDishesLoading(true);
    }
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) {
      return; // Do nothing if clicking the same tab
    }

    setActiveTab(tab);
    setCurrentPage(1);
    setReactions([]);
    if (tab === "restaurants") {
      setRestaurantsLoading(true);
      setDishesLoading(false);
    } else {
      setRestaurantsLoading(false);
      setDishesLoading(true);
    }
  };

  const RestaurantSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 bg-gray-200 animate-pulse">
        <div className="absolute top-2 right-2 flex gap-2">
          {[1, 2, 3].map((btn) => (
            <div
              key={btn}
              className="w-[72px] h-[40px] bg-white/50 rounded-full"
            />
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-5 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );

  const DishSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg">
      <div className="p-4">
        <div className="flex">
          <div className="flex-1">
            <div className="flex items-start space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start w-full">
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="flex-shrink-0">
                    <div className="h-5 bg-gray-200 rounded w-20" />
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex flex-wrap gap-1.5 -ml-0.5">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-5 bg-gray-200 rounded-full w-16"
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-3.5 h-3.5 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-2">
        <div className="flex justify-end gap-4">
          {[1, 2, 3].map((btn) => (
            <div
              key={btn}
              className="flex items-center gap-2 px-2.5 py-2 bg-gray-200 rounded-full w-16"
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="space-y-6 sm:space-y-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200/50 self-center">
              <div className="flex space-x-1">
                {["restaurants", "dishes"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTabChange(type)}
                    className={`px-6 sm:px-8 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 relative
                      ${
                        activeTab === type
                          ? "text-blue-700 shadow-sm bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                  >
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {activeTab === "restaurants" ? (
          restaurantsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <RestaurantSkeleton key={i} />
              ))}
            </div>
          ) : reactions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reactions.map(
                (reaction) =>
                  reaction?.restaurant_details && (
                    <div
                      key={reaction.id}
                      className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <RestaurantCard
                        restaurant={reaction.restaurant_details}
                        onInteraction={handleInteraction}
                      />
                    </div>
                  )
              )}
            </div>
          ) : (
            <EmptyState activeTab={activeTab} />
          )
        ) : dishesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <DishSkeleton key={i} />
            ))}
          </div>
        ) : reactions.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reactions.map(
              (reaction) =>
                reaction?.dish_details && (
                  <div
                    key={reaction.id}
                    className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <DishCard
                      dish={reaction.dish_details}
                      onInteraction={handleInteraction}
                    />
                  </div>
                )
            )}
          </div>
        ) : (
          <EmptyState activeTab={activeTab} />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-2">
            <PaginationButton
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              label="Previous"
            />

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
                      onClick={() => handlePageChange(page)}
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

            <PaginationButton
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              label="Next"
            />
          </div>
        )}
      </div>
    </div>
  );
}

const EmptyState = ({ activeTab }) => (
  <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
      <span className="text-2xl">👋</span>
    </div>
    <h3 className="text-lg font-medium text-gray-900">No reactions yet</h3>
    <p className="mt-2 text-gray-500">
      You haven't reacted to any{" "}
      {activeTab === "restaurants" ? "restaurants" : "dishes"} yet. Start
      exploring to share your opinions!
    </p>
  </div>
);

const PaginationButton = ({ onClick, disabled, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 border border-gray-300 rounded-xl disabled:opacity-50 
      disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300
      bg-white text-gray-700 shadow-sm"
  >
    {label}
  </button>
);
