import { useState } from "react";
import { Calendar, Clock, Tags, Pause, Play, Trash2 } from "lucide-react";
import WeeklySchedule from "./WeeklySchedule";
import TimeSlots from "../bookings/TimeSlots";
import BookingTypes from "./BookingTypes";

export default function BookingSystemCard({ system, onDelete, onTogglePause }) {
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showBookingTypes, setShowBookingTypes] = useState(false);

  const handleDelete = () => {
    if (
      window.confirm("Are you sure you want to delete this booking system?")
    ) {
      onDelete(system.id);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6 space-y-6 border border-gray-800">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-white capitalize">
            {system.meal_type}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-400 flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  system.is_paused ? "bg-yellow-500" : "bg-green-500"
                }`}
              />
              {system.is_paused ? "Paused" : "Active"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTogglePause(system.id, system.is_paused)}
            className="p-2 rounded-md transition-colors hover:bg-gray-800 text-gray-400 hover:text-white"
            aria-label={system.is_paused ? "Resume system" : "Pause system"}
          >
            {system.is_paused ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-md hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors"
            aria-label="Delete system"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowWeeklySchedule(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Schedule</span>
          </button>
          <button
            onClick={() => setShowTimeSlots(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Time Slots</span>
          </button>
          <button
            onClick={() => setShowBookingTypes(true)}
            className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            <Tags className="w-4 h-4" />
            <span>Booking Types</span>
          </button>
        </div>
      </div>

      <WeeklySchedule
        isOpen={showWeeklySchedule}
        onClose={() => setShowWeeklySchedule(false)}
        bookingSystemId={system.id}
      />

      <TimeSlots
        isOpen={showTimeSlots}
        onClose={() => setShowTimeSlots(false)}
        bookingSystemId={system.id}
      />

      <BookingTypes
        isOpen={showBookingTypes}
        onClose={() => setShowBookingTypes(false)}
        bookingSystemId={system.id}
      />
    </div>
  );
}
