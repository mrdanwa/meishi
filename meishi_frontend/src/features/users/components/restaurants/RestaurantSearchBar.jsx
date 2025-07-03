import { useState } from "react";

export default function RestaurantSearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search restaurants..."
          className="w-full px-6 py-3 pr-24 border border-gray-200 rounded-xl 
            shadow-sm bg-white/80 backdrop-blur-sm
            placeholder-gray-400 text-gray-900
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-blue-300"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 
            px-6 py-2 bg-blue-600 text-white rounded-lg
            transition-all duration-300
            hover:bg-blue-700 hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>
    </form>
  );
}
