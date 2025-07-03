import { Link, useNavigate } from "react-router-dom";

function UserLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover the Best Dishes in Your City
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find top-rated restaurants, read dish reviews, and book your table
            instantly. Filter by cuisine, location, or specific dishes to find
            exactly what you're craving.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/user/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/user/register")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Register
            </button>
          </div>
          <div className="mt-8">
            <Link
              to="/restaurant-owners"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Are you a restaurant owner? Click here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLanding;
