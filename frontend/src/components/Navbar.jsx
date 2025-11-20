import { Link } from "react-router-dom";

function Navbar({ cartCount }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl">
      <div className="container mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-3xl font-bold hover:scale-105 transition-transform duration-200"
          >
            🔥 Toko Gas UMKM
          </Link>

          <div className="flex items-center space-x-8">
            <Link
              to="/"
              className="hover:text-blue-200 transition-colors duration-200 font-medium text-lg"
            >
              🏠 Beranda
            </Link>

            <Link
              to="/checkout"
              className="relative hover:text-blue-200 transition-colors duration-200 font-medium text-lg"
            >
              🛒 Keranjang
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {user && user.role === "admin" && (
              <Link
                to="/admin"
                className="hover:text-blue-200 transition-colors duration-200 font-medium text-lg"
              >
                ⚙️ Admin
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  👋 Halo, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all duration-200 font-medium hover:shadow-lg transform hover:scale-105"
                >
                  🚪 Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium hover:shadow-lg transform hover:scale-105"
              >
                🔐 Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
