import { Link, useNavigate } from "react-router-dom";

function RestaurantOwnerLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Grow Your Restaurant Business
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join our platform to showcase your restaurant, manage bookings, and
            highlight your best dishes. Get valuable feedback from customers and
            increase your visibility in the community.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/restaurant/login")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/restaurant/register")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Register
            </button>
          </div>
          <div className="mt-8">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Back to main page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantOwnerLanding;
