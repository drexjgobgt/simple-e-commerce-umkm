const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Import snap dengan error handling
let snap;
let useMockPayment = false;

try {
  snap = require("../config/midtrans");
  console.log("✅ Midtrans Snap loaded successfully");
} catch (error) {
  console.error("❌ Failed to load Midtrans config:", error.message);
  useMockPayment = true;
}

// Create Midtrans payment token
router.post("/create-token", async (req, res) => {
  try {
    const { orderId, amount, customerDetails, items } = req.body;

    if (!orderId || !amount || !customerDetails || !items) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["orderId", "amount", "customerDetails", "items"],
      });
    }

    console.log("📦 Creating payment token for order:", orderId);
    console.log("💰 Amount:", amount);

    // MOCK PAYMENT MODE - untuk development tanpa Midtrans
    if (useMockPayment || !snap) {
      console.log("⚠️  MOCK PAYMENT MODE: Using fake payment token");

      // Auto update order ke paid setelah 3 detik (simulasi)
      setTimeout(async () => {
        try {
          await Order.findByIdAndUpdate(orderId, {
            paymentStatus: "paid",
            orderStatus: "processing",
          });
          console.log("✅ Mock payment completed for order:", orderId);
        } catch (error) {
          console.error("Mock payment update error:", error);
        }
      }, 3000);

      return res.json({
        token: "mock-token-" + Date.now(),
        redirect_url: "http://localhost:5173/",
        isMock: true,
      });
    }

    // REAL MIDTRANS
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: parseInt(amount),
      },
      customer_details: {
        first_name: customerDetails.first_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      item_details: items.map((item) => ({
        id: String(item.id),
        price: parseInt(item.price),
        quantity: parseInt(item.quantity),
        name: item.name,
      })),
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || "http://localhost:5173"}/`,
      },
    };

    console.log("🚀 Sending request to Midtrans...");
    const transaction = await snap.createTransaction(parameter);
    console.log("✅ Payment token created successfully");

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("❌ Midtrans Error Details:", {
      message: error.message,
      statusCode: error.httpStatusCode,
      apiResponse: error.ApiResponse,
    });

    res.status(500).json({
      message: "Gagal membuat payment token",
      error: error.message,
      details: error.ApiResponse || "Check backend console for details",
    });
  }
});

// Create payment token per vendor
router.post("/create-token-per-vendor", async (req, res) => {
  try {
    const { vendorId, amount, customerDetails, items } = req.body;

    if (!vendorId || !amount || !customerDetails || !items) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["vendorId", "amount", "customerDetails", "items"],
      });
    }

    const vendor = await User.findById(vendorId);
    if (!vendor || !vendor.midtransServerKey) {
      return res
        .status(400)
        .json({ message: "Vendor not found or no payment credentials" });
    }

    console.log("📦 Creating payment token for vendor:", vendorId);
    console.log("💰 Amount:", amount);

    // MOCK PAYMENT MODE
    if (useMockPayment) {
      console.log("⚠️  MOCK PAYMENT MODE for vendor: Using fake payment token");
      return res.json({
        token: "mock-token-" + Date.now(),
        redirect_url: "http://localhost:5173/",
        isMock: true,
      });
    }

    // Initialize Midtrans with vendor's server key
    const midtransClient = require("midtrans-client");
    const vendorSnap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey: vendor.midtransServerKey.trim(),
      clientKey: process.env.MIDTRANS_CLIENT_KEY.trim(), // Use default client key for frontend
    });

    const parameter = {
      transaction_details: {
        order_id: `vendor-${vendorId}-${Date.now()}`,
        gross_amount: parseInt(amount),
      },
      customer_details: {
        first_name: customerDetails.first_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      item_details: items.map((item) => ({
        id: String(item.id),
        price: parseInt(item.price),
        quantity: parseInt(item.quantity),
        name: item.name,
      })),
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || "http://localhost:5173"}/`,
      },
    };

    console.log("🚀 Sending request to Midtrans for vendor...");
    const transaction = await vendorSnap.createTransaction(parameter);
    console.log("✅ Vendor payment token created successfully");

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("❌ Vendor Midtrans Error Details:", {
      message: error.message,
      statusCode: error.httpStatusCode,
      apiResponse: error.ApiResponse,
    });

    res.status(500).json({
      message: "Gagal membuat payment token vendor",
      error: error.message,
      details: error.ApiResponse || "Check backend console for details",
    });
  }
});

// Webhook untuk notifikasi dari Midtrans
router.post("/notification", async (req, res) => {
  try {
    if (useMockPayment) {
      return res.status(200).json({ status: "success", mock: true });
    }

    const notification = req.body;
    const statusResponse = await snap.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
    );

    let paymentStatus = "pending";
    let orderStatus = "pending";

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        paymentStatus = "pending";
        orderStatus = "pending";
      } else if (fraudStatus == "accept") {
        paymentStatus = "paid";
        orderStatus = "processing";
      }
    } else if (transactionStatus == "settlement") {
      paymentStatus = "paid";
      orderStatus = "processing";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      paymentStatus = "failed";
      orderStatus = "cancelled";
    } else if (transactionStatus == "pending") {
      paymentStatus = "pending";
      orderStatus = "pending";
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: paymentStatus,
        orderStatus: orderStatus,
      },
      { new: true }
    );

    if (!updatedOrder) {
      console.error(`Order ${orderId} not found`);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log(
      `Order ${orderId} updated: Payment ${paymentStatus}, Status ${orderStatus}`
    );
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Check payment status
router.get("/status/:orderId", async (req, res) => {
  try {
    if (useMockPayment) {
      return res.json({ status: "mock", message: "Mock payment mode" });
    }

    const status = await snap.transaction.status(req.params.orderId);
    res.json(status);
  } catch (error) {
    console.error("Status Check Error:", error);
    res.status(500).json({
      message: "Gagal mengecek status pembayaran",
      error: error.message,
    });
  }
});

module.exports = router;
