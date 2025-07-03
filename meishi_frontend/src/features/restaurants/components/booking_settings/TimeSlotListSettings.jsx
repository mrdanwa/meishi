import { useState, useEffect, useRef } from "react";
import {
  Clock,
  Users,
  Table2,
  Settings,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LockOpen,
  Lock,
  Calendar as CalendarIcon,
} from "lucide-react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";
import TimeSlotSettingsForm from "./TimeSlotSettingsForm";

const DatePicker = ({ selectedDate, onChange, onClose }) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth());
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());

  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (month, year) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day) => {
    // Build the date in UTC so it won’t be shifted by local time zone
    const newDate = new Date(Date.UTC(currentYear, currentMonth, day));

    onChange(newDate);
    onClose();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-10 w-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        currentMonth === today.getMonth() &&
        currentYear === today.getFullYear();

      const isSelected =
        day === selectedDate.getDate() &&
        currentMonth === selectedDate.getMonth() &&
        currentYear === selectedDate.getFullYear();

      calendarDays.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`h-10 w-10 rounded-full flex items-center justify-center text-sm
            transition-all duration-200 ease-in-out
            ${isToday ? "border-2 border-blue-500" : ""}
            ${
              isSelected
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-gray-300 hover:bg-gray-800"
            }
          `}
        >
          {day}
        </button>
      );
    }

    return calendarDays;
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 w-72">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-white text-lg font-medium">
          {months[currentMonth]} {currentYear}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {days.map((day) => (
          <div
            key={day}
            className="h-10 w-10 flex items-center justify-center text-xs text-gray-500 font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
    </div>
  );
};

export default function TimeSlotListSettings({
  bookingSystemId,
  showDeleteButton = true,
}) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [dateLoading, setDateLoading] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  useEffect(() => {
    fetchTimeSlots();
  }, [selectedDate, bookingSystemId]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchTimeSlots = async () => {
    setDateLoading(true);
    try {
      const response = await api.get(
        `/api/time-slots/?date=${selectedDate.toISOString().split("T")[0]}`
      );
      setTimeSlots(
        response.data
          .filter((slot) => slot.booking_system === bookingSystemId)
          .sort((a, b) => a.time.localeCompare(b.time))
      );
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

  const handleDateChange = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  const getStatusColor = (current, max) => {
    const ratio = current / max;
    if (ratio >= 0.8) return "text-red-400";
    if (ratio >= 0.5) return "text-yellow-400";
    return "text-green-400";
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
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

  return (
    <div className="space-y-6 min-h-[600px]">
      {/* Date Navigation */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleDateChange(-1)}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="relative mx-4" ref={calendarRef}>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-sm font-medium">
                {formatDate(selectedDate)}
              </span>
            </button>

            {showCalendar && (
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 z-50">
                <DatePicker
                  selectedDate={selectedDate}
                  onChange={setSelectedDate}
                  onClose={() => setShowCalendar(false)}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => handleDateChange(1)}
            className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      {dateLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center text-gray-400">
            <Clock className="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading time slots...
          </div>
        </div>
      ) : timeSlots.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No time slots found for this date
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timeSlots.map((slot) => (
            <div
              key={slot.id}
              className={`bg-gray-900 rounded-lg shadow-lg p-4 border ${
                slot.is_open ? "border-gray-800" : "border-gray-700 opacity-75"
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
                        {slot.current_number_of_tables}/{slot.max_tables} tables
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
      )}
    </div>
  );
}
