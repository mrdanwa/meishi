import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { checkUserType } from "../../utils/auth";
import { ACCESS_TOKEN } from "../../config/constants";

export default function ProtectedRoute({ children, userType, redirectTo }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const verifyAccess = async () => {
      const token = localStorage.getItem(ACCESS_TOKEN);
      if (!token) {
        setIsAuthorized(false);
        return;
      }

      const hasAccess = await checkUserType(userType);
      setIsAuthorized(hasAccess);
    };

    verifyAccess();
  }, [userType]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to={redirectTo} />;
}
