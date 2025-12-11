import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Navbar({ cartCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Beranda", path: "/", icon: "🏠" },
    { name: "Produk", path: "/#products", icon: "🛍️" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? "glass shadow-lg py-2"
          : "bg-gradient-to-r from-primary-900/90 to-primary-800/90 backdrop-blur-sm py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300 border border-white/20">
              <svg
                className="w-8 h-8 text-accent-400 group-hover:scale-110 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                />
              </svg>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-white font-display tracking-tight">
                Toko Gas <span className="text-accent-400">UMKM</span>
              </div>
              <div className="text-[10px] md:text-xs text-primary-100 font-medium tracking-wide">
                Solusi Gas Terpercaya
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium text-sm"
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/checkout"
              className="relative group px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300 font-medium text-sm flex items-center gap-2"
            >
              <span>🛒 Keranjang</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {user && user.role === "admin" && (
              <div className="flex items-center space-x-2 border-l border-white/20 pl-2">
                <Link
                  to="/admin"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition-all duration-300 font-medium text-sm shadow-lg shadow-primary-900/20"
                >
                  Dashboard
                </Link>
              </div>
            )}

            {!user && (
              <Link
                to="/register-vendor"
                className="px-4 py-2 text-accent-300 hover:text-accent-200 hover:bg-accent-500/10 rounded-lg transition-all duration-300 font-medium text-sm border border-accent-500/30"
              >
                Jadi Vendor
              </Link>
            )}

            <div className="h-8 w-px bg-white/20 mx-2"></div>

            {user ? (
              <div className="flex items-center gap-3 pl-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-sm border-2 border-white/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-white leading-none">
                      {user.name.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-white/70 uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-white/60 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                  title="Logout"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-white text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-300 font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl animate-fade-in">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <span>{link.icon}</span>
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}

              <Link
                to="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span>🛒</span>
                  <span className="font-medium">Keranjang</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <>
                  <div className="h-px bg-white/10 my-2"></div>
                  <div className="px-4 py-2 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-medium text-sm">
                        {user.name}
                      </div>
                      <div className="text-white/60 text-xs capitalize">
                        {user.role}
                      </div>
                    </div>
                  </div>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 text-white hover:bg-white/10 rounded-xl transition-all"
                    >
                      <span>⚡</span>
                      <span className="font-medium">Dashboard Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-3 text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-xl transition-all border border-red-500/20"
                  >
                    <span>🚪</span>
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="h-px bg-white/10 my-2"></div>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-3 bg-white text-primary-900 rounded-xl font-bold shadow-lg"
                  >
                    Masuk Sekarang
                  </Link>
                  <Link
                    to="/register-vendor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-3 mt-2 text-white/80 hover:text-white font-medium"
                  >
                    Daftar sebagai Vendor
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
