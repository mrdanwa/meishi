import { useState, useEffect } from "react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";

const WEEKDAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

export default function GeneralTimeSlotForm({
  bookingSystemId,
  timeSlot,
  onSuccess,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    booking_system: bookingSystemId,
    weekday: "",
    start_time: "",
    end_time: "",
    interval_minutes: 30,
    max_people: 20,
    max_tables: 5,
    min: 1,
    max: 8,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeSlot) {
      setFormData({
        booking_system: bookingSystemId,
        weekday: timeSlot.weekday,
        start_time: timeSlot.start_time,
        end_time: timeSlot.end_time,
        interval_minutes: timeSlot.interval_minutes,
        max_people: timeSlot.max_people,
        max_tables: timeSlot.max_tables,
        min: timeSlot.min,
        max: timeSlot.max,
      });
    }
  }, [timeSlot, bookingSystemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (timeSlot) {
        await api.patch(`/api/general-time-slots/${timeSlot.id}/`, formData);
      } else {
        await api.post("/api/general-time-slots/", formData);
      }
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "weekday" ? parseInt(value, 10) : value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Weekday
          </label>
          <select
            name="weekday"
            value={formData.weekday}
            onChange={handleChange}
            required
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 rounded-md px-3 py-2
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                      placeholder-gray-500 transition-colors"
          >
            <option value="">Select Weekday</option>
            {WEEKDAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

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
            ? timeSlot
              ? "Updating..."
              : "Creating..."
            : timeSlot
            ? "Update"
            : "Create"}
        </button>
      </div>
    </form>
  );
}
