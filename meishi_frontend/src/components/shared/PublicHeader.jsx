export default PublicHeader;
import { Link, Outlet } from "react-router-dom";

function PublicHeader() {
  return (
    <>
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
          </Link>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
