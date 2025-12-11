import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function RegisterVendor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Account Info
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    // Store Info
    storeName: "",
    storeDescription: "",
    storePhone: "",
    storeAddress: "",
    storeAddressDetail: {
      street: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",
    },
    location: {
      type: "Point",
      coordinates: [],
    },
    // Payment Info
    bankName: "",
    accountNumber: "",
    accountName: "",
    // Secret Key
    secretKey: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi password
    if (formData.password !== formData.confirmPassword) {
      alert("Password tidak cocok!");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/register-vendor`, {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        storePhone: formData.storePhone,
        storeAddress: formData.storeAddress,
        storeAddressDetail: formData.storeAddressDetail,
        location: formData.location.coordinates.length === 2 ? formData.location : undefined,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        secretKey: formData.secretKey,
      });

      alert(
        `✅ ${response.data.message}\n\nSelamat datang, ${response.data.storeName}!`
      );
      navigate("/login");
    } catch (error) {
      alert("❌ " + (error.response?.data?.message || "Registrasi gagal"));
    }
  };

  const nextStep = () => {
    // Validasi per step
    if (step === 1) {
      if (!formData.email || !formData.password || !formData.name) {
        alert("Mohon lengkapi semua field!");
        return;
      }
      if (formData.password.length < 6) {
        alert("Password minimal 6 karakter!");
        return;
      }
    }
    if (step === 2) {
      if (!formData.storeName) {
        alert("Nama toko wajib diisi!");
        return;
      }
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Daftar Sebagai Vendor
          </h1>
          <p className="text-gray-600 text-lg">
            Bergabunglah dengan marketplace kami dan mulai berjualan!
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full font-bold transition-all ${
                    step >= num
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {num}
                </div>
                {num < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all ${
                      step > num
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span
              className={
                step >= 1 ? "text-blue-600 font-semibold" : "text-gray-500"
              }
            >
              Akun
            </span>
            <span
              className={
                step >= 2 ? "text-blue-600 font-semibold" : "text-gray-500"
              }
            >
              Toko
            </span>
            <span
              className={
                step >= 3 ? "text-blue-600 font-semibold" : "text-gray-500"
              }
            >
              Pembayaran
            </span>
            <span
              className={
                step >= 4 ? "text-blue-600 font-semibold" : "text-gray-500"
              }
            >
              Verifikasi
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Informasi Akun</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="vendor@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="6"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Konfirmasi Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ulangi password"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Store Info */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Informasi Toko</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Toko *
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Toko Gas Sejahtera"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Deskripsi Toko
                  </label>
                  <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Menjual gas LPG berkualitas sejak 2020..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    No. Telepon Toko
                  </label>
                  <input
                    type="tel"
                    name="storePhone"
                    value={formData.storePhone}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="081234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Alamat Toko
                  </label>
                  <textarea
                    name="storeAddress"
                    value={formData.storeAddress}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jl. Merdeka No. 123, Jakarta"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Jalan
                    </label>
                    <input
                      type="text"
                      value={formData.storeAddressDetail.street}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          storeAddressDetail: {
                            ...prev.storeAddressDetail,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      value={formData.storeAddressDetail.district}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          storeAddressDetail: {
                            ...prev.storeAddressDetail,
                            district: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={formData.storeAddressDetail.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          storeAddressDetail: {
                            ...prev.storeAddressDetail,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={formData.storeAddressDetail.province}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          storeAddressDetail: {
                            ...prev.storeAddressDetail,
                            province: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={formData.storeAddressDetail.postalCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          storeAddressDetail: {
                            ...prev.storeAddressDetail,
                            postalCode: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Koordinat (lng, lat)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      value={formData.location.coordinates?.[0] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: {
                            type: "Point",
                            coordinates: [
                              parseFloat(e.target.value) || 0,
                              prev.location.coordinates?.[1] || 0,
                            ],
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Longitude"
                    />
                    <input
                      type="number"
                      step="any"
                      value={formData.location.coordinates?.[1] || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          location: {
                            type: "Point",
                            coordinates: [
                              prev.location.coordinates?.[0] || 0,
                              parseFloat(e.target.value) || 0,
                            ],
                          },
                        }))
                      }
                      className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Latitude"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ambil dari peta (Google Maps) dalam format desimal.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Payment Info */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">
                  Informasi Pembayaran
                </h2>
                <p className="text-gray-600 mb-4">
                  Untuk menerima pembayaran dari penjualan Anda
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Bank
                  </label>
                  <select
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Bank</option>
                    <option value="BCA">BCA</option>
                    <option value="Mandiri">Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Permata">Permata</option>
                    <option value="BTN">BTN</option>
                    <option value="Bank Lainnya">Bank Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sesuai dengan nama di buku rekening"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Info:</strong> Data rekening digunakan untuk
                    transfer pembayaran dari penjualan Anda. Pastikan data yang
                    Anda masukkan benar.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Secret Key */}
            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Verifikasi Akses</h2>
                <p className="text-gray-600 mb-4">
                  Masukkan kunci rahasia yang Anda dapatkan dari admin platform
                </p>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Secret Key *
                  </label>
                  <input
                    type="password"
                    name="secretKey"
                    value={formData.secretKey}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan kunci rahasia"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Penting:</strong> Kunci ini diberikan hanya
                    kepada vendor terpercaya. Jika Anda belum memiliki kunci,
                    hubungi admin platform untuk mendapatkannya.
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mt-6">
                  <h3 className="font-bold mb-4">Ringkasan Pendaftaran</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Nama:</strong> {formData.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {formData.email}
                    </p>
                    <p>
                      <strong>Nama Toko:</strong> {formData.storeName}
                    </p>
                    <p>
                      <strong>No. Telepon:</strong> {formData.storePhone || "-"}
                    </p>
                    <p>
                      <strong>Bank:</strong> {formData.bankName || "-"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  ← Kembali
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg"
                >
                  Lanjut →
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg"
                >
                  🎉 Daftar Sekarang
                </button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Sudah punya akun vendor?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:underline font-semibold"
              >
                Login disini
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterVendor;
