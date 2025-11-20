const express = require("express");
const router = express.Router();
const snap = require("../config/midtrans");
const Order = require("../models/Order");

// Create Midtrans payment token
router.post("/create-token", async (req, res) => {
  try {
    const { orderId, amount, customerDetails, items } = req.body;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerDetails.first_name,
        email: customerDetails.email,
        phone: customerDetails.phone,
      },
      item_details: items.map((item) => ({
        id: item.id,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      credit_card: {
        secure: true,
      },
      callbacks: {
        finish: `${process.env.FRONTEND_URL || "http://localhost:5173"}/`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({
      message: "Gagal membuat payment token",
      error: error.message,
    });
  }
});

// Webhook untuk notifikasi dari Midtrans
router.post("/notification", async (req, res) => {
  try {
    const notification = req.body;

    // Verify notification
    const statusResponse = await snap.transaction.notification(notification);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `Transaction notification received. Order ID: ${orderId}. Transaction status: ${transactionStatus}. Fraud status: ${fraudStatus}`
    );

    let paymentStatus = "pending";
    let orderStatus = "pending";

    // Set payment status based on transaction status
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

    // Update order in database
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
