import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicHeader from "./components/shared/PublicHeader";
import UserHeader from "./components/shared/UserHeader";
import RestaurantHeader from "./components/shared/RestaurantHeader";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import UserLanding from "./features/users/pages/UserLanding";
import RestaurantOwnerLanding from "./features/restaurants/pages/RestaurantOwnerLanding";
import UserLoginForm from "./features/users/components/credentials/UserLoginForm";
import UserRegisterForm from "./features/users/components/credentials/UserRegisterForm";
import RestaurantLoginForm from "./features/restaurants/components/credentials/RestaurantLoginForm";
import RestaurantRegisterForm from "./features/restaurants/components/credentials/RestaurantRegisterForm";
import UserHome from "./features/users/pages/UserHome";
import UserSettings from "./features/users/pages/UserSettings";
import UserProfile from "./features/users/pages/UserProfile";
import UserFavorites from "./features/users/pages/UserFavorites";
import UserReactions from "./features/users/pages/UserReactions";
import RestaurantDashboard from "./features/restaurants/pages/RestaurantDashboard";
import UserRestaurantDetails from "./features/users/pages/RestaurantDetails";
import DishDetails from "./features/users/pages/DishDetails";
import RestaurantOwnerDetails from "./features/restaurants/pages/RestaurantDetails";
import RestaurantSettings from "./features/restaurants/pages/RestaurantSettings";
import RestaurantProfile from "./features/restaurants/pages/RestaurantProfile";
import RestaurantBookings from "./features/restaurants/pages/RestaurantBookings";
import UserPrivacyPolicy from "./features/users/pages/PrivacyPolicy";
import RestaurantPrivacyPolicy from "./features/restaurants/pages/PrivacyPolicy";

export default function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicHeader />}>
          <Route path="/" element={<UserLanding />} />
          <Route
            path="/restaurant-owners"
            element={<RestaurantOwnerLanding />}
          />
          <Route path="/user/login" element={<UserLoginForm />} />
          <Route path="/user/register" element={<UserRegisterForm />} />
          <Route path="/restaurant/login" element={<RestaurantLoginForm />} />
          <Route
            path="/restaurant/register"
            element={<RestaurantRegisterForm />}
          />
        </Route>

        {/* Protected User Routes */}
        <Route element={<UserHeader />}>
          <Route
            path="/user/home"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/settings"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <UserSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/profile"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/favorites"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <UserFavorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/reactions"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <UserReactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/privacy-policy"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <UserPrivacyPolicy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:id/view"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <UserRestaurantDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dish/:id"
            element={
              <ProtectedRoute userType="normal" redirectTo="/user/login">
                <DishDetails />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Restaurant Routes */}
        <Route element={<RestaurantHeader />}>
          <Route
            path="/restaurant/dashboard"
            element={
              <ProtectedRoute
                userType="restaurant"
                redirectTo="/restaurant/login"
              >
                <RestaurantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/settings"
            element={
              <ProtectedRoute
                userType="restaurant"
                redirectTo="/restaurant/login"
              >
                <RestaurantSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/profile"
            element={
              <ProtectedRoute
                userType="restaurant"
                redirectTo="/restaurant/login"
              >
                <RestaurantProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/privacy-policy"
            element={
              <ProtectedRoute
                userType="restaurant"
                redirectTo="/restaurant/login"
              >
                <RestaurantPrivacyPolicy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/restaurant/:id"
            element={
              <ProtectedRoute
                userType="restaurant"
                redirectTo="/restaurant/login"
              >
                <RestaurantOwnerDetails />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Restaurant Route without Header */}
        <Route
          path="/restaurant/bookings"
          element={
            <ProtectedRoute
              userType="restaurant"
              redirectTo="/restaurant/login"
            >
              <RestaurantBookings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
