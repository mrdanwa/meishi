import { useState, useEffect } from "react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import { Pencil, Trash2 } from "lucide-react";

const WEEKDAYS = {
  0: "Monday",
  1: "Tuesday",
  2: "Wednesday",
  3: "Thursday",
  4: "Friday",
  5: "Saturday",
  6: "Sunday",
};

export default function GeneralTimeSlotList({ bookingSystemId, onEdit }) {
  const [generalTimeSlots, setGeneralTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGeneralTimeSlots();
  }, [bookingSystemId]);

  const fetchGeneralTimeSlots = async () => {
    try {
      const response = await api.get("/api/general-time-slots/");
      setGeneralTimeSlots(
        response.data.filter((slot) => slot.booking_system === bookingSystemId)
      );
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this general time slot?")
    ) {
      return;
    }

    try {
      await api.delete(`/api/general-time-slots/${id}/`);
      setGeneralTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
    } catch (error) {
      handleError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400 text-sm">
          Loading general time slots...
        </div>
      </div>
    );
  }

  if (generalTimeSlots.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-800">
        <div className="text-center">
          <p className="text-gray-400 text-sm">No general time slots found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {generalTimeSlots.map((slot) => (
        <div
          key={slot.id}
          className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">
                {WEEKDAYS[slot.weekday]}
              </h3>
              <p className="text-sm text-gray-400">
                {new Date(`2000-01-01T${slot.start_time}`).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit", hour12: false }
                )}{" "}
                -
                {new Date(`2000-01-01T${slot.end_time}`).toLocaleTimeString(
                  [],
                  { hour: "2-digit", minute: "2-digit", hour12: false }
                )}
              </p>
              <p className="text-sm text-gray-400">
                Interval: {slot.interval_minutes} minutes
              </p>
              <p className="text-sm text-gray-400">
                Tables: {slot.max_tables} | People:{slot.max_people} | Size:{" "}
                {slot.min}-{slot.max}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(slot)}
                className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Edit time slot"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(slot.id)}
                className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                aria-label="Delete time slot"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
