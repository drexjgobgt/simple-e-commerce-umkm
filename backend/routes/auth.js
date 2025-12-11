const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const {
  validateRegister,
  validateRegisterVendor,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validation");

// Register Customer (Public)
router.post(
  "/register",
  validateRegister,
  handleValidationErrors,
  async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    const user = new User({
      email,
      password,
      name,
      role: "customer",
    });
    await user.save();

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Register Admin/Vendor (Dengan Secret Key)
router.post(
  "/register-vendor",
  validateRegisterVendor,
  handleValidationErrors,
  async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      storeName,
      storeDescription,
      storePhone,
      storeAddress,
      bankName,
      accountNumber,
      accountName,
      secretKey,
    } = req.body;

    // VALIDASI SECRET KEY
    const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

    if (secretKey !== ADMIN_SECRET_KEY) {
      return res.status(403).json({
        message:
          "Secret key tidak valid! Hubungi super admin untuk mendapatkan kunci registrasi.",
      });
    }

    // Cek email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    // Validasi field required untuk vendor
    if (!storeName) {
      return res.status(400).json({ message: "Nama toko wajib diisi" });
    }

    // Create vendor account
    const user = new User({
      email,
      password,
      name,
      role: "admin",
      storeName,
      storeDescription,
      storePhone,
      storeAddress,
      bankName,
      accountNumber,
      accountName,
      isVerified: false, // Perlu verifikasi super admin
      isActive: true,
    });

    await user.save();

    res.status(201).json({
      message:
        "Registrasi vendor berhasil! Akun Anda sedang dalam proses verifikasi.",
      vendorId: user._id,
      storeName: user.storeName,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post("/login", validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    // Cek apakah akun aktif (untuk admin)
    if (user.role === "admin" && !user.isActive) {
      return res
        .status(403)
        .json({ message: "Akun Anda telah dinonaktifkan. Hubungi admin." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        storeName: user.storeName,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Vendor Profile
router.get("/vendor-profile", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Tidak ada token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Vendor Profile
router.put("/vendor-profile", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Tidak ada token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const {
      storeName,
      storeDescription,
      storePhone,
      storeAddress,
      storeAddressDetail,
      location,
      bankName,
      accountNumber,
      accountName,
    } = req.body;

    if (storeName) user.storeName = storeName;
    if (storeDescription) user.storeDescription = storeDescription;
    if (storePhone) user.storePhone = storePhone;
    if (storeAddress) user.storeAddress = storeAddress;
    if (storeAddressDetail) user.storeAddressDetail = storeAddressDetail;
    if (location && location.type === "Point" && Array.isArray(location.coordinates)) {
      user.location = location;
    }
    if (bankName) user.bankName = bankName;
    if (accountNumber) user.accountNumber = accountNumber;
    if (accountName) user.accountName = accountName;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        storePhone: user.storePhone,
        storeAddress: user.storeAddress,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        accountName: user.accountName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Vendor Payment Credentials
router.put("/vendor-profile/payment", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Tidak ada token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const { midtransClientKey, midtransServerKey } = req.body;

    user.midtransClientKey = midtransClientKey;
    user.midtransServerKey = midtransServerKey;

    await user.save();

    res.json({ message: "Payment credentials updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Vendor WhatsApp Credentials
router.put("/vendor-profile/whatsapp", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Tidak ada token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Akses ditolak" });
    }

    const { waPhoneNumberId, waApiKey } = req.body;

    user.waPhoneNumberId = waPhoneNumberId;
    user.waApiKey = waApiKey;

    await user.save();

    res.json({ message: "WhatsApp credentials updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
