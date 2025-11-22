const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

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

      // Cek stok
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Stok ${product.name} tidak cukup` });
      }

      const itemTotal = product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        vendor: product.vendor._id,
        vendorStoreName: product.vendorStoreName,
        vendorAmount: itemTotal,
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

      // Update stok
      product.stock -= item.quantity;
      await product.save();
    }

    // Convert Map to Array
    const vendorPayments = Array.from(vendorPaymentsMap.values());

    const orderData = {
      customerName,
      email: email.toLowerCase().trim(),
      phone,
      address,
      items: orderItems,
      totalAmount,
      paymentMethod,
      notes,
      vendorPayments,
    };

    // Add customer ID if user is logged in
    if (userId) {
      orderData.customer = userId;
    }

    const order = new Order(orderData);
    const savedOrder = await order.save();

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

// Get MY order history (PROTECTED - requires login)
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userEmail = req.user.email;

    console.log("🔍 Fetching orders for user ID:", userId);
    // Find orders by customer ID or by email for backward compatibility
    const orders = await Order.find({
      $or: [
        { customer: userId },
        { customer: null, email: userEmail.toLowerCase().trim() },
      ],
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${orders.length} orders for user ${userId}`);

    res.json(orders);
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
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { orderStatus, paymentStatus },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ message: "Order tidak ditemukan" });
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
