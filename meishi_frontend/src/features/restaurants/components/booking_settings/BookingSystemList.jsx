import { useState, useEffect } from "react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import BookingSystemCard from "./BookingSystemCard";

export default function BookingSystemList({ restaurantId }) {
  const [bookingSystems, setBookingSystems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingSystems();
  }, [restaurantId]);

  const fetchBookingSystems = async () => {
    try {
      const response = await api.get("/api/booking-systems/");
      setBookingSystems(
        response.data.filter((system) => system.restaurant === restaurantId)
      );
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/booking-systems/${id}/`);
      setBookingSystems((prev) => prev.filter((system) => system.id !== id));
    } catch (error) {
      handleError(error);
    }
  };

  const handleTogglePause = async (id, isPaused) => {
    try {
      await api.post(
        `/api/booking-systems/${id}/${isPaused ? "resume" : "pause"}/`
      );
      setBookingSystems((prev) =>
        prev.map((system) =>
          system.id === id ? { ...system, is_paused: !isPaused } : system
        )
      );
    } catch (error) {
      handleError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400 text-sm">Loading booking systems...</div>
      </div>
    );
  }

  if (bookingSystems.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-800">
        <div className="text-center">
          <p className="text-gray-400 text-sm">No booking systems found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6">
        {bookingSystems.map((system) => (
          <BookingSystemCard
            key={system.id}
            system={system}
            onDelete={handleDelete}
            onTogglePause={handleTogglePause}
          />
        ))}
      </div>
    </div>
  );
}
