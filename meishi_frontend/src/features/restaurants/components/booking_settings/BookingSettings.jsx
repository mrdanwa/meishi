import React, { useState } from "react";
import { Link } from "react-router-dom";
import BookingSystems from "./BookingSystems";

export default function BookingSettings({ restaurantId }) {
  const [showBookingSystems, setShowBookingSystems] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <button
          onClick={() => setShowBookingSystems(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
        >
          <div className="flex items-center space-x-3">
            <span className="text-white">Booking Systems</span>
          </div>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <Link
          to="/restaurant/dashboard"
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all"
        >
          <div className="flex items-center space-x-3">
            <span className="text-white">Back to Dashboard</span>
          </div>
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      <BookingSystems
        isOpen={showBookingSystems}
        onClose={() => setShowBookingSystems(false)}
        restaurantId={restaurantId}
      />
    </div>
  );
}
