import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Heart,
  MessageSquare,
  Settings,
  LogOut,
  ThumbsUp,
} from "lucide-react";
import api from "../../config/api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../config/constants";

const DEFAULT_PROFILE_IMAGE = "https://placehold.co/200x200?text=Profile";

const menuItems = [
  { label: "Profile", icon: User, path: "/user/profile" },
  { label: "Favorites", icon: Heart, path: "/user/favorites" },
  { label: "Reactions", icon: ThumbsUp, path: "/user/reactions" },
  { label: "Settings", icon: Settings, path: "/user/settings" },
];

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchProfileImage();
  }, []);

  const fetchProfileImage = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/user/");
      setProfileImage(response.data.profile_image);
    } catch (error) {
      console.error("Failed to fetch profile image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    navigate("/");
  };

  const MenuItem = ({ icon: Icon, label, onClick, className = "" }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-sm transition-colors duration-150 hover:bg-gray-50 ${className}`}
    >
      <Icon className="w-4 h-4 mr-3" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white shadow-md">
          {isLoading ? (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          ) : (
            <img
              src={profileImage || DEFAULT_PROFILE_IMAGE}
              alt="Profile"
              className="w-full h-full object-cover transition-opacity duration-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
          )}
        </div>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 ease-out z-50">
          <div className="py-1">
            {menuItems.map((item) => (
              <MenuItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                onClick={() => navigate(item.path)}
              />
            ))}
            <div className="h-px bg-gray-200 my-1" />
            <MenuItem
              icon={LogOut}
              label="Log out"
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
