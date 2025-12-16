import { useState, useEffect } from "react";
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
  const [shopInfo, setShopInfo] = useState(null);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  useEffect(() => {
    fetchShopInfo();
  }, []);

  const fetchShopInfo = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/public/shop-info`);
      setShopInfo(res.data);
    } catch (error) {
      console.error("Failed to fetch shop info");
    }
  };
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validasi No. Telepon
    let phoneClean = formData.phone.replace(/\D/g, ""); // Hapus non-digit

    // Convert 08 -> 628
    if (phoneClean.startsWith("0")) {
      phoneClean = "62" + phoneClean.slice(1);
    }
    
    // Convert 62 -> 62 (ensure it starts with 62)
    if (!phoneClean.startsWith("62")) {
       alert("Nomor telepon tidak valid. Gunakan format 08xx atau 628xx.");
       setLoading(false);
       return;
    }

    // Min length check (Indonesia numbers usually 10-13 digits, allowing tolerance)
    if (phoneClean.length < 10) {
        alert("Nomor telepon terlalu pendek. Mohon masukkan nomor WA yang valid.");
        setLoading(false);
        return;
    }

    try {
      // 1. Create order terlebih dahulu
      const orderData = {
        customerName: formData.customerName,
        email: formData.email,
        phone: phoneClean, // Use sanitized phone
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
      // 2. Logic Pembayaran
      if (
        formData.paymentMethod === "Transfer Bank" ||
        formData.paymentMethod === "E-Wallet"
      ) {
          // Jika ada QRIS, arahkan ke WhatsApp untuk konfirmasi manual
          if (shopInfo?.qrisImage) {
              const message = `Halo Admin, saya sudah melakukan pembayaran via QRIS.
              
Order ID: ${order._id}
Total: Rp ${totalAmount.toLocaleString("id-ID")}
Nama: ${formData.customerName}

Mohon diproses. Berikut bukti transfer saya (lampirkan gambar):`;
              
              const whatsappUrl = `https://wa.me/${shopInfo.storePhone.replace(/^0/, "62")}?text=${encodeURIComponent(message)}`;
              
              alert("✅ Pesanan dibuat! Silakan kirim bukti pembayaran via WhatsApp.");
              window.open(whatsappUrl, "_blank");
              clearCart();
              navigate("/");
          } else {
             // Fallback ke Midtrans jika TIDAK ada QRIS (Legacy)
             // Atau bisa juga tetap pakai Midtrans kalau user mau
             // Tapi user request "tidak usah pakai midtrans"
             // Jadi kita prioritaskan QRIS jika ada.
             
             // ... Code Midtrans lama ...
             const paymentData = {
                orderId: order._id,
                amount: totalAmount,
                customerDetails: {
                    first_name: formData.customerName,
                    email: formData.email,
                    phone: phoneClean,
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

            window.snap.pay(paymentResponse.data.token, {
                onSuccess: function (result) {
                    alert("✅ Pembayaran berhasil!");
                    clearCart();
                    navigate("/");
                },
                onPending: function (result) {
                    alert("⏳ Menunggu pembayaran.");
                    clearCart();
                    navigate("/");
                },
                onError: function (result) {
                    alert("❌ Pembayaran gagal.");
                },
                onClose: function () {
                    alert("Pembayaran belum selesai.");
                },
            });
          }
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
      <div className="min-h-screen pt-24 pb-12 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Keranjang Kosong</h2>
          <p className="text-gray-600 mb-4">Belum ada produk di keranjang Anda</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Belanja Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Keranjang Belanja</h2>

            {cart.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-gray-100 py-6 last:border-0"
              >
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-xl shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 line-clamp-2">{item.name}</h3>
                    <p className="text-primary-600 font-medium text-sm mt-1">
                      Rp {item.price.toLocaleString("id-ID")}
                    </p>
                    <div className="sm:hidden mt-3">
                       <div className="font-bold text-lg text-primary-700">
                        Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary-600 font-bold transition-all"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-gray-700">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary-600 font-bold transition-all"
                    >
                      +
                    </button>
                  </div>

                  <div className="hidden sm:block font-bold text-gray-800 w-32 text-right">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
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

              {/* Tampilkan QRIS jika metode transfer & ada gambar */}
              {(formData.paymentMethod === "Transfer Bank" || formData.paymentMethod === "E-Wallet") && shopInfo?.qrisImage && (
                  <div className="bg-white border-2 border-blue-100 rounded-xl p-4 flex flex-col items-center text-center animate-fade-in">
                      <p className="font-bold text-gray-800 mb-2">Scan QRIS untuk Bayar</p>
                      <div className="bg-white p-2 rounded-lg shadow-sm border mb-2">
                         <img src={shopInfo.qrisImage} alt="QRIS Toko" className="w-48 h-48 object-contain" />
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                          {shopInfo.storeName}
                      </p>
                      <div className="text-xs bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full">
                          Upload bukti transfer via WA setelah order
                      </div>
                  </div>
              )}
              
              {/* Fallback info bank jika tidak ada QRIS tapi ada info bank */}
              {(formData.paymentMethod === "Transfer Bank") && !shopInfo?.qrisImage && shopInfo?.bankName && (
                   <div className="bg-gray-50 p-4 rounded-lg border">
                       <p className="font-semibold text-sm">Transfer Manual:</p>
                       <p className="text-sm">{shopInfo.bankName}: {shopInfo.accountNumber}</p>
                       <p className="text-sm text-gray-500">a.n {shopInfo.accountName}</p>
                   </div>
              )}

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
    </div>
  );
}

export default Checkout;
