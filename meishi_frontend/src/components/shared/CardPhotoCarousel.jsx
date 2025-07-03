import { useState, useRef, useEffect } from "react";

const DEFAULT_IMAGE = "https://placehold.co/600x400?text=No+Image+Available";

export default function PhotoCarousel({ photos = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const carouselRef = useRef(null);
  const touchStartX = useRef(null);

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

  // Get the current photo or use the default image
  const currentPhoto =
    photos.length > 0 ? photos[safeIndex].photo : DEFAULT_IMAGE;

  return (
    <div
      className="relative w-full h-48 group"
      ref={carouselRef}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Display Image */}
      <img
        src={currentPhoto}
        alt={`Photo ${safeIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = DEFAULT_IMAGE;
        }}
      />

      {/* Navigation Buttons (if more than one photo) */}
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
