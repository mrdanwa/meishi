import { Link, Outlet } from "react-router-dom";
import RestaurantDropdown from "./RestaurantDropdown";

function RestaurantHeader() {
  return (
    <>
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link to="/restaurant/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
          </Link>
          <RestaurantDropdown />
        </nav>
      </header>
      <Outlet />
    </>
  );
}

export default RestaurantHeader;
