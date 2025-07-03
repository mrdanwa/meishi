import { useState, useRef } from "react";

const DEFAULT_IMAGE = "https://placehold.co/600x400?text=No+Image+Available";

export default function PhotoCarousel({ photos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const touchStartX = useRef(null);

  // Return default state if no photos or if photos array is empty
  if (!photos || photos.length === 0) {
    return (
      <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
        <img
          src={DEFAULT_IMAGE}
          alt="No photos available"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? photos.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === photos.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Touch handling
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;

    const touchEndX = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Require a minimum swipe distance of 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
      touchStartX.current = null;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  // Ensure currentIndex is within bounds
  const safeIndex = Math.min(Math.max(currentIndex, 0), photos.length - 1);
  const currentPhoto = photos[safeIndex];

  // Handle invalid photo object
  if (!currentPhoto || !currentPhoto.photo) {
    return (
      <div className="relative w-full h-64 bg-gray-100 flex items-center justify-center">
        <img
          src={DEFAULT_IMAGE}
          alt="Error loading photo"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-64 group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={currentPhoto.photo}
        alt={`Restaurant photo ${safeIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DEFAULT_IMAGE;
        }}
      />

      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 
              text-white p-1 rounded-full hover:bg-opacity-75 transition-opacity duration-300
              ${showControls ? "opacity-100" : "opacity-0"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className={`absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 
              text-white p-1 rounded-full hover:bg-opacity-75 transition-opacity duration-300
              ${showControls ? "opacity-100" : "opacity-0"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Dot Navigation */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 
                  ${
                    index === safeIndex
                      ? "bg-white scale-110"
                      : "bg-white bg-opacity-50 hover:bg-opacity-75"
                  }`}
                aria-label={`Go to photo ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
