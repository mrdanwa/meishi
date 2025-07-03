import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../shared/Modal";
import api from "../../../../config/api";

export default function PhotoManager({
  isOpen,
  onClose,
  restaurantId,
  photos,
  onPhotoChange,
}) {
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);
    setUploading(true);

    try {
      await api.post(`/api/restaurants/${restaurantId}/photos/`, formData);
      onPhotoChange();
      toast.success("Photo uploaded successfully");
    } catch (error) {
      if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error("Failed to upload photo");
      }
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoDelete = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    try {
      await api.delete(`/api/restaurants/${restaurantId}/photos/${photoId}/`);
      onPhotoChange();
      toast.success("Photo deleted successfully");
    } catch (error) {
      toast.error("Failed to delete photo");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Photos">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Restaurant Photos</h3>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading || photos.length >= 20}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white transition-all duration-300 ${
                photos.length >= 20
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {uploading ? "Uploading..." : "Add Photo"}
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group">
              <img
                src={photo.photo}
                alt="Restaurant"
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => handlePhotoDelete(photo.id)}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {photos.length >= 20 && (
          <p className="text-sm text-red-600">
            Maximum number of photos (20) reached. Delete some photos to add
            more.
          </p>
        )}
      </div>
    </Modal>
  );
}
