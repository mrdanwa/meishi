import { useState, useEffect } from "react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import { Trash2 } from "lucide-react";

export default function BookingTypeList({ bookingSystemId }) {
  const [bookingTypes, setBookingTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingTypes();
  }, [bookingSystemId]);

  const fetchBookingTypes = async () => {
    try {
      const response = await api.get(
        `/api/booking-system/${bookingSystemId}/booking-types/`
      );
      setBookingTypes(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking type?")) {
      return;
    }

    try {
      await api.delete(`/api/booking-types/${id}/`);
      setBookingTypes((prev) => prev.filter((type) => type.id !== id));
    } catch (error) {
      handleError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400 text-sm">Loading booking types...</div>
      </div>
    );
  }

  if (bookingTypes.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 border border-gray-800">
        <div className="text-center">
          <p className="text-gray-400 text-sm">No booking types found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {bookingTypes.map((type) => (
        <div
          key={type.id}
          className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">{type.name}</h3>
            <button
              onClick={() => handleDelete(type.id)}
              className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
              aria-label="Delete booking type"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
