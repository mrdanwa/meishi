import { useState, useEffect } from "react";
import { Plus, Clock } from "lucide-react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import BookingCard from "./BookingCard";
import BookingForm from "./BookingForm";
import TimeSlotList from "./TimeSlotList";
import ModalDark from "../shared/ModalDark";

export default function BookingList({ restaurantId, selectedDate }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemsLoading, setSystemsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedBookingSystem, setSelectedBookingSystem] = useState(null);
  const [bookingSystems, setBookingSystems] = useState([]);

  useEffect(() => {
    fetchBookingSystems();
  }, [restaurantId]);

  useEffect(() => {
    if (selectedBookingSystem && selectedDate) {
      fetchBookings();
    }
  }, [selectedDate, selectedBookingSystem]);

  const fetchBookingSystems = async () => {
    setSystemsLoading(true);
    try {
      const response = await api.get("/api/booking-systems/");
      const systems = response.data.filter(
        (system) => system.restaurant === parseInt(restaurantId)
      );
      setBookingSystems(systems);
      if (systems.length > 0) {
        setSelectedBookingSystem(systems[0].id);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setSystemsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/bookings/", {
        params: {
          date: selectedDate.toISOString().split("T")[0],
          booking_system: selectedBookingSystem,
        },
      });
      setBookings(response.data);
    } catch (error) {
      handleError(error);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingCreated = () => {
    fetchBookings();
    setShowForm(false);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await api.patch(`/api/bookings/${bookingId}/`, { status: newStatus });
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await api.delete(`/api/bookings/${bookingId}/`);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      handleError(error);
    }
  };

  const groupBookingsByTime = (bookings) => {
    // Separate active and cancelled bookings
    const activeBookings = bookings.filter(
      (booking) => booking.status !== "canceled"
    );
    const cancelledBookings = bookings.filter(
      (booking) => booking.status === "canceled"
    );

    // Sort active bookings by time
    const sortedActiveBookings = [...activeBookings].sort((a, b) =>
      a.time_slot_details.time.localeCompare(b.time_slot_details.time)
    );

    // Group active bookings by time
    const activeGroups = sortedActiveBookings.reduce((groups, booking) => {
      const time = booking.time_slot_details.time;
      if (!groups[time]) {
        groups[time] = [];
      }
      groups[time].push(booking);
      return groups;
    }, {});

    // Sort cancelled bookings by time
    const sortedCancelledBookings = [...cancelledBookings].sort((a, b) =>
      a.time_slot_details.time.localeCompare(b.time_slot_details.time)
    );

    return {
      active: activeGroups,
      cancelled: sortedCancelledBookings,
    };
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (systemsLoading) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        Loading booking systems...
      </div>
    );
  }

  if (!systemsLoading && bookingSystems.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        No booking systems available. Please create a booking system first.
      </div>
    );
  }

  const { active: activeBookings, cancelled: cancelledBookings } =
    groupBookingsByTime(bookings);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* Booking System Tabs */}
        <div className="flex-1 overflow-x-auto">
          <nav className="flex space-x-2">
            {bookingSystems.map((system) => (
              <button
                key={system.id}
                onClick={() => setSelectedBookingSystem(system.id)}
                className={`px-3 py-1.5 text-xs font-medium whitespace-nowrap rounded-md transition-colors
                  ${
                    selectedBookingSystem === system.id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
              >
                {system.meal_type}
              </button>
            ))}
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTimeSlots(true)}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
            aria-label="Time slots"
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="p-1.5 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
            aria-label="Add booking"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            Loading bookings...
          </div>
        ) : Object.keys(activeBookings).length > 0 ||
          cancelledBookings.length > 0 ? (
          <>
            {/* Active Bookings */}
            {Object.entries(activeBookings)
              .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
              .map(([time, timeBookings]) => (
                <div key={time} className="space-y-2">
                  <h2 className="text-sm font-medium text-gray-400 pl-2">
                    {formatTime(time)}
                  </h2>
                  <div className="space-y-2">
                    {timeBookings.map((booking) => (
                      <BookingCard
                        key={booking.id}
                        booking={booking}
                        restaurantId={restaurantId}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onUpdate={() => fetchBookings()}
                      />
                    ))}
                  </div>
                </div>
              ))}

            {/* Cancelled Bookings Section */}
            {cancelledBookings.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-medium text-gray-400 pl-2">
                  Cancelled Bookings
                </h2>
                <div className="space-y-2">
                  {cancelledBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      restaurantId={restaurantId}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      onUpdate={() => fetchBookings()}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            No bookings found for this date.
          </div>
        )}
      </div>

      <BookingForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        restaurantId={restaurantId}
        onSuccess={handleBookingCreated}
        bookingSystemId={selectedBookingSystem}
      />

      <ModalDark
        isOpen={showTimeSlots}
        onClose={() => setShowTimeSlots(false)}
        title="Time Slots"
      >
        <TimeSlotList
          bookingSystemId={selectedBookingSystem}
          selectedDate={selectedDate.toISOString().split("T")[0]}
          showDeleteButton={false}
        />
      </ModalDark>
    </div>
  );
}
