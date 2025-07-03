import React, { useState, useRef, useEffect } from "react";

const LocationDropdown = ({ onLocationChange, location }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [localLocation, setLocalLocation] = useState({
    country: location?.country || "",
    state: location?.state || "",
    city: location?.city || "",
  });
  const [displayLocation, setDisplayLocation] = useState({
    country: location?.country || "",
    state: location?.state || "",
    city: location?.city || "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        // Reset local changes if dropdown is closed without applying
        setLocalLocation(displayLocation);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [displayLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newLocation = {
      ...localLocation,
      [name]: value,
    };

    // If clearing a higher-level field, clear the lower-level fields
    if (value === "") {
      if (name === "country") {
        newLocation.state = "";
        newLocation.city = "";
      } else if (name === "state") {
        newLocation.city = "";
      }
    }

    setLocalLocation(newLocation);
  };

  const handleApply = () => {
    // Only send non-empty values in the callback
    const filteredLocation = Object.entries(localLocation).reduce(
      (acc, [key, val]) => {
        if (val.trim() !== "") {
          acc[key] = val.trim();
        }
        return acc;
      },
      {}
    );

    setDisplayLocation(localLocation);
    onLocationChange(filteredLocation);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (displayLocation.city && displayLocation.city.trim() !== "") {
      return displayLocation.city;
    }
    if (displayLocation.state && displayLocation.state.trim() !== "") {
      return displayLocation.state;
    }
    if (displayLocation.country && displayLocation.country.trim() !== "") {
      return displayLocation.country;
    }
    return "All";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center space-x-2 min-w-[120px]"
      >
        <span>📍</span>
        <span className="truncate">{getDisplayText()}</span>
        <svg
          className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-2 w-72 bg-white rounded-lg shadow-lg">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={localLocation.country}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="Enter country"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                name="state"
                value={localLocation.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="Enter state"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                name="city"
                value={localLocation.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                placeholder="Enter city"
              />
            </div>
            <div className="pt-2">
              <button
                onClick={handleApply}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm font-medium transition-all duration-300 shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
