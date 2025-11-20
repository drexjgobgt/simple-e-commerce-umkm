import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function Checkout({ cart, updateQuantity, removeFromCart, clearCart }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    province: "",
    paymentMethod: "Transfer Bank",
    notes: "",
  });

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          province: formData.province,
        },
        items: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      const response = await axios.post(`${API_URL}/orders`, orderData);

      alert(`Pesanan berhasil! ID Order: ${response.data._id}`);
      clearCart();
      navigate("/");
    } catch (error) {
      alert(
        "Terjadi kesalahan: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Keranjang Kosong</h2>
        <p className="text-gray-600 mb-4">Belum ada produk di keranjang Anda</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Belanja Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-900">
        🛒 Checkout
      </h1>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              📦 Keranjang Belanja
            </h2>

            {cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-6 border-b border-gray-200 py-6 last:border-b-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl shadow-md"
                />

                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="bg-white hover:bg-gray-100 w-8 h-8 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 font-bold text-lg min-w-[3rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="bg-white hover:bg-gray-100 w-8 h-8 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>

                <div className="font-bold text-xl text-blue-600">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200 p-2 hover:bg-red-50 rounded-lg"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          {/* Form Checkout */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Informasi Pembeli</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  No. Telepon *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Alamat Lengkap *
                </label>
                <textarea
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                  placeholder="Jalan, No. Rumah, RT/RW"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kota *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Provinsi *
                </label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Metode Pembayaran *
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Transfer Bank">Transfer Bank</option>
                  <option value="COD">COD (Cash on Delivery)</option>
                  <option value="E-Wallet">E-Wallet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  rows="2"
                  placeholder="Catatan untuk penjual"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Memproses..." : "Buat Pesanan"}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-4 border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              📊 Ringkasan Pesanan
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="font-semibold">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Ongkir</span>
                <span className="text-green-600 font-bold">🆓 Gratis</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                💡 Pesanan akan diproses dalam 1-2 hari kerja setelah pembayaran
                dikonfirmasi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
