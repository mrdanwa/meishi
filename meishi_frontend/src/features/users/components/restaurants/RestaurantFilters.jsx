// RestaurantFilters.js
import { useState, useEffect } from "react";
import api from "../../../../config/api";

export default function RestaurantFilters({ onFilter }) {
  const [cuisines, setCuisines] = useState([]);

  // Initialize filters with stored values or defaults
  const [filters, setFilters] = useState(() => {
    const storedFilters = localStorage.getItem("restaurantFilters");
    return storedFilters
      ? JSON.parse(storedFilters)
      : {
          cuisine: "",
          ordering: "-weekly_like_count",
        };
  });

  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "-name", label: "Name (Z-A)" },
    { value: "-like_count", label: "Most Liked" },
    { value: "-dislike_count", label: "Most Disliked" },
    { value: "-favorites_count", label: "Most Favorited" },
    { value: "-weekly_like_count", label: "Trending" },
  ];

  useEffect(() => {
    fetchCuisines();
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("restaurantFilters", JSON.stringify(filters));
  }, [filters]);

  const fetchCuisines = async () => {
    try {
      const response = await api.get("/api/cuisines/");
      setCuisines(response.data);
    } catch (error) {
      console.error("Failed to fetch cuisines:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    const defaultFilters = {
      cuisine: "",
      ordering: "-weekly_like_count",
    };
    setFilters(defaultFilters);
    localStorage.removeItem("restaurantFilters");
    onFilter(new URLSearchParams());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedFilters = new URLSearchParams();

    if (filters.cuisine) {
      formattedFilters.append("cuisine", filters.cuisine);
    }
    formattedFilters.append("ordering", filters.ordering);

    onFilter(formattedFilters);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Cuisine
        </label>
        <select
          name="cuisine"
          value={filters.cuisine}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Cuisines</option>
          {cuisines.map((cuisine) => (
            <option key={cuisine.id} value={cuisine.id}>
              {cuisine.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Sort By
        </label>
        <select
          name="ordering"
          value={filters.ordering}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-sm"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 shadow-sm"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
