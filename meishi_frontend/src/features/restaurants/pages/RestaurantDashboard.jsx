import { useState } from "react";
import RestaurantList from "../components/restaurant/RestaurantList";
import RestaurantForm from "../components/restaurant/RestaurantForm";

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

export default function RestaurantDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [key, setKey] = useState(0);

  const handleRestaurantCreated = () => {
    setKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="mb-8">
          <div className="flex flex-row items-center justify-between w-full">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex-shrink-0">
              Dashboard
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-sm ml-4"
            >
              Add Restaurant
            </button>
          </div>
        </div>

        <div className="mt-8">
          <RestaurantList key={key} SkeletonComponent={RestaurantSkeleton} />
        </div>

        <RestaurantForm
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleRestaurantCreated}
        />
      </div>
    </div>
  );
}
