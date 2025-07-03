import { useState } from "react";
import {
  Save,
  X,
  Users,
  Table2,
  UserMinus,
  UserPlus,
  Plus,
  Minus,
} from "lucide-react";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";

const NumberInput = ({ label, icon: Icon, name, value, onChange, min = 1 }) => {
  const handleIncrement = () => {
    onChange({ target: { name, value: value + 1 } });
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange({ target: { name, value: value - 1 } });
    }
  };

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 w-full max-w-sm">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="text-xs text-gray-400 whitespace-nowrap">{label}</span>
      </div>
      <div /> {/* Spacer */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleDecrement}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-l border border-gray-700"
        >
          <Minus className="w-3 h-3" />
        </button>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          required
          min={min}
          className="w-12 bg-gray-900 border-y border-gray-700 px-1 py-1 text-sm text-white text-center focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={handleIncrement}
          className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-r border border-gray-700"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default function TimeSlotSettingsForm({ slot, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    max_people: slot.max_people || 0,
    max_tables: slot.max_tables || 0,
    min: slot.min || 0,
    max: slot.max || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.min > formData.max) {
      alert("Minimum people per booking cannot be greater than maximum");
      return;
    }

    if (formData.max > formData.max_people) {
      alert("Maximum people per booking cannot exceed total maximum people");
      return;
    }

    setLoading(true);
    try {
      await api.patch(`/api/time-slots/${slot.id}/`, formData);
      onSuccess();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 bg-gray-800/50 p-3 rounded-lg">
        <NumberInput
          label="Maximum People"
          icon={Users}
          name="max_people"
          value={formData.max_people}
          onChange={handleChange}
        />

        <NumberInput
          label="Maximum Tables"
          icon={Table2}
          name="max_tables"
          value={formData.max_tables}
          onChange={handleChange}
        />

        <NumberInput
          label="Min per Booking"
          icon={UserMinus}
          name="min"
          value={formData.min}
          onChange={handleChange}
        />

        <NumberInput
          label="Max per Booking"
          icon={UserPlus}
          name="max"
          value={formData.max}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-3 h-3 mr-1" />
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
