import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../config/api";
import { handleError } from "../../../utils/errorHandler";
import DeleteAccount from "../components/settings/DeleteAccount";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../../config/constants";

export default function RestaurantSettings() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    try {
      const response = await api.get("/api/user/");
      await api.delete(`/api/users/${response.data.id}/delete/`);
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      navigate("/restaurant-owners");
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Account Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Account</h2>
          </div>
          <div className="p-6">
            <div>
              <p className="mt-1 text-sm text-gray-500">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <div className="mt-4">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Privacy</h2>
          </div>
          <div className="p-6">
            <div>
              <p className="text-sm text-gray-500">
                Read our privacy policy to understand how we handle your data
                and protect your privacy.
              </p>
              <div className="mt-4">
                <Link
                  to="/restaurant/privacy-policy"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        <DeleteAccount
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
        />
      </div>
    </div>
  );
}
