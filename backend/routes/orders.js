const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Create order (public)
router.post("/", async (req, res) => {
  try {
    const { items, customerName, email, phone, address, paymentMethod, notes } =
      req.body;

    // Hitung total amount dan vendor payments
    let totalAmount = 0;
    const orderItems = [];
    const vendorPaymentsMap = new Map();

    for (let item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Produk ${item.productId} tidak ditemukan` });
      }

      // Cek stok
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Stok ${product.name} tidak cukup` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        vendor: product.vendor,
        vendorStoreName: product.vendorStoreName,
        vendorAmount: product.price * item.quantity,
      });

      totalAmount += product.price * item.quantity;

      // Accumulate vendor payments
      const vendorId = product.vendor.toString();
      if (!vendorPaymentsMap.has(vendorId)) {
        vendorPaymentsMap.set(vendorId, {
          vendor: product.vendor,
          vendorStoreName: product.vendorStoreName,
          amount: 0,
        });
      }
      vendorPaymentsMap.get(vendorId).amount += product.price * item.quantity;

      // Update stok
      product.stock -= item.quantity;
      await product.save();
    }

    // Convert vendor payments map to array
    const vendorPayments = Array.from(vendorPaymentsMap.values());

    const order = new Order({
      customerName,
      email,
      phone,
      address,
      items: orderItems,
      totalAmount,
      paymentMethod,
      notes,
      vendorPayments,
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
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

    res.json({ message: "Payment marked as paid" });
  }
);

module.exports = router;
