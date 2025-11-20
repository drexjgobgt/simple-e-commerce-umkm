const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { authMiddleware, adminMiddleware } = require("../middleware/auth");

// Setup multer untuk memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("File harus berupa gambar!"), false);
    }
  },
});

// Upload image to Cloudinary
router.post(
  "/image",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ message: "Tidak ada file yang diupload" });
      }

      // Upload ke Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "toko-gas-products",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file.buffer);
      });

      res.json({
        message: "Upload berhasil",
        url: result.secure_url,
        public_id: result.public_id,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        message: "Gagal upload gambar",
        error: error.message,
      });
    }
  }
);

// Delete image from Cloudinary
router.delete(
  "/image/:publicId",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      // Public ID biasanya dalam format: toko-gas-products/abc123
      const publicId = req.params.publicId.replace(/--/g, "/");
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result === "ok") {
        res.json({ message: "Gambar berhasil dihapus" });
      } else {
        res.status(404).json({ message: "Gambar tidak ditemukan" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({
        message: "Gagal hapus gambar",
        error: error.message,
      });
    }
  }
);

module.exports = router;
