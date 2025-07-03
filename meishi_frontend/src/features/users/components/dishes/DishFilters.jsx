// DishFilters.js
import { useState, useEffect, useRef } from "react";
import api from "../../../../config/api";

export default function DishFilters({ onFilter }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Initialize filters with stored values or defaults
  const [filters, setFilters] = useState(() => {
    const storedFilters = localStorage.getItem("dishFilters");
    return storedFilters
      ? JSON.parse(storedFilters)
      : {
          course: "",
          categories: [],
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
    fetchMetadata();
    // Add click outside listener
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("dishFilters", JSON.stringify(filters));
  }, [filters]);

  const fetchMetadata = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        api.get("/api/courses/"),
        api.get("/api/categories/"),
      ]);
      setCourses(coursesRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setFilters((prev) => {
      const updatedCategories = prev.categories.includes(categoryId)
        ? prev.categories.filter((id) => id !== categoryId)
        : [...prev.categories, categoryId];
      return {
        ...prev,
        categories: updatedCategories,
      };
    });
  };

  const handleClear = () => {
    const defaultFilters = {
      course: "",
      categories: [],
      ordering: "-weekly_like_count",
    };
    setFilters(defaultFilters);
    localStorage.removeItem("dishFilters");
    onFilter(new URLSearchParams());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new object for the filter
    const formattedFilters = new URLSearchParams();

    // Add course if selected
    if (filters.course) {
      formattedFilters.append("course", filters.course);
    }

    // Add each category as a separate parameter
    filters.categories.forEach((categoryId) => {
      formattedFilters.append("categories", categoryId);
    });

    // Add sorting parameter
    formattedFilters.append("ordering", filters.ordering);

    onFilter(formattedFilters);
  };

  const getSelectedCategoriesText = () => {
    if (filters.categories.length === 0) return "Select Categories";
    if (filters.categories.length === 1) {
      const category = categories.find((c) => c.id === filters.categories[0]);
      return category ? category.name : "1 Category";
    }
    return `${filters.categories.length} Categories Selected`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Course
        </label>
        <select
          name="course"
          value={filters.course}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700">
          Categories
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="mt-1 relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <span className="block truncate">{getSelectedCategoriesText()}</span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
            {categories.map((category) => (
              <div
                key={category.id}
                className="relative flex items-center px-3 py-2 cursor-pointer hover:bg-gray-50"
                onClick={() => handleCategoryChange(category.id)}
              >
                <input
                  type="checkbox"
                  checked={filters.categories.includes(category.id)}
                  onChange={() => {}}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        )}
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
