const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");
const notifications = require("../utils/notifications");

// Utility: adjust stock safely based on an order's items
const adjustStockForOrder = async (order, direction = "decrease") => {
  const updated = [];
  try {
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new Error(`Produk ${item.product} tidak ditemukan`);
      }

      if (direction === "decrease" && product.stock < item.quantity) {
        throw new Error(`Stok ${product.name} tidak cukup`);
      }

      const delta = direction === "decrease" ? -item.quantity : item.quantity;
      product.stock += delta;
      await product.save();
      updated.push({ product, delta });
    }
  } catch (error) {
    // rollback jika gagal di tengah jalan
    for (const change of updated) {
      change.product.stock -= change.delta;
      await change.product.save();
    }
    throw error;
  }
};

// Helper function to get user from token (optional - for guest checkout)
const getOptionalUser = (req) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Create order (public - support guest checkout)
router.post("/", async (req, res) => {
  try {
    const { items, customerName, email, phone, address, paymentMethod, notes } =
      req.body;

    // Get user ID if logged in
    const userId = getOptionalUser(req);

    console.log("📥 Received order request:", {
      customerName,
      userId: userId || "guest",
      itemsCount: items.length,
      paymentMethod,
    });
    // Hitung total amount dan collect vendor info
    let totalAmount = 0;
    const orderItems = [];
    const vendorPaymentsMap = new Map();

    for (let item of items) {
      const product = await Product.findById(item.productId).populate("vendor");
      if (!product) {
        console.error("❌ Product not found:", item.productId);
        return res
          .status(404)
          .json({ message: `Produk ${item.productId} tidak ditemukan` });
      }

      console.log(
        "✓ Product found:",
        product.name,
        "- Vendor:",
        product.vendorStoreName
      );

      // Cek stok (tanpa langsung mengurangi, akan dikurangi saat pembayaran sukses/COD)
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Stok ${product.name} tidak cukup` });
      }

      const itemTotal = product.price * item.quantity;

      // Vendor-specific WA credentials (optional)
      let vendorCreds = null;
      if (product.vendor?.waApiKey && product.vendor?.waPhoneNumberId) {
        vendorCreds = {
          waApiKey: product.vendor.waApiKey,
          waPhoneNumberId: product.vendor.waPhoneNumberId,
          waWebhookUrl:
            process.env.WA_WEBHOOK_URL?.replace(
              "<PHONE_NUMBER_ID>",
              product.vendor.waPhoneNumberId
            ) || process.env.WA_WEBHOOK_URL,
        };
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        vendor: product.vendor._id,
        vendorStoreName: product.vendorStoreName,
        vendorPhone: product.vendorPhone || product.vendor.storePhone,
        vendorCreds,
        vendorAmount: itemTotal,
        vendorAddress: product.vendorAddress,
        vendorAddressDetail: product.vendorAddressDetail,
        vendorLocation: product.vendorLocation,
      });

      totalAmount += itemTotal;

      // Aggregate vendor payments
      if (vendorPaymentsMap.has(product.vendor._id.toString())) {
        vendorPaymentsMap.get(product.vendor._id.toString()).amount +=
          itemTotal;
      } else {
        vendorPaymentsMap.set(product.vendor._id.toString(), {
          vendor: product.vendor._id,
          vendorStoreName: product.vendorStoreName,
          amount: itemTotal,
          paymentStatus: "pending",
        });
      }
    }

    // Convert Map to Array
    const vendorPayments = Array.from(vendorPaymentsMap.values());

    const isCOD = paymentMethod === "COD";

    const orderData = {
      customerName,
      email: email.toLowerCase().trim(),
      phone,
      address,
      items: orderItems,
      totalAmount,
      paymentMethod,
      notes,
      paymentStatus: isCOD ? "paid" : "pending",
      orderStatus: isCOD ? "processing" : "pending",
      stockAdjusted: false,
      vendorPayments,
    };

    // Add customer ID if user is logged in
    if (userId) {
      orderData.customer = userId;
    }

    const order = new Order(orderData);
    let savedOrder = await order.save();

    // Untuk COD, langsung kurangi stok dan tandai order aktif
    if (isCOD) {
      await adjustStockForOrder(savedOrder, "decrease");
      savedOrder.stockAdjusted = true;
      await savedOrder.save();
      notifications
        .sendReceipts(savedOrder)
        .catch((err) =>
          console.error("Receipt send error (COD):", err.message)
        );
    }

    console.log(
      "✅ Order saved:",
      savedOrder._id,
      "- Customer:",
      userId || "guest"
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("❌ Order creation error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get MY order history (PROTECTED - requires login) + pagination & filter
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    const sortDir = req.query.sort === "asc" ? 1 : -1;

    const filter = {
      $or: [
        { customer: userId },
        { customer: null, email: userEmail.toLowerCase().trim() },
      ],
    };

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }

    console.log(
      "🔍 Fetching orders for user ID:",
      userId,
      "page:",
      page,
      "sort:",
      sortDir === 1 ? "asc" : "desc"
    );

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("items.product")
        .sort({ createdAt: sortDir })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    console.log(`✅ Found ${orders.length}/${total} orders for user ${userId}`);

    res.json({
      orders,
      page,
      totalPages,
      total,
      hasMore: page < totalPages,
    });
  } catch (error) {
    console.error("❌ Fetch orders error:", error);
    res.status(500).json({ message: error.message });
  }
});

// DEPRECATED - Keep for backward compatibility but add warning
router.get("/customer/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const normalizedEmail = email.toLowerCase().trim();

    console.warn("⚠️  DEPRECATED: Using insecure email-based order lookup");
    console.log("🔍 Fetching orders for authenticated user");
    const orders = await Order.find({ email: normalizedEmail })
      .populate("items.product")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for ${normalizedEmail}`);

    res.json(orders);
  } catch (error) {
    console.error("❌ Fetch orders error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only - vendor sees only their orders)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vendorId = req.user.userId;

    // Filter orders yang contain produk dari vendor ini
    const orders = await Order.find({
      "items.vendor": vendorId,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID (owner only)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    // Optional: Check if user owns this order
    const userId = getOptionalUser(req);
    if (userId && order.customer && order.customer.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Anda tidak memiliki akses ke order ini" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order status (admin only)
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { orderStatus, paymentStatus } = req.body;
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order tidak ditemukan" });
      }
      const wasDelivered = order.orderStatus === "delivered";
      const wasPaid = order.paymentStatus === "paid";

      // Validate simple state machine
      const allowedStatuses = [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];
      if (orderStatus && !allowedStatuses.includes(orderStatus)) {
        return res.status(400).json({ message: "Status pesanan tidak valid" });
      }

      const allowedPayment = ["pending", "paid", "failed"];
      if (paymentStatus && !allowedPayment.includes(paymentStatus)) {
        return res
          .status(400)
          .json({ message: "Status pembayaran tidak valid" });
      }

      // Apply changes
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;

      // Adjust inventory based on payment status transitions
      if (order.paymentStatus === "paid" && !order.stockAdjusted) {
        await adjustStockForOrder(order, "decrease");
        order.stockAdjusted = true;
      }
      if (
        order.paymentStatus === "failed" &&
        order.stockAdjusted &&
        order.orderStatus === "cancelled"
      ) {
        await adjustStockForOrder(order, "increase");
        order.stockAdjusted = false;
      }

      await order.save();
      // Send receipt when newly paid or delivered
      if (
        (order.paymentStatus === "paid" && !wasPaid) ||
        (!wasDelivered && order.orderStatus === "delivered")
      ) {
        notifications
          .sendReceipts(order)
          .catch((err) =>
            console.error("Receipt send error (status patch):", err.message)
          );
      }

      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Mark vendor payment as paid (admin only)
router.post(
  "/:orderId/pay-vendor",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const { vendorId } = req.body;

      const order = await Order.findById(req.params.orderId);
      if (!order) {
        return res.status(404).json({ message: "Order tidak ditemukan" });
      }

      const vendorPayment = order.vendorPayments.find(
        (vp) => vp.vendor.toString() === vendorId
      );

      if (!vendorPayment) {
        return res
          .status(404)
          .json({ message: "Vendor payment tidak ditemukan" });
      }

      vendorPayment.paymentStatus = "paid";
      vendorPayment.paidAt = new Date();

      await order.save();

      res.json({ message: "Payment marked as paid", order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
