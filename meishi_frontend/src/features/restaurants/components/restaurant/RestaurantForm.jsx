import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";

const DEFAULT_LOGO = "https://placehold.co/200x200?text=Restaurant";

export default function RestaurantForm({
  isOpen,
  onClose,
  restaurant = null,
  onSuccess,
}) {
  const [cuisines, setCuisines] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postal: "",
    contact_number: "",
    contact_email: "",
    website_link: "",
    social_media_link: "",
    cuisine_id: "",
    currency: "",
  });
  const [logo, setLogo] = useState(null);
  const [shouldDeleteLogo, setShouldDeleteLogo] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCuisines();
      if (restaurant) {
        setFormData({
          name: restaurant.name || "",
          description: restaurant.description || "",
          street: restaurant.street || "",
          city: restaurant.city || "",
          state: restaurant.state || "",
          country: restaurant.country || "",
          postal: restaurant.postal || "",
          contact_number: restaurant.contact_number || "",
          contact_email: restaurant.contact_email || "",
          website_link: restaurant.website_link || "",
          social_media_link: restaurant.social_media_link || "",
          cuisine_id: restaurant.cuisine?.id || "",
          currency: restaurant.currency || "",
        });
        setLogo(null);
        setShouldDeleteLogo(false);
      } else {
        resetForm();
      }
    }
  }, [isOpen, restaurant]);

  const fetchCuisines = async () => {
    try {
      const res = await api.get("/api/cuisines/");
      setCuisines(res.data);
    } catch (error) {
      handleError(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      street: "",
      city: "",
      state: "",
      country: "",
      postal: "",
      contact_number: "",
      contact_email: "",
      website_link: "",
      social_media_link: "",
      cuisine_id: "",
      currency: "",
    });
    setLogo(null);
    setShouldDeleteLogo(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    if (e.target.files[0]) {
      setLogo(e.target.files[0]);
      setShouldDeleteLogo(false);
    }
  };

  const handleDeleteLogo = () => {
    setLogo(null);
    setShouldDeleteLogo(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formPayload = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== "") {
        formPayload.append(key, formData[key]);
      }
    });

    if (shouldDeleteLogo) {
      formPayload.append("logo", "");
    } else if (logo) {
      formPayload.append("logo", logo);
    }

    try {
      if (restaurant) {
        await api.patch(
          `/api/restaurants/${restaurant.id}/update/`,
          formPayload
        );
      } else {
        await api.post("/api/restaurants/create/", formPayload);
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {restaurant ? "Edit Restaurant" : "Add New Restaurant"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-8">
              {/* Logo Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900">
                  Logo
                </label>
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={
                        logo
                          ? URL.createObjectURL(logo)
                          : restaurant?.logo || DEFAULT_LOGO
                      }
                      alt="Logo preview"
                      className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_LOGO;
                      }}
                    />
                    {(restaurant?.logo || logo) && !shouldDeleteLogo && (
                      <button
                        type="button"
                        onClick={handleDeleteLogo}
                        className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 hover:bg-red-200"
                      >
                        <svg
                          className="w-4 h-4 text-red-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 
                               file:px-4 file:rounded-md file:border-0 file:text-sm 
                               file:font-semibold file:bg-indigo-50 file:text-indigo-700
                               hover:file:bg-indigo-100"
                    />
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-900">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    maxLength={200}
                    required
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Street
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal"
                    value={formData.postal}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Currency
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Website Link
                  </label>
                  <input
                    type="url"
                    name="website_link"
                    value={formData.website_link}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Social Media Link
                  </label>
                  <input
                    type="url"
                    name="social_media_link"
                    value={formData.social_media_link}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 placeholder-gray-500 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    Cuisine
                  </label>
                  <select
                    name="cuisine_id"
                    value={formData.cuisine_id}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 
                             px-3 py-2 text-gray-900 bg-white 
                             focus:border-indigo-500 focus:outline-none focus:ring-1 
                             focus:ring-indigo-500"
                  >
                    <option value="">Select Cuisine</option>
                    {cuisines.map((cuisine) => (
                      <option key={cuisine.id} value={cuisine.id}>
                        {cuisine.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                rounded-xl hover:bg-blue-700 disabled:opacity-50 
                focus:outline-none focus:ring-2 focus:ring-blue-500 
                focus:ring-offset-2 transition-all duration-300 shadow-sm"
              >
                {loading ? "Saving..." : restaurant ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
