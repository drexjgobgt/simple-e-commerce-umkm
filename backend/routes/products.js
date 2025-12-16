const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Get semua produk (public) - dengan info vendor
router.get("/", async (req, res) => {
  try {
    const { vendor, category, city, lat, lng, radiusKm } = req.query;

    const filter = { isActive: true };
    if (vendor) filter.vendor = vendor;
    if (category) filter.category = category;
    if (city) filter["vendorAddressDetail.city"] = city;

    // Geo filter optional
    if (lat && lng && radiusKm) {
      const radiusInMeters = Number(radiusKm) * 1000;
      filter.vendorLocation = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

    const products = await Product.find(filter)
      .populate("vendor", "storeName storeDescription storePhone")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get produk by vendor (untuk admin melihat produk sendiri)
router.get(
  "/my-products",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const products = await Product.find({
        vendor: req.user.userId,
        isActive: true,
      }).sort({ createdAt: -1 });

      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get produk by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "vendor",
      "storeName storeDescription storePhone storeAddress storeAddressDetail"
    );

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create produk (admin only - hanya untuk vendor sendiri)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Get vendor info
    const vendor = await User.findById(req.user.userId);
    if (!vendor || vendor.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    // Create product dengan vendor info & lokasi
    const product = new Product({
      ...req.body,
      vendor: vendor._id,
      vendorName: vendor.name,
      vendorStoreName: vendor.storeName,
      vendorPhone: vendor.storePhone,
      vendorAddress: vendor.storeAddress,
      vendorAddressDetail: vendor.storeAddressDetail,
      vendorLocation: vendor.location,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update produk (admin only - hanya produk sendiri)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // VENDOR ISOLATION: Cek apakah produk milik vendor ini
    if (product.vendor.toString() !== req.user.userId) {
      return res.status(403).json({
        message:
          "Anda tidak memiliki akses untuk mengedit produk ini. Produk ini milik vendor lain.",
      });
    }

    // Update product (tidak update vendor info)
    const allowedUpdates = [
      "name",
      "description",
      "price",
      "category",
      "stock",
      "unit",
      "image",
    ];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete produk (admin only - hanya produk sendiri)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    // VENDOR ISOLATION: Cek apakah produk milik vendor ini
    if (product.vendor.toString() !== req.user.userId) {
      return res.status(403).json({
        message:
          "Anda tidak memiliki akses untuk menghapus produk ini. Produk ini milik vendor lain.",
      });
    }

    // Soft delete - tandai sebagai tidak aktif
    product.isActive = false;
    await product.save();

    res.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
