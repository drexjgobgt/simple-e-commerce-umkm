import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PaymentSetupTab from "../components/PaymentSetupTab";

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const POLL_MS = 20000;
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Gas 3kg",
    stock: "",
    image: "",
    unit: "unit",
    vendorAddress: "",
    vendorAddressDetail: {
      street: "",
      district: "",
      city: "",
      province: "",
      postalCode: "",
    },
    vendorLocation: {
      type: "Point",
      coordinates: [],
    },
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchProfile();
    fetchProducts();
    fetchOrders();
  }, []);

  // Polling ringan untuk orders saat tab aktif
  useEffect(() => {
    let intervalId;
    const token = localStorage.getItem("token");
    if (!token) return;

    const poll = () => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    };

    intervalId = setInterval(poll, POLL_MS);
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/auth/vendor-profile`,
        getAuthHeader()
      );
      setProfile(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, getAuthHeader());
      setOrders(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        await axios.put(
          `${API_URL}/products/${editingProduct._id}`,
          formData,
          getAuthHeader()
        );
        alert("Produk berhasil diupdate!");
      } else {
        await axios.post(`${API_URL}/products`, formData, getAuthHeader());
        alert("Produk berhasil ditambahkan!");
      }

      resetForm();
      fetchProducts();
      fetchProfile();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setImagePreview(product.image);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image,
      unit: product.unit,
      vendorAddress: product.vendorAddress || "",
      vendorAddressDetail: product.vendorAddressDetail || {
        street: "",
        district: "",
        city: "",
        province: "",
        postalCode: "",
      },
      vendorLocation: product.vendorLocation || {
        type: "Point",
        coordinates: [],
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await axios.delete(`${API_URL}/products/${id}`, getAuthHeader());
      alert("Produk berhasil dihapus!");
      fetchProducts();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Gas 3kg",
      stock: "",
      image: "",
      unit: "unit",
    });
    setEditingProduct(null);
    setImagePreview(null);
    setShowForm(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar!");
      return;
    }

    // Validasi ukuran (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB!");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload ke backend
    setUploading(true);
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

      setFormData((prev) => ({ ...prev, image: response.data.url }));
      alert("✅ Gambar berhasil diupload!");
    } catch (error) {
      alert(
        "❌ Gagal upload gambar: " +
          (error.response?.data?.message || error.message)
      );
      setImagePreview(null);
    } finally {
      setUploading(false);
    }
  };

  const updateOrderStatus = async (
    orderId,
    orderStatus,
    paymentStatus,
    note
  ) => {
    try {
      await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { orderStatus, paymentStatus, note },
        getAuthHeader()
      );
      alert("Status berhasil diupdate!");
      fetchOrders();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const handleContactCustomer = (order) => {
    if (!order.phone) {
      alert("Nomor telepon pembeli tidak tersedia.");
      return;
    }

    // Sanitize phone number: 08xx -> 628xx
    let phone = order.phone.replace(/\D/g, "");
    if (phone.startsWith("0")) {
      phone = "62" + phone.slice(1);
    }

    const message = `Halo Kak ${order.customerName}, terima kasih sudah memesan di Toko Gas!
    
Berikut rincian pesanan Kakak:
📄 Order ID: ${order._id}
📅 Tanggal: ${new Date(order.createdAt).toLocaleDateString("id-ID")}
📦 Status Pesanan: ${order.orderStatus.toUpperCase()}
💰 Total Tagihan: Rp ${order.totalAmount.toLocaleString("id-ID")}
💳 Status Pembayaran: ${order.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}

Item Pesanan:
${order.items.map(item => `- ${item.name} (${item.quantity}x)`).join("\n")}

Alamat Pengiriman:
${order.address.street}, ${order.address.city}

Pesanan akan segera kami proses. Mohon ditunggu ya! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden pb-12">
       {/* Background Decoration */}
       <div className="absolute top-0 right-0 w-1/3 h-64 bg-gradient-to-bl from-blue-100/50 to-transparent -z-10 rounded-bl-full"></div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
                 <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                    Admin Dashboard
                 </h1>
                 <p className="text-gray-600 mt-1">
                    Kelola produk, pesanan, dan pembayaran
                 </p>
            </div>
            
            {/* Quick Stats or Actions could go here */}
        </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/40 w-fit mx-auto md:mx-0 shadow-sm">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeTab === "products"
              ? "bg-white text-blue-600 shadow-md transform scale-105"
              : "text-gray-600 hover:bg-white/50 hover:text-blue-600"
          }`}
        >
          📦 Produk
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeTab === "orders"
              ? "bg-white text-blue-600 shadow-md transform scale-105"
              : "text-gray-600 hover:bg-white/50 hover:text-blue-600"
          }`}
        >
          📄 Pesanan
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeTab === "payment"
              ? "bg-white text-blue-600 shadow-md transform scale-105"
              : "text-gray-600 hover:bg-white/50 hover:text-blue-600"
          }`}
        >
          💳 Setup Pembayaran
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-white text-blue-600 shadow-md transform scale-105"
              : "text-gray-600 hover:bg-white/50 hover:text-blue-600"
          }`}
        >
          🏪 Profil Toko
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div className="mb-6">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              {showForm ? "Batal" : "+ Tambah Produk"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nama Produk
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                {/* Vendor Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Alamat Toko (ringkas)
                    </label>
                    <input
                      type="text"
                      name="vendorAddress"
                      value={formData.vendorAddress}
                      onChange={handleInputChange}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Jl. Mawar No. 1, Kota"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ringkas untuk ditampilkan cepat
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Lokasi (lng, lat)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="any"
                        value={formData.vendorLocation.coordinates?.[0] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendorLocation: {
                              type: "Point",
                              coordinates: [
                                parseFloat(e.target.value) || 0,
                                prev.vendorLocation.coordinates?.[1] || 0,
                              ],
                            },
                          }))
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="Longitude"
                      />
                      <input
                        type="number"
                        step="any"
                        value={formData.vendorLocation.coordinates?.[1] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            vendorLocation: {
                              type: "Point",
                              coordinates: [
                                prev.vendorLocation.coordinates?.[0] || 0,
                                parseFloat(e.target.value) || 0,
                              ],
                            },
                          }))
                        }
                        className="w-full border rounded px-3 py-2"
                        placeholder="Latitude"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Gunakan koordinat peta (format desimal)
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Jalan
                    </label>
                    <input
                      type="text"
                      value={formData.vendorAddressDetail.street}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendorAddressDetail: {
                            ...prev.vendorAddressDetail,
                            street: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      value={formData.vendorAddressDetail.district}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendorAddressDetail: {
                            ...prev.vendorAddressDetail,
                            district: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kota
                    </label>
                    <input
                      type="text"
                      value={formData.vendorAddressDetail.city}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendorAddressDetail: {
                            ...prev.vendorAddressDetail,
                            city: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Provinsi
                    </label>
                    <input
                      type="text"
                      value={formData.vendorAddressDetail.province}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendorAddressDetail: {
                            ...prev.vendorAddressDetail,
                            province: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Kode Pos
                    </label>
                    <input
                      type="text"
                      value={formData.vendorAddressDetail.postalCode}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          vendorAddressDetail: {
                            ...prev.vendorAddressDetail,
                            postalCode: e.target.value,
                          },
                        }))
                      }
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Harga
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stok
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kategori
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="Gas 3kg">Gas 3kg</option>
                    <option value="Gas 5kg">Gas 5kg</option>
                    <option value="Gas 12kg">Gas 12kg</option>
                    <option value="Kompor">Kompor</option>
                    <option value="Selang">Selang</option>
                    <option value="Regulator">Regulator</option>
                  </select>
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gambar Produk
                  </label>
                  <div className="space-y-3">
                    {/* File Upload */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full border rounded px-3 py-2"
                        disabled={uploading}
                      />
                      {uploading && (
                        <p className="text-sm text-blue-600 mt-1">
                          ⬆️ Mengupload gambar...
                        </p>
                      )}
                    </div>

                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="flex items-center space-x-3">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded border"
                        />
                        <div>
                          <p className="text-sm text-green-600">
                            {formData.image
                              ? "✅ Gambar berhasil diupload"
                              : "⏳ Gambar siap diupload"}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData((prev) => ({ ...prev, image: "" }));
                            }}
                            className="text-xs text-red-600 hover:text-red-800"
                          >
                            Hapus gambar
                          </button>
                        </div>
                      </div>
                    )}
                    {/* URL Input (Alternative) */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Atau masukkan URL gambar langsung:
                      </label>
                      <input
                        type="text"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full border rounded px-3 py-2 text-sm"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {editingProduct ? "Update" : "Simpan"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img 
                        src={product.image || 'https://via.placeholder.com/300?text=No+Image'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm">
                        {product.category}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                        📦 {product.stock}
                    </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-2 leading-tight">
                        {product.name}
                    </h3>
                    <p className="text-2xl font-bold text-primary-600 mb-4">
                        Rp {product.price.toLocaleString("id-ID")}
                    </p>
                    
                    <div className="mt-auto flex gap-3 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => handleEdit(product)}
                            className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => handleDelete(product._id)}
                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                            🗑️ Hapus
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
          {products.length === 0 && (
             <div className="text-center py-20 text-gray-500">
                 <div className="text-5xl mb-4">📦</div>
                 <p>Belum ada produk. Tambahkan sekarang!</p>
             </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {order.customerName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {order.email} • {order.phone}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {order.address.street}, {order.address.city},{" "}
                    {order.address.province}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    Rp {order.totalAmount.toLocaleString("id-ID")}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("id-ID")}
                  </div>
                  <button
                    onClick={() => handleContactCustomer(order)}
                    className="mt-2 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium hover:bg-green-200 flex items-center gap-1 ml-auto"
                  >
                    <span>📱</span> Hubungi Pembeli
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">Items:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm text-gray-600">
                    {item.name} x {item.quantity} = Rp{" "}
                    {(item.price * item.quantity).toLocaleString("id-ID")}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status Pesanan
                  </label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) =>
                      updateOrderStatus(
                        order._id,
                        e.target.value,
                        order.paymentStatus,
                        order.note
                      )
                    }
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) =>
                      updateOrderStatus(
                        order._id,
                        order.orderStatus,
                        e.target.value,
                        order.note
                      )
                    }
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium mb-1">
                    Catatan (opsional)
                  </label>
                  <input
                    type="text"
                    value={order.note || ""}
                    onChange={(e) => {
                      const note = e.target.value;
                      setOrders((prev) =>
                        prev.map((o) =>
                          o._id === order._id ? { ...o, note } : o
                        )
                      );
                    }}
                    className="w-full border rounded px-3 py-1 text-sm"
                    placeholder="Catatan perubahan"
                  />
                </div>
              </div>

              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-3 text-xs text-gray-600">
                  <div className="font-semibold mb-1">Riwayat Status:</div>
                  <div className="space-y-1 max-h-32 overflow-auto">
                    {order.statusHistory
                      .slice()
                      .reverse()
                      .map((h, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-gray-800">
                            {new Date(h.createdAt).toLocaleString("id-ID")}
                          </span>
                          <span>
                            • {h.orderStatus}/{h.paymentStatus}
                          </span>
                          {h.note && <span>— {h.note}</span>}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-2 text-sm text-gray-600">
                Metode Pembayaran: {order.paymentMethod}
                {order.notes && (
                  <div className="mt-1">Catatan: {order.notes}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Setup Tab */}
      {activeTab === "payment" && <PaymentSetupTab />}

      {/* Profile Tab */}
      {activeTab === "profile" && profile && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            🏪 Edit Profil Toko
          </h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.put(
                  `${API_URL}/auth/vendor-profile`,
                  profile,
                  getAuthHeader()
                );
                alert("✅ Profil berhasil diupdate!");
                fetchProfile();
              } catch (error) {
                alert("❌ Gagal update profil");
              }
            }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Toko</label>
                <input
                  type="text"
                  value={profile.storeName || ""}
                  onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                <input
                  type="text"
                  value={profile.storePhone || ""}
                  onChange={(e) => setProfile({ ...profile, storePhone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Singkat</label>
              <textarea
                value={profile.storeDescription || ""}
                onChange={(e) => setProfile({ ...profile, storeDescription: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap</label>
              <textarea
                value={profile.storeAddress || ""}
                onChange={(e) => setProfile({ ...profile, storeAddress: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                rows="2"
                placeholder="Alamat lengkap untuk ditampilkan di detail produk"
              />
            </div>

             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2">📍 Detail Lokasi (Untuk Filter Pencarian)</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Jalan</label>
                    <input
                      type="text"
                      value={profile.storeAddressDetail?.street || ""}
                      onChange={(e) => setProfile({ ...profile, storeAddressDetail: { ...profile.storeAddressDetail, street: e.target.value } })}
                      className="w-full px-3 py-2 rounded border border-blue-200 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Kecamatan</label>
                    <input
                      type="text"
                      value={profile.storeAddressDetail?.district || ""}
                      onChange={(e) => setProfile({ ...profile, storeAddressDetail: { ...profile.storeAddressDetail, district: e.target.value } })}
                      className="w-full px-3 py-2 rounded border border-blue-200 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Kota</label>
                    <input
                      type="text"
                      value={profile.storeAddressDetail?.city || ""}
                      onChange={(e) => setProfile({ ...profile, storeAddressDetail: { ...profile.storeAddressDetail, city: e.target.value } })}
                      className="w-full px-3 py-2 rounded border border-blue-200 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                  </div>
                   <div>
                    <label className="block text-xs font-semibold text-blue-700 mb-1">Provinsi</label>
                    <input
                      type="text"
                      value={profile.storeAddressDetail?.province || ""}
                      onChange={(e) => setProfile({ ...profile, storeAddressDetail: { ...profile.storeAddressDetail, province: e.target.value } })}
                      className="w-full px-3 py-2 rounded border border-blue-200 text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                    />
                  </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                💾 Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}
      </div>
    </div>
  );
}

export default Admin;
