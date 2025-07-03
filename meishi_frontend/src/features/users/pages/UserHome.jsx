import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import api from "../../../config/api";
import { handleError } from "../../../utils/errorHandler";
import LocationDropdown from "../components/restaurants/LocationDropdown";
import RestaurantSearchBar from "../components/restaurants/RestaurantSearchBar";
import RestaurantFilters from "../components/restaurants/RestaurantFilters";
import RestaurantCard from "../components/restaurants/RestaurantCard";
import DishSearchBar from "../components/dishes/DishSearchBar";
import DishFilters from "../components/dishes/DishFilters";
import DishCard from "../components/dishes/DishCard";

export default function UserHome() {
  const [searchType, setSearchType] = useState("restaurants");
  const [restaurants, setRestaurants] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  const [dishesLoading, setDishesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [location, setLocation] = useState({
    country: "",
    state: "",
    city: "",
  });
  const [searchParams, setSearchParams] = useState({
    search: "",
    ordering: "-weekly_like_count",
  });

  useEffect(() => {
    if (searchType === "restaurants") {
      fetchRestaurants();
    } else {
      fetchDishes();
    }
  }, [searchParams, currentPage, searchType, location]);

  const fetchRestaurants = async (showLoading = true) => {
    if (showLoading) setRestaurantsLoading(true);
    try {
      const params = new URLSearchParams({
        ...searchParams,
        page: currentPage,
        ...(location.country && { country: location.country }),
        ...(location.state && { state: location.state }),
        ...(location.city && { city: location.city }),
      });
      const response = await api.get(`/api/restaurants/?${params}`);
      setRestaurants(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 18));
    } catch (error) {
      handleError(error);
    } finally {
      if (showLoading) setRestaurantsLoading(false);
    }
  };

  const fetchDishes = async (showLoading = true) => {
    if (showLoading) setDishesLoading(true);
    try {
      const params = new URLSearchParams({
        ...searchParams,
        page: currentPage,
        ...(location.country && { restaurant__country: location.country }),
        ...(location.state && { restaurant__state: location.state }),
        ...(location.city && { restaurant__city: location.city }),
      });
      const response = await api.get(`/api/dishes/?${params}`);
      setDishes(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 18));
    } catch (error) {
      handleError(error);
    } finally {
      if (showLoading) setDishesLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setCurrentPage(1);
    setSearchParams((prev) => ({ ...prev, search: searchTerm }));
  };

  const handleFilter = (filters) => {
    setCurrentPage(1);
    setSearchParams((prev) => ({ ...prev, ...filters }));
    setShowFilters(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
    setCurrentPage(1);
  };

  const handleSearchTypeChange = (type) => {
    if (type === searchType) return; // Do nothing if clicking the same type

    setSearchType(type);
    setCurrentPage(1);
    setSearchParams({
      search: "",
      ordering: "-weekly_like_count",
    });
    setShowFilters(false);
  };

  const handleInteraction = () => {
    if (searchType === "restaurants") {
      fetchRestaurants(false);
    } else {
      fetchDishes(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section */}
        <div className="space-y-6 sm:space-y-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="w-full lg:w-auto">
              <LocationDropdown
                onLocationChange={handleLocationChange}
                location={location}
              />
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-2xl shadow-sm border border-gray-200/50 self-center">
              <div className="flex space-x-1">
                {["restaurants", "dishes"].map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSearchTypeChange(type)}
                    className={`px-6 sm:px-8 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 relative
                      ${
                        searchType === type
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

          <div className="space-y-4">
            <div className="relative flex items-center">
              <div className="flex-grow">
                {searchType === "restaurants" ? (
                  <RestaurantSearchBar onSearch={handleSearch} />
                ) : (
                  <DishSearchBar onSearch={handleSearch} />
                )}
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-4 p-3.5 rounded-xl transition-all duration-300 flex items-center justify-center
                  ${
                    showFilters
                      ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm"
                  }`}
                aria-label="Toggle filters"
              >
                <Menu
                  className={`w-5 h-5 ${
                    showFilters ? "text-white" : "text-gray-600"
                  }`}
                />
              </button>
            </div>

            {showFilters && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 transition-all duration-300">
                {searchType === "restaurants" ? (
                  <RestaurantFilters onFilter={handleFilter} />
                ) : (
                  <DishFilters onFilter={handleFilter} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {searchType === "restaurants" ? (
            restaurantsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <RestaurantSkeleton key={i} />
                ))}
              </div>
            ) : restaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <RestaurantCard
                      restaurant={restaurant}
                      onInteraction={handleInteraction}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )
          ) : dishesLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <DishSkeleton key={i} />
              ))}
            </div>
          ) : dishes.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <DishCard dish={dish} onInteraction={handleInteraction} />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
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
    </div>
  );
}

const EmptyState = () => (
  <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
      <span className="text-2xl">🔍</span>
    </div>
    <h3 className="text-lg font-medium text-gray-900">No results found</h3>
    <p className="mt-2 text-gray-500">
      Try adjusting your search or filters to find what you're looking for.
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
