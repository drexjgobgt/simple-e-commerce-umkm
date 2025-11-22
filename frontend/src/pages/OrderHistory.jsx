import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderHistory, setShowOrderHistory] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      navigate("/login");
      return;
    }

    fetchOrderHistory(user.email);
  }, []);

  const fetchOrderHistory = async (email) => {
    try {
      const response = await axios.get(`${API_URL}/orders/customer/${email}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching order history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-lg">Memuat riwayat pesanan...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Belum Ada Pesanan</h2>
        <p className="text-gray-600 mb-4">
          Anda belum memiliki riwayat pesanan.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          Mulai Belanja
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Riwayat Pesanan</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Order #{order._id.slice(-8).toUpperCase()}
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
                <div className="mt-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.orderStatus === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.orderStatus === "processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.orderStatus}
                  </span>
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

            <div className="mb-4">
              <div className="text-sm text-gray-600">
                Metode Pembayaran: {order.paymentMethod}
                {order.notes && (
                  <div className="mt-1">Catatan: {order.notes}</div>
                )}
              </div>
            </div>

            {/* Order History Section */}
            {order.history && order.history.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() =>
                    setShowOrderHistory((prev) => ({
                      ...prev,
                      [order._id]: !prev[order._id],
                    }))
                  }
                  className="text-sm text-blue-600 hover:text-blue-800 mb-2"
                >
                  {showOrderHistory[order._id] ? "Hide" : "Show"} History (
                  {order.history.length} entries)
                </button>
                {showOrderHistory[order._id] && (
                  <div className="p-3 bg-blue-50 rounded max-h-40 overflow-y-auto">
                    <h4 className="font-semibold mb-2 text-sm">
                      Order History:
                    </h4>
                    {order.history.map((entry, idx) => (
                      <div key={idx} className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">
                          {new Date(entry.timestamp).toLocaleString("id-ID")}
                        </span>
                        <span className="ml-2 px-1 py-0.5 bg-gray-200 rounded text-xs">
                          {entry.action.replace("_", " ")}
                        </span>
                        <span className="ml-2">{entry.description}</span>
                        {entry.performedByName && (
                          <span className="ml-2 text-gray-500">
                            by {entry.performedByName}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderHistory;
