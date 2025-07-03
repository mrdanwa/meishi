import { useState, useEffect } from "react";
import ModalDark from "../shared/ModalDark";
import GeneralTimeSlotList from "./GeneralTimeSlotList";
import GeneralTimeSlotForm from "./GeneralTimeSlotForm";
import { Calendar, Plus } from "lucide-react";

export default function WeeklySchedule({ isOpen, onClose, bookingSystemId }) {
  const [showForm, setShowForm] = useState(false);
  const [editingTimeSlot, setEditingTimeSlot] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setShowForm(false);
    }
  }, [isOpen]);

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTimeSlot(null);
  };

  const handleEdit = (timeSlot) => {
    setEditingTimeSlot(timeSlot);
    setShowForm(true);
  };

  return (
    <ModalDark
      isOpen={isOpen}
      onClose={onClose}
      title={
        showForm
          ? editingTimeSlot
            ? "Edit Weekly Schedule"
            : "Add Weekly Schedule"
          : "Weekly Schedule"
      }
    >
      {showForm ? (
        <GeneralTimeSlotForm
          bookingSystemId={bookingSystemId}
          timeSlot={editingTimeSlot}
          onSuccess={handleSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingTimeSlot(null);
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white 
                       rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {editingTimeSlot ? (
                <Calendar className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>
          </div>
          <GeneralTimeSlotList
            bookingSystemId={bookingSystemId}
            onEdit={handleEdit}
          />
        </div>
      )}
    </ModalDark>
  );
}
