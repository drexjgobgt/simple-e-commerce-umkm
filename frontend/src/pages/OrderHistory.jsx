import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const token = localStorage.getItem("token");

    if (!user || !token) {
      alert("Silakan login terlebih dahulu untuk melihat riwayat pesanan");
      navigate("/login");
      return;
    }

    fetchOrderHistory(token);
  }, []);

  const fetchOrderHistory = async (token) => {
    try {
      // Use secure endpoint dengan authentication
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-16 text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Riwayat Pesanan
          </h1>
          <p className="text-gray-600">
            Lihat semua pesanan yang pernah Anda buat
          </p>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Order Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      📅{" "}
                      {new Date(order.createdAt).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Rp {order.totalAmount.toLocaleString("id-ID")}
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus.toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-semibold ${getPaymentBadge(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus === "paid" ? "✓ PAID" : "PENDING"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Body */}
              <div className="p-6">
                {/* Customer Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-gray-800">
                    📍 Informasi Pengiriman
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <strong>Nama:</strong> {order.customerName}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.email}
                    </p>
                    <p>
                      <strong>Telepon:</strong> {order.phone}
                    </p>
                    <p>
                      <strong>Alamat:</strong> {order.address.street},{" "}
                      {order.address.city}, {order.address.province}{" "}
                      {order.address.postalCode}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-3 text-gray-800">
                    📦 Produk yang Dipesan
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {item.name}
                          </p>
                          {item.vendorStoreName && (
                            <p className="text-xs text-gray-500">
                              🏪 {item.vendorStoreName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {item.quantity} × Rp{" "}
                            {item.price.toLocaleString("id-ID")}
                          </p>
                          <p className="font-semibold text-blue-600">
                            Rp{" "}
                            {(item.price * item.quantity).toLocaleString(
                              "id-ID"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>💳 Metode Pembayaran:</span>
                    <span className="font-semibold">{order.paymentMethod}</span>
                  </div>
                  {order.notes && (
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">📝 Catatan:</span>
                      <span className="ml-2 text-gray-700">{order.notes}</span>
                    </div>
                  )}
                </div>

                {/* Vendor Payments Info (if exists) */}
                {order.vendorPayments && order.vendorPayments.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold mb-2 text-sm text-gray-800">
                      💰 Pembayaran Per Vendor
                    </h4>
                    <div className="space-y-1">
                      {order.vendorPayments.map((vp, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {vp.vendorStoreName}
                          </span>
                          <span className="font-semibold">
                            Rp {vp.amount.toLocaleString("id-ID")}
                            <span
                              className={`ml-2 text-xs ${
                                vp.paymentStatus === "paid"
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              ({vp.paymentStatus})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderHistory;
