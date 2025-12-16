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
    qrisImage: "",
    waPhoneNumberId: "",
    waApiKey: "",
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
        qrisImage: response.data.qrisImage || "",
        waPhoneNumberId: response.data.waPhoneNumberId || "",
        waApiKey: response.data.waApiKey || "",
      });
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error.response?.status || "Network error"
      );
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
        {
          midtransClientKey: formData.midtransClientKey,
          midtransServerKey: formData.midtransServerKey,
          qrisImage: formData.qrisImage,
        },
        getAuthHeader()
      );
      await axios.put(
        `${API_URL}/auth/vendor-profile/whatsapp`,
        {
          waPhoneNumberId: formData.waPhoneNumberId,
          waApiKey: formData.waApiKey,
        },
        getAuthHeader()
      );
      alert("✅ Kunci pembayaran berhasil disimpan!");
      fetchProfile();
    } catch (error) {
      console.error("Error saving payment keys");
      alert(
        "❌ Gagal menyimpan kunci pembayaran: " +
          (error.response?.data?.message || "Terjadi kesalahan")
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
          💳 Setup Pembayaran & WhatsApp (Vendor)
        </h2>
        <p className="text-gray-600">
          Konfigurasi kunci Midtrans dan WhatsApp Cloud API untuk toko Anda
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
            Kunci ini digunakan di frontend untuk inisialisasi pembayaran (Opsional jika pakai Midtrans)
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
          />
           <p className="text-xs text-gray-500 mt-1">
            Kunci ini digunakan di backend untuk memproses pembayaran (Opsional)
          </p>
        </div>

        <div className="border-t pt-4">
           <h3 className="font-semibold mb-2 text-gray-800">
            📱 QRIS (Pembayaran Manual)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
             Upload gambar QRIS toko Anda. Pelanggan akan melihat QRIS ini saat checkout dan melakukan transfer manual.
          </p>
          
          <div className="space-y-3">
              {formData.qrisImage && (
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img src={formData.qrisImage} alt="QRIS" className="w-32 h-32 object-contain bg-white rounded-md border" />
                      <div>
                          <p className="font-medium text-green-600 mb-1">✅ QRIS Tersimpan</p>
                          <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, qrisImage: "" }))}
                              className="text-sm text-red-500 hover:underline"
                          >
                              Hapus QRIS
                          </button>
                      </div>
                  </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    
                    const formDataUpload = new FormData();
                    formDataUpload.append("image", file);
                    
                    try {
                         const response = await axios.post(
                            `${API_URL}/upload/image`,
                            formDataUpload,
                            {
                            headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            }
                        );
                        setFormData(prev => ({ ...prev, qrisImage: response.data.url }));
                    } catch (error) {
                        alert("Gagal upload QRIS");
                    }
                }}
                className="w-full border rounded px-3 py-2"
              />
               <p className="text-xs text-gray-500">
                Format: JPG, PNG. Maksimal 5MB.
              </p>
          </div>
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
