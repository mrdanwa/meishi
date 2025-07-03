import { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Table2,
  Settings,
  Trash2,
  LockOpen,
  Lock,
} from "lucide-react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import TimeSlotSettingsForm from "../booking_settings/TimeSlotSettingsForm";

export default function TimeSlotList({
  bookingSystemId,
  selectedDate,
  showDeleteButton = true,
}) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate, bookingSystemId]);

  const fetchTimeSlots = async () => {
    setDateLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (bookingSystemId) params.append("booking_system", bookingSystemId);

      const response = await api.get(`/api/time-slots/?${params.toString()}`);
      setTimeSlots(response.data.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
      setDateLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this time slot?"))
      return;
    try {
      await api.delete(`/api/time-slots/${id}/`);
      setTimeSlots((prev) => prev.filter((slot) => slot.id !== id));
    } catch (error) {
      handleError(error);
    }
  };

  const handleToggleOpen = async (slot) => {
    try {
      await api.patch(`/api/time-slots/${slot.id}/`, {
        is_open: !slot.is_open,
      });
      setTimeSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, is_open: !s.is_open } : s))
      );
    } catch (error) {
      handleError(error);
    }
  };

  const handleMaxMinUpdate = async (slotId, updatedData) => {
    try {
      const response = await api.patch(
        `/api/time-slots/${slotId}/`,
        updatedData
      );
      setTimeSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, ...response.data } : slot
        )
      );
    } catch (error) {
      handleError(error);
    }
  };

  const getStatusColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 0.8) return "text-red-400";
    if (ratio >= 0.5) return "text-yellow-400";
    return "text-green-400";
  };

  const getTotals = () => {
    return timeSlots.reduce(
      (acc, slot) => ({
        currentPeople: acc.currentPeople + slot.current_booked_people,
        maxPeople: acc.maxPeople + slot.max_people,
        currentTables: acc.currentTables + slot.current_number_of_tables,
        maxTables: acc.maxTables + slot.max_tables,
      }),
      {
        currentPeople: 0,
        maxPeople: 0,
        currentTables: 0,
        maxTables: 0,
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Clock className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading time slots...
        </div>
      </div>
    );
  }

  const totals = getTotals();

  return (
    <div className="space-y-6 min-h-[600px]">
      {/* Totals Summary */}
      {timeSlots.length > 0 && (
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-400" />
              <div className="text-sm">
                <span className="text-gray-400">Total People: </span>
                <span
                  className={getStatusColor(
                    totals.currentPeople,
                    totals.maxPeople
                  )}
                >
                  {totals.currentPeople}/{totals.maxPeople}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Table2 className="w-5 h-5 text-gray-400" />
              <div className="text-sm">
                <span className="text-gray-400">Total Tables: </span>
                <span
                  className={getStatusColor(
                    totals.currentTables,
                    totals.maxTables
                  )}
                >
                  {totals.currentTables}/{totals.maxTables}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State when changing dates */}
      {dateLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-gray-400">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading time slots...
          </div>
        </div>
      ) : (
        <>
          {/* Time Slots Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className={`bg-gray-900 rounded-lg shadow-lg p-4 border ${
                  slot.is_open
                    ? "border-gray-800"
                    : "border-gray-700 opacity-75"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-medium text-white">
                        {new Date(`2000-01-01T${slot.time}`).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          }
                        )}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span
                          className={getStatusColor(
                            slot.current_booked_people,
                            slot.max_people
                          )}
                        >
                          {slot.current_booked_people}/{slot.max_people} people
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Table2 className="w-4 h-4 text-gray-400" />
                        <span
                          className={getStatusColor(
                            slot.current_number_of_tables,
                            slot.max_tables
                          )}
                        >
                          {slot.current_number_of_tables}/{slot.max_tables}{" "}
                          tables
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleToggleOpen(slot)}
                      className={`p-1.5 rounded-md transition-colors ${
                        slot.is_open
                          ? "text-green-400 hover:bg-gray-800"
                          : "text-red-400 hover:bg-gray-800"
                      }`}
                      aria-label={
                        slot.is_open ? "Lock time slot" : "Unlock time slot"
                      }
                    >
                      {slot.is_open ? (
                        <LockOpen className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() =>
                        setEditingSlot(editingSlot === slot.id ? null : slot.id)
                      }
                      className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {showDeleteButton && (
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {editingSlot === slot.id && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <TimeSlotSettingsForm
                      slot={slot}
                      onSuccess={(updatedData) => {
                        handleMaxMinUpdate(slot.id, updatedData);
                        setEditingSlot(null);
                      }}
                      onCancel={() => setEditingSlot(null)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {timeSlots.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No time slots found
            </div>
          )}
        </>
      )}
    </div>
  );
}
