import { useState, useEffect } from "react";
import ModalDark from "../shared/ModalDark";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function BookingForm({
  isOpen,
  onClose,
  restaurantId,
  booking,
  onSuccess,
}) {
  const [phase, setPhase] = useState(PHASES.INITIAL);

  // Track whether time slots are still loading
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [availableSlots, setAvailableSlots] = useState([]);
  const [availableBookingTypes, setAvailableBookingTypes] = useState([]);
  const [selectedTimeSlotSystem, setSelectedTimeSlotSystem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBookingTypes, setLoadingBookingTypes] = useState(false);

  const [formData, setFormData] = useState({
    time_slot: booking?.time_slot || "",
    booking_type: booking?.booking_type || "",
    first_name: booking?.first_name || "",
    last_name: booking?.last_name || "",
    people: booking?.people || 2,
    phone: booking?.phone || "",
    email: booking?.email || "",
    notes: booking?.notes || "",
  });

  const [selectedDate, setSelectedDate] = useState(
    booking?.time_slot_details?.date || new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (!isOpen) {
      // Reset everything when modal closes
      setPhase(PHASES.INITIAL);
      setFormData(initialFormData);
      setSelectedDate(new Date().toISOString().split("T")[0]);
      setAvailableSlots([]);
      setAvailableBookingTypes([]);
      setSelectedTimeSlotSystem(null);
      setLoading(false);
      setLoadingBookingTypes(false);
      setLoadingSlots(false);
    } else if (booking) {
      // Populate fields if editing an existing booking
      setSelectedDate(booking.time_slot_details.date);
      setFormData({
        time_slot: booking.time_slot,
        booking_type: booking.booking_type,
        first_name: booking.first_name,
        last_name: booking.last_name,
        people: booking.people,
        phone: booking.phone,
        email: booking.email,
        notes: booking.notes,
      });
    }
  }, [isOpen, booking]);

  useEffect(() => {
    if (selectedDate && formData.people) {
      fetchAvailableSlots();

      // If the date changed, reset the chosen slot & booking type
      if (booking && selectedDate !== booking.time_slot_details?.date) {
        setFormData((prev) => ({
          ...prev,
          time_slot: "",
          booking_type: "",
        }));
      }
    }
  }, [selectedDate, formData.people]);

  // If user already had a time slot (booking in edit mode), fetch booking types automatically
  useEffect(() => {
    const checkExistingBookingTypes = async () => {
      if (
        phase === PHASES.TIME_SLOTS &&
        booking &&
        selectedDate === booking.time_slot_details?.date
      ) {
        setLoadingBookingTypes(true);
        const slot = availableSlots.find((s) => s.id === booking.time_slot);

        if (slot?.booking_system) {
          setSelectedTimeSlotSystem(slot.booking_system);
          await fetchBookingTypes(slot.booking_system);
        }
        setLoadingBookingTypes(false);
      }
    };

    checkExistingBookingTypes();
  }, [phase, booking, selectedDate, availableSlots]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const response = await api.get("/api/time-slots/", {
        params: {
          restaurant_id: restaurantId,
          date: selectedDate,
        },
      });
      const availableTimeSlots = response.data;
      setAvailableSlots(availableTimeSlots);

      // If editing and same date, preserve the original booking slot
      if (booking && selectedDate === booking.time_slot_details?.date) {
        setFormData((prev) => ({ ...prev, time_slot: booking.time_slot }));
      }
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

      // If editing and the current booking type doesn't exist, reset it
      if (booking) {
        const currentTypeExists = response.data.some(
          (type) => type.name === booking.booking_type
        );
        if (!currentTypeExists) {
          setFormData((prev) => ({ ...prev, booking_type: "" }));
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingBookingTypes(false);
    }
  };

  const handleTimeSlotSelect = async (slotId) => {
    setFormData((prev) => ({ ...prev, time_slot: slotId }));
    const selectedSlot = availableSlots.find((slot) => slot.id === slotId);

    // Reset any existing booking types
    setAvailableBookingTypes([]);

    if (selectedSlot?.booking_system) {
      setSelectedTimeSlotSystem(selectedSlot.booking_system);
      await fetchBookingTypes(selectedSlot.booking_system);
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

      // If no booking types are available, send empty booking_type
      if (!selectedTimeSlotSystem || availableBookingTypes.length === 0) {
        submissionData.booking_type = "";
      }

      if (booking) {
        await api.patch(`/api/bookings/${booking.id}/`, submissionData);
      } else {
        await api.post("/api/bookings/", submissionData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * NOTE: If `availableSlots.length === 0`, we now ALWAYS return false
   * in PHASES.TIME_SLOTS, so the user CANNOT proceed if no slots exist.
   */
  const canProceed = () => {
    switch (phase) {
      case PHASES.INITIAL:
        // Must have selected a date, people, and finished loading slots
        return selectedDate && formData.people && !loadingSlots;

      case PHASES.TIME_SLOTS:
        // 1) If no available time slots, do NOT allow proceeding
        if (availableSlots.length === 0) {
          return false; // <<--- KEY CHANGE
        }

        // 2) If editing an existing booking, check if the slot still exists
        if (
          booking &&
          selectedDate === booking.time_slot_details?.date &&
          availableSlots.some((slot) => slot.id === formData.time_slot)
        ) {
          return !loadingBookingTypes;
        }

        // 3) For new bookings, user must select a slot
        return formData.time_slot && !loadingBookingTypes;

      case PHASES.BOOKING_TYPE:
        // Must pick a booking type or none exist
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
        // If there's a booking system & types are available, next phase is BOOKING_TYPE
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
                    key={slot.id}
                    onClick={() => handleTimeSlotSelect(slot.id)}
                    className={`p-3 rounded-md text-center transition-colors ${
                      formData.time_slot === slot.id
                        ? "bg-blue-600 text-white"
                        : booking?.time_slot === slot.id &&
                          booking?.time_slot_details?.date === selectedDate
                        ? "bg-blue-900 text-blue-200"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                maxLength={15}
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
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-200">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                maxLength={50}
                rows={2}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-gray-200 focus:border-blue-500 focus:ring-blue-500"
                placeholder="Optional: Add any special requests or notes"
              />
            </div>
          </form>
        );
    }
  };

  return (
    <ModalDark
      isOpen={isOpen}
      onClose={onClose}
      title={booking ? "Edit Booking" : "Add New Booking"}
    >
      <div className="space-y-6">
        {renderPhase()}

        <div className="flex justify-between mt-6">
          {phase > PHASES.INITIAL && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-200 bg-gray-800 rounded-md hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
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
              {loading
                ? booking
                  ? "Updating..."
                  : "Creating..."
                : booking
                ? "Update"
                : "Create"}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center ml-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </ModalDark>
  );
}
