import React, { useState, useRef, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";
import BookingList from "../components/bookings/BookingList";
import BookingSettings from "../components/booking_settings/BookingSettings";
import ModalDark from "../components/shared/ModalDark";

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
    // Build the date in UTC so it won't be shifted by local time zone
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

export default function RestaurantBookings() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef(null);

  const restaurantId = parseInt(
    new URLSearchParams(window.location.search).get("id")
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDateChange = (delta) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + delta);
    setSelectedDate(newDate);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4 shadow-xl border border-gray-800">
          <div className="flex justify-between items-center">
            {/* Date Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDateChange(-1)}
                className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative" ref={calendarRef}>
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
                  <div className="absolute top-full mt-2 left-0 z-50">
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
                aria-label="Next day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-gray-900 rounded-lg p-6 shadow-xl border border-gray-800">
          <BookingList
            restaurantId={restaurantId}
            selectedDate={selectedDate}
          />
        </div>

        {/* Modals */}
        <ModalDark
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title="Settings"
        >
          <BookingSettings restaurantId={restaurantId} />
        </ModalDark>
      </div>
    </div>
  );
}
