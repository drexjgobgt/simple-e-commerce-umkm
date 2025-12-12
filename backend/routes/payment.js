const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const notifications = require("../utils/notifications");

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

// Utility: adjust stock based on order items
const adjustStockForOrder = async (order, direction = "decrease") => {
  const updated = [];
  try {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) throw new Error(`Produk ${item.product} tidak ditemukan`);
      if (direction === "decrease" && product.stock < item.quantity) {
        throw new Error(`Stok ${product.name} tidak cukup`);
      }
      const delta = direction === "decrease" ? -item.quantity : item.quantity;
      product.stock += delta;
      await product.save();
      updated.push({ product, delta });
    }
  } catch (error) {
    for (const change of updated) {
      change.product.stock -= change.delta;
      await change.product.save();
    }
    throw error;
  }
};

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

    // Find Admin to get Payment Keys
    const User = require("../models/User");
    const admin = await User.findOne({ role: "admin" });

    let currentSnap = snap;
    let isDynamicKey = false;

    if (admin && admin.midtransServerKey && admin.midtransClientKey) {
       console.log("🔑 Using Admin's Custom Midtrans Keys from DB");
       const midtransClient = require("midtrans-client");
       currentSnap = new midtransClient.Snap({
          isProduction: false, // Default to sandbox for safety, or add a field in DB for isProduction
          serverKey: admin.midtransServerKey,
          clientKey: admin.midtransClientKey
       });
       isDynamicKey = true;
    } else {
       console.log("🔑 Using Default Env Midtrans Keys");
    }

    // MOCK PAYMENT MODE - override if explicit mock or no snap available at all
    if (useMockPayment || (!currentSnap && !isDynamicKey)) {
      console.log("⚠️  MOCK PAYMENT MODE: Using fake payment token");

      // Auto update order ke paid setelah 3 detik (simulasi)
      setTimeout(async () => {
        try {
          const order = await Order.findById(orderId);
          if (order) {
             if (!order.stockAdjusted) {
              await adjustStockForOrder(order, "decrease");
              order.stockAdjusted = true;
            }
            order.paymentStatus = "paid";
            order.orderStatus = "processing";
            await order.save();
          }
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
    const transaction = await currentSnap.createTransaction(parameter);
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

    // Verify signature to avoid spoofed callbacks
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const expectedSignature = crypto
      .createHash("sha512")
      .update(
        `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`
      )
      .digest("hex");

    if (notification.signature_key !== expectedSignature) {
      console.warn("⚠️  Invalid Midtrans signature for order", notification.order_id);
      return res.status(400).json({ message: "Invalid signature" });
    }

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

    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`Order ${orderId} not found`);
      return res.status(404).json({ message: "Order not found" });
    }

    // Adjust inventory when payment settled; restore when failed/cancelled
    if (paymentStatus === "paid" && !order.stockAdjusted) {
      await adjustStockForOrder(order, "decrease");
      order.stockAdjusted = true;
    }
    if (
      ["failed"].includes(paymentStatus) &&
      order.stockAdjusted &&
      ["cancelled"].includes(orderStatus)
    ) {
      await adjustStockForOrder(order, "increase");
      order.stockAdjusted = false;
    }

    order.paymentStatus = paymentStatus;
    order.orderStatus = orderStatus;
    const updatedOrder = await order.save();

    if (paymentStatus === "paid") {
      notifications
        .sendReceipts(updatedOrder)
        .catch((err) =>
          console.error("Receipt send error (midtrans webhook):", err.message)
        );
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
