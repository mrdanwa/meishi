import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../../config/api";
import { handleError } from "../../../../utils/errorHandler";

export default function UserRegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    password_confirm: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    country_code: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.password_confirm) {
      handleError(new Error("Passwords do not match"));
      return;
    }

    setLoading(true);
    try {
      // Remove password_confirm before sending to API
      const { password_confirm, ...submitData } = formData;
      await api.post("/api/user/register/", {
        ...submitData,
        user_type: "normal",
      });
      navigate("/user/login");
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "Choose a username",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a strong password",
    },
    {
      name: "password_confirm",
      label: "Confirm Password",
      type: "password",
      placeholder: "Enter your password again",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Enter your email address",
    },
    {
      name: "first_name",
      label: "First Name",
      type: "text",
      placeholder: "Enter your first name",
    },
    {
      name: "last_name",
      label: "Last Name",
      type: "text",
      placeholder: "Enter your last name",
    },
    {
      name: "phone_number",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter your phone number",
    },
    {
      name: "country_code",
      label: "Country Code",
      type: "text",
      placeholder: "e.g., +1, +44",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex flex-col justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <h2 className="mt-6 text-center text-4xl font-bold text-gray-900 tracking-tight">
          Join us today
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create your account to get started
        </p>
      </div>

      <div className="mt-8 w-full max-w-md mx-auto">
        <div className="bg-white/70 backdrop-blur-lg py-8 px-6 shadow-xl shadow-indigo-500/10 rounded-xl border border-white/20">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {formFields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700"
                >
                  {field.label}
                </label>
                <div className="mt-1">
                  <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    required
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>
              </div>
            ))}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
