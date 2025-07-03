import { toast } from "react-toastify";

export const handleError = (error) => {
  // Custom toast styling
  const toastConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "custom-toast error-toast",
    progressClassName: "toast-progress",
    bodyClassName: "toast-body",
    style: {
      background: "#FEE2E2",
      color: "#991B1B",
      borderRadius: "8px",
      padding: "16px",
      fontWeight: "500",
      fontSize: "14px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: "1px solid #FCA5A5",
    },
    progressStyle: {
      background: "#991B1B",
    },
    icon: "🚫",
  };

  const formatErrorMessage = (message) => {
    if (Array.isArray(message)) {
      return message
        .map((msg) => msg.toString().replace(/['\[\]]/g, ""))
        .join(", ");
    }
    return message.toString().replace(/['\[\]]/g, "");
  };

  if (error.response?.data) {
    const errorData = error.response.data;

    // Handle direct array response
    if (Array.isArray(errorData)) {
      toast.error(formatErrorMessage(errorData), toastConfig);
      return;
    }

    // Handle object with potentially nested errors
    if (typeof errorData === "object") {
      // Check common error fields
      const errorFields = ["detail", "error", "message", "errors"];

      for (const field of errorFields) {
        if (errorData[field]) {
          toast.error(formatErrorMessage(errorData[field]), toastConfig);
          return;
        }
      }

      // Handle field-specific validation errors
      Object.entries(errorData).forEach(([field, messages]) => {
        if (field !== "status" && field !== "statusCode") {
          toast.error(formatErrorMessage(messages), toastConfig);
        }
      });
      return;
    }

    // Handle string response
    if (typeof errorData === "string") {
      toast.error(formatErrorMessage(errorData), toastConfig);
      return;
    }
  }

  // Handle other errors
  toast.error(
    formatErrorMessage(error.message || "An unexpected error occurred"),
    toastConfig
  );
};

// Global styles
const styles = `
  .Toastify__toast-container {
    min-width: 320px;
  }

  .custom-toast {
    font-family: system-ui, -apple-system, sans-serif;
  }

  .toast-progress {
    height: 4px !important;
    opacity: 0.7;
  }

  .toast-body {
    padding: 0;
    margin: 0;
    line-height: 1.5;
  }

  .Toastify__toast-icon {
    margin-right: 12px;
  }

  .Toastify__close-button {
    color: #991B1B;
    opacity: 0.7;
    transition: opacity 0.2s;
  }

  .Toastify__close-button:hover {
    opacity: 1;
  }
`;

// Create and append style element
const styleElement = document.createElement("style");
styleElement.textContent = styles;
document.head.appendChild(styleElement);
