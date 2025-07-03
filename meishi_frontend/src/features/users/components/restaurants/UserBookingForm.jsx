import { useState, useEffect } from "react";
import ModalDark from "../../../restaurants/components/shared/ModalDark";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";

const PHASES = {
  INITIAL: 0,
  TIME_SLOTS: 1,
  BOOKING_TYPE: 2,
  PERSONAL_INFO: 3,
};

const initialFormData = {
  time_slot: "",
  booking_type: "",
  first_name: "",
  last_name: "",
  people: 2,
  phone: "",
  email: "",
  notes: "",
};

export default function UserBookingForm({
  isOpen,
  onClose,
  restaurantId,
  onSuccess,
}) {
  const [phase, setPhase] = useState(PHASES.INITIAL);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableBookingTypes, setAvailableBookingTypes] = useState([]);
  const [selectedTimeSlotSystem, setSelectedTimeSlotSystem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBookingTypes, setLoadingBookingTypes] = useState(false);

  const [formData, setFormData] = useState(initialFormData);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (!isOpen) {
      setPhase(PHASES.INITIAL);
      setFormData(initialFormData);
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setAvailableSlots([]);
      setAvailableBookingTypes([]);
      setSelectedTimeSlotSystem(null);
      setLoading(false);
      setLoadingBookingTypes(false);
      setLoadingSlots(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDate && formData.people) {
      fetchAvailableSlots();
    }
  }, [selectedDate, formData.people]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await api.get("/api/available-tables/", {
        params: {
          restaurant_id: restaurantId,
          date: selectedDate,
          people: formData.people,
        },
      });
      setAvailableSlots(response.data.available_times);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const fetchBookingTypes = async (bookingSystemId) => {
    setLoadingBookingTypes(true);
    try {
      const response = await api.get(
        `/api/booking-system/${bookingSystemId}/booking-types/`
      );
      setAvailableBookingTypes(response.data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingBookingTypes(false);
    }
  };

  const handleTimeSlotSelect = async (slotId) => {
    setFormData((prev) => ({ ...prev, time_slot: slotId }));
    const selectedSlot = availableSlots.find(
      (slot) => slot.time_slot_id === slotId
    );

    setAvailableBookingTypes([]);

    if (selectedSlot?.booking_system_id) {
      setSelectedTimeSlotSystem(selectedSlot.booking_system_id);
      await fetchBookingTypes(selectedSlot.booking_system_id);
    } else {
      setSelectedTimeSlotSystem(null);
    }
  };

  const handleBookingTypeSelect = (type) => {
    setFormData((prev) => ({ ...prev, booking_type: type }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.first_name.trim()) {
      handleError(new Error("First name is required"));
      return;
    }

    setLoading(true);

    try {
      const submissionData = { ...formData };

      if (!selectedTimeSlotSystem || availableBookingTypes.length === 0) {
        submissionData.booking_type = "";
      }

      await api.post("/api/user/bookings/create/", submissionData);
      onSuccess();
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (phase) {
      case PHASES.INITIAL:
        return selectedDate && formData.people && !loadingSlots;

      case PHASES.TIME_SLOTS:
        if (availableSlots.length === 0) {
          return false;
        }
        return formData.time_slot && !loadingBookingTypes;

      case PHASES.BOOKING_TYPE:
        return formData.booking_type || availableBookingTypes.length === 0;

      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      if (phase === PHASES.INITIAL) {
        setPhase(PHASES.TIME_SLOTS);
      } else if (phase === PHASES.TIME_SLOTS) {
        if (selectedTimeSlotSystem && availableBookingTypes.length > 0) {
          setPhase(PHASES.BOOKING_TYPE);
        } else {
          setPhase(PHASES.PERSONAL_INFO);
        }
      } else if (phase === PHASES.BOOKING_TYPE) {
        setPhase(PHASES.PERSONAL_INFO);
      }
    }
  };

  const handleBack = () => {
    if (phase === PHASES.PERSONAL_INFO) {
      if (selectedTimeSlotSystem && availableBookingTypes.length > 0) {
        setPhase(PHASES.BOOKING_TYPE);
      } else {
        setPhase(PHASES.TIME_SLOTS);
      }
    } else if (phase > PHASES.INITIAL) {
      setPhase(phase - 1);
    }
  };

  const renderPhase = () => {
    switch (phase) {
      case PHASES.INITIAL:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Number of People
                </label>
                <input
                  type="number"
                  value={formData.people}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      people: e.target.value,
                    }))
                  }
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case PHASES.TIME_SLOTS:
        return (
          <div className="space-y-6">
            {availableSlots.length === 0 ? (
              <div className="text-center text-gray-200">
                No time slots available for this date.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time_slot_id}
                    onClick={() => handleTimeSlotSelect(slot.time_slot_id)}
                    className={`p-3 rounded-md text-center transition-colors ${
                      formData.time_slot === slot.time_slot_id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    }`}
                  >
                    {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case PHASES.BOOKING_TYPE:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              {availableBookingTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleBookingTypeSelect(type.name)}
                  className={`p-3 rounded-md text-center transition-colors ${
                    formData.booking_type === type.name
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  {type.name}
                </button>
              ))}
            </div>
          </div>
        );

      case PHASES.PERSONAL_INFO:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
                  }
                  required
                  maxLength={20}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
                  }
                  maxLength={30}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-200">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </form>
        );
    }
  };

  return (
    <ModalDark isOpen={isOpen} onClose={onClose} title="Book a Table">
      <div className="space-y-6">
        {renderPhase()}

        <div className="flex justify-between mt-6">
          {phase > PHASES.INITIAL && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-md hover:bg-gray-700"
            >
              Back
            </button>
          )}

          {phase === PHASES.PERSONAL_INFO ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Booking"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </ModalDark>
  );
}
