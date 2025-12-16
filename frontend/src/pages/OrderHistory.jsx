import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const STORE_PHONE = import.meta.env.VITE_STORE_PHONE || "6285834255091"; // Default user number or placeholder

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const PAGE_SIZE = 10;
  const POLL_MS = 20000;

  useEffect(() => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
        console.error("Error parsing user data", e);
        localStorage.removeItem("user"); // Clear corrupted data
    }
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Silakan login terlebih dahulu untuk melihat riwayat pesanan");
      navigate("/login");
      return;
    }

    fetchOrderHistory(token, 1, false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    // reload when filter changes
    fetchOrderHistory(token, 1, false);
  }, [statusFilter, fromDate, toDate, sortOrder]);

  // Polling ringan saat tab aktif
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    let intervalId;
    const start = () => {
      intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchOrderHistory(token, 1, false);
        }
      }, POLL_MS);
    };
    start();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [statusFilter, fromDate, toDate, sortOrder]);

  const fetchOrderHistory = async (token, targetPage = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      // Use secure endpoint dengan authentication
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: targetPage,
          limit: PAGE_SIZE,
          status: statusFilter || undefined,
          from: fromDate || undefined,
          to: toDate || undefined,
          sort: sortOrder,
        },
      });

      const data = response.data;
      if (append) {
        setOrders((prev) => [...prev, ...data.orders]);
      } else {
        setOrders(data.orders);
      }
      setPage(data.page);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Error fetching order history:", error);
      if (error.response?.status === 401) {
        alert("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-gray-100 text-gray-800",
      processing: "bg-yellow-100 text-yellow-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return badges[status] || badges.pending;
  };

  const getPaymentBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return badges[status] || badges.pending;
  };

  const handleSendToWhatsApp = (order) => {
    const message = `Halo Toko Gas, saya ingin konfirmasi pesanan saya:
    
📄 Order ID: ${order._id}
📅 Tanggal: ${new Date(order.createdAt).toLocaleDateString("id-ID")}
👤 Nama: ${order.customerName || "Pelanggan"}
📦 Status: ${order.orderStatus.toUpperCase()}
💰 Total: Rp ${order.totalAmount.toLocaleString("id-ID")}

Detail Item:
${order.items.map(item => `- ${item.name} (${item.quantity}x)`).join("\n")}

Alamat Pengiriman:
${order.address.street}, ${order.address.city}

Mohon diproses ya, terima kasih! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${STORE_PHONE}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pt-28">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">📦</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">
              Belum Ada Pesanan
            </h2>
            <p className="text-gray-600 mb-8">
              Anda belum memiliki riwayat pesanan. Mulai belanja sekarang!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg"
            >
              Mulai Belanja
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-x-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent -z-10"></div>

      <div className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary-700 to-indigo-700 bg-clip-text text-transparent">
              Riwayat Pesanan
            </h1>
            <p className="text-gray-600">
              Pantau status pengiriman gas anda
            </p>
          </div>

          <div className="glass p-2 rounded-xl flex items-center gap-2 overflow-x-auto scrollbar-hide max-w-full">
               {["", "pending", "processing", "shipped", "delivered"].map(status => (
                   <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        statusFilter === status 
                        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" 
                        : "text-gray-600 hover:bg-white/50"
                    }`}
                   >
                       {status === "" ? "Semua" : status.charAt(0).toUpperCase() + status.slice(1)}
                   </button>
               ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="glass-card rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300"
            >
              {/* Order Header */}
              <div className="bg-white/50 p-5 border-b border-white/40 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl shadow-inner">
                        📦
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                             <h3 className="font-bold text-gray-800">
                                Order #{order._id.slice(-6).toUpperCase()}
                            </h3>
                             <span className="text-xs text-gray-400">•</span>
                             <span className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString("id-ID", {
                                    day: "numeric", month: "short", year: "numeric"
                                })}
                             </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold border ${
                                 order.paymentStatus === 'paid' 
                                 ? 'bg-green-50 text-green-700 border-green-200' 
                                 : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                             }`}>
                                 {order.paymentStatus === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                             </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:items-end justify-center">
                    <div className="text-2xl font-bold text-primary-700">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </div>
                    <span
                        className={`text-sm font-medium px-3 py-1 rounded-full mt-1 w-fit ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.toUpperCase()}
                      </span>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-5">
                {/* Items */}
                <div className="space-y-4 mb-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-3 rounded-xl bg-white/40 hover:bg-white/70 transition-colors border border-transparent hover:border-white/50"
                      >
                         {/* Placeholder image if not stored in order item, assuming simplistic data structure */}
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shadow-sm">
                            🔥
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 line-clamp-2">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right font-semibold text-gray-700 self-center">
                             Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-100/50 gap-4 text-sm text-gray-600">
                    <div>
                         <span className="block font-semibold text-gray-700 mb-1">Dikirim ke:</span>
                         {order.address.street}, {order.address.city}
                    </div>
                    {/* Action Buttons (Optional placeholder for future like 'Track', 'Invoice') */}
                    <div>
                        <button className="text-primary-600 font-semibold hover:text-primary-800 transition-colors text-sm">
                            Lacak Pengiriman →
                        </button>
                    </div>
                </div>

                {/* Footer Actions - WhatsApp Button */}
                <div className="mt-4 pt-3 flex justify-end border-t border-gray-100">
                    <button 
                        onClick={() => handleSendToWhatsApp(order)}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md hover:shadow-green-500/20 active:scale-95"
                    >
                        <span className="text-lg">📱</span>
                        Kirim Nota ke WA
                    </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() =>
                fetchOrderHistory(
                  localStorage.getItem("token"),
                  page + 1,
                  true
                )
              }
              className="px-8 py-3 bg-white text-primary-600 border border-primary-200 shadow-lg shadow-primary-600/10 rounded-full hover:bg-primary-50 transition-all font-bold transform hover:-translate-y-1"
              disabled={loading}
            >
              {loading ? "Memuat..." : "Tampilkan Lebih Banyak"}
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={() => navigate("/")}
            className="text-gray-500 hover:text-gray-800 font-medium"
          >
            ← Kembali
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
