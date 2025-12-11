import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function VendorProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
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
  });

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");
    if (!user || !token || user.role !== "admin") {
      alert("Silakan login sebagai vendor/admin");
      navigate("/login");
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/vendor-profile`, getAuthHeader());
      const data = res.data;
      setFormData({
        storeName: data.storeName || "",
        storeDescription: data.storeDescription || "",
        storePhone: data.storePhone || "",
        storeAddress: data.storeAddress || "",
        storeAddressDetail: {
          street: data.storeAddressDetail?.street || "",
          district: data.storeAddressDetail?.district || "",
          city: data.storeAddressDetail?.city || "",
          province: data.storeAddressDetail?.province || "",
          postalCode: data.storeAddressDetail?.postalCode || "",
        },
        location: data.location || { type: "Point", coordinates: [] },
      });
    } catch (error) {
      console.error("Error fetch profile:", error);
      alert("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateDetail = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      storeAddressDetail: {
        ...prev.storeAddressDetail,
        [field]: value,
      },
    }));
  };

  const updateLocation = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [
          index === 0 ? value : prev.location.coordinates?.[0] || 0,
          index === 1 ? value : prev.location.coordinates?.[1] || 0,
        ],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `${API_URL}/auth/vendor-profile`,
        formData,
        getAuthHeader()
      );
      alert("✅ Profil vendor diperbarui");
    } catch (error) {
      console.error("Error update profile:", error);
      alert("❌ Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Profil Vendor</h1>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Toko *
              </label>
              <input
                type="text"
                name="storeName"
                value={formData.storeName}
                onChange={handleInputChange}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Deskripsi Toko
              </label>
              <textarea
                name="storeDescription"
                value={formData.storeDescription}
                onChange={handleInputChange}
                rows="3"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  No. Telepon Toko
                </label>
                <input
                  type="text"
                  name="storePhone"
                  value={formData.storePhone}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat Ringkas
                </label>
                <input
                  type="text"
                  name="storeAddress"
                  value={formData.storeAddress}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Jl. Mawar No.1, Kota"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jalan
                </label>
                <input
                  type="text"
                  value={formData.storeAddressDetail.street}
                  onChange={(e) => updateDetail("street", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.storeAddressDetail.district}
                  onChange={(e) => updateDetail("district", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Kota</label>
                <input
                  type="text"
                  value={formData.storeAddressDetail.city}
                  onChange={(e) => updateDetail("city", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={formData.storeAddressDetail.province}
                  onChange={(e) => updateDetail("province", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={formData.storeAddressDetail.postalCode}
                  onChange={(e) => updateDetail("postalCode", e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Koordinat (lng, lat)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  step="any"
                  value={formData.location.coordinates?.[0] || ""}
                  onChange={(e) => updateLocation(0, parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Longitude"
                />
                <input
                  type="number"
                  step="any"
                  value={formData.location.coordinates?.[1] || ""}
                  onChange={(e) => updateLocation(1, parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Latitude"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ambil dari peta (Google Maps) dalam format desimal.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={fetchProfile}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Refresh
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;

