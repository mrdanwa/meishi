import { useState, useEffect } from "react";
import ModalDark from "../shared/ModalDark";
import BookingSystemList from "./BookingSystemList";
import BookingSystemForm from "./BookingSystemForm";
import { Plus } from "lucide-react";

export default function BookingSystems({ isOpen, onClose, restaurantId }) {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
    }
  }, [isOpen]);

  const handleSuccess = () => {
    setShowForm(false);
  };

  return (
    <ModalDark
      isOpen={isOpen}
      onClose={onClose}
      title={showForm ? "Add Booking System" : "Booking Systems"}
    >
      {showForm ? (
        <BookingSystemForm
          restaurantId={restaurantId}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white
                       rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <BookingSystemList restaurantId={restaurantId} />
        </div>
      )}
    </ModalDark>
  );
}
