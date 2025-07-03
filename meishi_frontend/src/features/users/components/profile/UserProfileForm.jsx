import { useState } from "react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import { Camera, Trash2 } from "lucide-react";

const DEFAULT_PROFILE_IMAGE = "https://placehold.co/200x200?text=Profile";

export default function UserProfileForm({ profile, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    username: profile.username,
    email: profile.email,
    first_name: profile.first_name,
    last_name: profile.last_name,
    country_code: profile.country_code,
    phone_number: profile.phone_number,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        formPayload.append(key, formData[key]);
      }
    });

    if (shouldDeleteImage) {
      formPayload.append("profile_image", "");
    } else if (profileImage) {
      formPayload.append("profile_image", profileImage);
    }

    try {
      await api.patch(`/api/users/${profile.id}/update/`, formPayload);
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setShouldDeleteImage(false);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
    setShouldDeleteImage(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto"
    >
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
      </div>

      <div className="p-8 space-y-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative group">
            <img
              src={
                profileImage
                  ? URL.createObjectURL(profileImage)
                  : profile.profile_image || DEFAULT_PROFILE_IMAGE
              }
              alt="Profile preview"
              className="h-32 w-32 rounded-full object-cover ring-4 ring-gray-50"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_PROFILE_IMAGE;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <label className="inline-flex px-4 py-2 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Camera className="w-5 h-5 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Upload new photo
              </span>
            </label>

            {(profile.profile_image || profileImage) && !shouldDeleteImage && (
              <button
                type="button"
                onClick={handleDeleteImage}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove photo
              </button>
            )}
            <p className="text-xs text-gray-500">Recommended: Square image</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Username", name: "username", type: "text" },
            { label: "Email Address", name: "email", type: "email" },
            { label: "First Name", name: "first_name", type: "text" },
            { label: "Last Name", name: "last_name", type: "text" },
            { label: "Country Code", name: "country_code", type: "text" },
            { label: "Phone Number", name: "phone_number", type: "tel" },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="px-8 py-6 bg-gray-50 rounded-b-xl border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {loading ? "Saving Changes..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
