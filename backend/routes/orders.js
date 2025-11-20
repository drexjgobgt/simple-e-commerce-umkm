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

    // Hitung total amount
    let totalAmount = 0;
    const orderItems = [];

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
      });

      totalAmount += product.price * item.quantity;

      // Update stok
      product.stock -= item.quantity;
      await product.save();
    }

    const order = new Order({
      customerName,
      email,
      phone,
      address,
      items: orderItems,
      totalAmount,
      paymentMethod,
      notes,
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

module.exports = router;
