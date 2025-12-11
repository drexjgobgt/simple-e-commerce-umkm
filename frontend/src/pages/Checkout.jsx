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
      // 1. Create order terlebih dahulu
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

      const token = localStorage.getItem("token");
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      };

      const orderResponse = await axios.post(`${API_URL}/orders`, orderData, config);
      const order = orderResponse.data;

      // 2. Jika metode pembayaran online, proses dengan Midtrans
      if (
        formData.paymentMethod === "Transfer Bank" ||
        formData.paymentMethod === "E-Wallet"
      ) {
        const paymentData = {
          orderId: order._id,
          amount: totalAmount,
          customerDetails: {
            first_name: formData.customerName,
            email: formData.email,
            phone: formData.phone,
          },
          items: cart.map((item) => ({
            id: item._id,
            price: item.price,
            quantity: item.quantity,
            name: item.name,
          })),
        };

        const paymentResponse = await axios.post(
          `${API_URL}/payment/create-token`,
          paymentData
        );

        // 3. Tampilkan Midtrans Snap popup
        window.snap.pay(paymentResponse.data.token, {
          onSuccess: function (result) {
            console.log("Payment succeeded - Order ID:", order._id);
            alert("✅ Pembayaran berhasil! Terima kasih.");
            clearCart();
            navigate("/");
          },
          onPending: function (result) {
            console.log("Payment pending - Order ID:", order._id);
            alert("⏳ Menunggu pembayaran. Order ID: " + order._id);
            clearCart();
            navigate("/");
          },
          onError: function (result) {
            console.log("Payment error - Order ID:", order._id);
            alert("❌ Pembayaran gagal. Silakan coba lagi.");
          },
          onClose: function () {
            console.log("Customer closed the popup without finishing payment");
            alert(
              "Pembayaran dibatalkan. Order ID: " +
                order._id +
                " masih tersimpan."
            );
          },
        });
      } else {
        // COD - langsung sukses
        alert(`✅ Pesanan berhasil dibuat! 
Order ID: ${order._id}
Metode: Cash on Delivery (COD)
Total: Rp ${totalAmount.toLocaleString("id-ID")}

Silakan siapkan uang tunai saat barang tiba.`);
        clearCart();
        navigate("/");
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      const serverMessage = error.response?.data?.message || "Terjadi kesalahan pada server";
      alert(`❌ Gagal membuat pesanan:\n${serverMessage}\n\nSilakan periksa kembali data Anda atau coba lagi.`);
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
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Keranjang Belanja</h2>

            {cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 border-b py-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    -
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    +
                  </button>
                </div>

                <div className="font-semibold">
                  Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="text-red-600 hover:text-red-800"
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
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {totalAmount.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir</span>
                <span className="text-green-600">Gratis</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-blue-600">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
