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
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    fetchProducts();
    fetchOrders();
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

  const updateOrderStatus = async (orderId, orderStatus, paymentStatus) => {
    try {
      await axios.patch(
        `${API_URL}/orders/${orderId}/status`,
        { orderStatus, paymentStatus },
        getAuthHeader()
      );
      alert("Status berhasil diupdate!");
      fetchOrders();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === "products"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Produk
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === "orders"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Pesanan
        </button>
        <button
          onClick={() => setActiveTab("payment")}
          className={`px-6 py-2 rounded-lg font-semibold transition ${
            activeTab === "payment"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          💳 Setup Pembayaran
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

          {/* Products Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Produk</th>
                  <th className="px-4 py-3 text-left">Kategori</th>
                  <th className="px-4 py-3 text-left">Harga</th>
                  <th className="px-4 py-3 text-left">Stok</th>
                  <th className="px-4 py-3 text-left">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3">
                      Rp {product.price.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-800 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

              <div className="flex gap-4">
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
                        order.paymentStatus
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
                        e.target.value
                      )
                    }
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>

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
    </div>
  );
}

export default Admin;
