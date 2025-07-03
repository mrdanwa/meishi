import { useState } from "react";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import BookingForm from "./BookingForm";

export default function BookingCard({
  booking,
  restaurantId,
  onStatusChange,
  onDelete,
  onUpdate,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    confirmed: "bg-blue-900 text-blue-200",
    arrived: "bg-green-900 text-green-200",
    dessert: "bg-purple-900 text-purple-200",
    bill: "bg-yellow-900 text-yellow-200",
    clean: "bg-gray-800 text-gray-200",
    noshow: "bg-red-900 text-red-200",
    canceled: "bg-gray-800 text-gray-400",
    gone: "bg-gray-800 text-gray-200",
  };

  const statusOptions = [
    { value: "confirmed", label: "Confirmed" },
    { value: "arrived", label: "Arrived" },
    { value: "dessert", label: "Dessert" },
    { value: "bill", label: "Bill" },
    { value: "clean", label: "Clean" },
    { value: "noshow", label: "No Show" },
    { value: "canceled", label: "Canceled" },
    { value: "gone", label: "Gone" },
  ];

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;
    setIsDeleting(true);
    try {
      await onDelete(booking.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-gray-900 rounded-lg shadow border border-gray-800">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-3 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
                <h3 className="text-sm font-medium text-white truncate">
                  {booking.first_name} {booking.last_name}
                </h3>
              </div>
              <div className="flex-shrink-0">
                <select
                  value={booking.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    onStatusChange(booking.id, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={`text-xs rounded ${
                    statusColors[booking.status]
                  } border-0 py-0.5 px-1.5 focus:ring-1 focus:ring-gray-600`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-3 pb-3 pt-0">
            <div className="pt-2 border-t border-gray-800">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 space-y-0.5">
                    <p>People: {booking.people}</p>
                    {booking.phone && <p>Phone: {booking.phone}</p>}
                    {booking.email && <p>Email: {booking.email}</p>}
                    {booking.booking_type && (
                      <p>Type: {booking.booking_type}</p>
                    )}
                    {booking.notes && (
                      <p className="truncate">Notes: {booking.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-white transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <BookingForm
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        bookingSystemId={booking.booking_system}
        booking={booking}
        restaurantId={restaurantId}
        onSuccess={onUpdate}
      />
    </>
  );
}
