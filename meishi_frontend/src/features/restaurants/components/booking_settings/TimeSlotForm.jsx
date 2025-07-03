import { useState } from "react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import { Clock } from "lucide-react";

export default function TimeSlotForm({ bookingSystemId, onSuccess, onCancel }) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    booking_system: bookingSystemId,
    date: "",
    time: "",
    start_time: "",
    end_time: "",
    interval_minutes: 30,
    max_people: 20,
    max_tables: 5,
    min: 1,
    max: 8,
    is_open: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isCustomMode
        ? "/api/time-slots/create/"
        : "/api/time-slots/";
      const submitData = isCustomMode
        ? {
            ...formData,
            start_time: formData.start_time,
            end_time: formData.end_time,
            interval_minutes: formData.interval_minutes,
          }
        : {
            ...formData,
            time: formData.time,
          };

      await api.post(endpoint, submitData);
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

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800"
    >
      <div className="mb-6">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setIsCustomMode(!isCustomMode)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-gray-300 
                     rounded-md text-sm font-medium hover:bg-gray-700 transition-colors
                     border border-gray-700"
          >
            <Clock className="w-4 h-4" />
            <span>
              Switch to {isCustomMode ? "Specific" : "Custom"} Time Mode
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]}
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 transition-colors"
          />
        </div>

        {isCustomMode ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Interval (minutes)
              </label>
              <input
                type="number"
                name="interval_minutes"
                value={formData.interval_minutes}
                onChange={handleChange}
                required
                min="1"
                className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder-gray-500 transition-colors"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       placeholder-gray-500 transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max People
          </label>
          <input
            type="number"
            name="max_people"
            value={formData.max_people}
            onChange={handleChange}
            required
            min="1"
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max Tables
          </label>
          <input
            type="number"
            name="max_tables"
            value={formData.max_tables}
            onChange={handleChange}
            required
            min="1"
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Min People per Booking
          </label>
          <input
            type="number"
            name="min"
            value={formData.min}
            onChange={handleChange}
            required
            min="1"
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Max People per Booking
          </label>
          <input
            type="number"
            name="max"
            value={formData.max}
            onChange={handleChange}
            required
            min="1"
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     placeholder-gray-500 transition-colors"
          />
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
          {loading
            ? "Creating..."
            : `Create Time Slot${isCustomMode ? "s" : ""}`}
        </button>
      </div>
    </form>
  );
}
