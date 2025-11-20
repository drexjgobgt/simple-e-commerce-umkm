import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(`${API_URL}${endpoint}`, formData);

      if (isLogin) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        if (response.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        alert("Registrasi berhasil! Silakan login.");
        setIsLogin(true);
        setFormData({ email: "", password: "", name: "" });
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? "🔐 Masuk Akun" : "📝 Buat Akun Baru"}
          </h2>
          <p className="text-gray-600">
            {isLogin ? "Selamat datang kembali!" : "Bergabunglah dengan kami"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                👤 Nama Lengkap
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                placeholder="Masukkan nama lengkap"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">
              📧 Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">
              🔒 Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          >
            {isLogin ? "🚀 Masuk" : "✨ Daftar"}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ email: "", password: "", name: "" });
            }}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            {isLogin
              ? "Belum punya akun? 📝 Daftar"
              : "Sudah punya akun? 🔐 Masuk"}
          </button>
        </div>

        {isLogin && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-3 font-medium">
              🔑 Akun Demo Admin:
            </p>
            <div className="text-sm text-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border">
              <p className="font-medium">📧 Email: admin@tokogas.com</p>
              <p className="font-medium">🔒 Password: admin123</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
