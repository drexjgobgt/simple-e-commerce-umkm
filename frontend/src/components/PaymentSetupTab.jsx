import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function PaymentSetupTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    midtransClientKey: "",
    midtransServerKey: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/vendor-profile`,
        getAuthHeader()
      );
      setProfile(response.data);
      setFormData({
        midtransClientKey: response.data.midtransClientKey || "",
        midtransServerKey: response.data.midtransServerKey || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await axios.put(
        `${API_URL}/auth/vendor-profile/payment`,
        formData,
        getAuthHeader()
      );
      alert("✅ Kunci pembayaran berhasil disimpan!");
      fetchProfile();
    } catch (error) {
      console.error("Error saving payment keys:", error);
      alert(
        "❌ Gagal menyimpan kunci pembayaran: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        <span className="ml-2">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          💳 Setup Pembayaran Midtrans
        </h2>
        <p className="text-gray-600">
          Konfigurasi kunci API Midtrans untuk menerima pembayaran secara
          mandiri
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-800">Status Konfigurasi</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Client Key:</span>
            <span
              className={
                formData.midtransClientKey ? "text-green-600" : "text-red-600"
              }
            >
              {formData.midtransClientKey
                ? "✓ Dikonfigurasi"
                : "✗ Belum dikonfigurasi"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Server Key:</span>
            <span
              className={
                formData.midtransServerKey ? "text-green-600" : "text-red-600"
              }
            >
              {formData.midtransServerKey
                ? "✓ Dikonfigurasi"
                : "✗ Belum dikonfigurasi"}
            </span>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2 text-gray-800">
          📋 Cara Mendapatkan Kunci Midtrans
        </h3>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          <li>
            Buka{" "}
            <a
              href="https://dashboard.midtrans.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Midtrans Dashboard
            </a>
          </li>
          <li>Login ke akun Midtrans Anda</li>
          <li>Pergi ke menu "Settings" → "Access Keys"</li>
          <li>Salin "Client Key" dan "Server Key"</li>
          <li>Paste di form di bawah ini</li>
        </ol>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Midtrans Client Key
          </label>
          <input
            type="text"
            name="midtransClientKey"
            value={formData.midtransClientKey}
            onChange={handleInputChange}
            placeholder="SB-Mid-client-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Kunci ini digunakan di frontend untuk inisialisasi pembayaran
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Midtrans Server Key
          </label>
          <input
            type="password"
            name="midtransServerKey"
            value={formData.midtransServerKey}
            onChange={handleInputChange}
            placeholder="SB-Mid-server-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Kunci ini digunakan di backend untuk memproses pembayaran (jaga
            kerahasiaannya)
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? "Menyimpan..." : "💾 Simpan Kunci"}
          </button>
          <button
            type="button"
            onClick={fetchProfile}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </form>

      {/* Test Payment Button */}
      {formData.midtransClientKey && formData.midtransServerKey && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-800">
            🧪 Test Pembayaran
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            Klik tombol di bawah untuk test apakah konfigurasi pembayaran Anda
            sudah benar.
          </p>
          <button
            onClick={() => alert("Fitur test pembayaran akan segera hadir")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Test Pembayaran
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentSetupTab;
