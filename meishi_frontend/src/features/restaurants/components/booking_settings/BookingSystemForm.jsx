import { useState } from "react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "brunch", label: "Brunch" },
  { value: "general", label: "General" },
];

export default function BookingSystemForm({
  restaurantId,
  onSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    meal_type: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/booking-systems/", {
        ...formData,
        restaurant: restaurantId,
      });
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Meal Type
          </label>
          <select
            value={formData.meal_type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, meal_type: e.target.value }))
            }
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      placeholder-gray-500 transition-colors"
          >
            <option value="" className="bg-gray-800">
              Select Meal Type
            </option>
            {MEAL_TYPES.map((type) => (
              <option
                key={type.value}
                value={type.value}
                className="bg-gray-800"
              >
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800
                    rounded-md hover:bg-gray-700 transition-colors border border-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600
                    rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
}
