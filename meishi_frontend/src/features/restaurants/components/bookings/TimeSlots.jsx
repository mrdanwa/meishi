import { useState, useEffect } from "react";
import ModalDark from "../shared/ModalDark";
import TimeSlotListSettings from "../booking_settings/TimeSlotListSettings";
import TimeSlotForm from "../booking_settings/TimeSlotForm";
import { Plus } from "lucide-react";

export default function TimeSlots({ isOpen, onClose, bookingSystemId }) {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
    }
  }, [isOpen]);

  const handleSuccess = () => {
    setShowForm(false);
  };

  const content = () => {
    if (showForm) {
      return (
        <TimeSlotForm
          bookingSystemId={bookingSystemId}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      );
    }

    return (
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
        <TimeSlotListSettings bookingSystemId={bookingSystemId} />
      </div>
    );
  };

  return (
    <ModalDark
      isOpen={isOpen}
      onClose={onClose}
      title={showForm ? "Add Time Slots" : "Time Slots"}
    >
      {content()}
    </ModalDark>
  );
}
