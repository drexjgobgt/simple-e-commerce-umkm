const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/300",
    },
    category: {
      type: String,
      enum: ["Gas 3kg", "Gas 5kg", "Gas 12kg", "Kompor", "Selang", "Regulator"],
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    unit: {
      type: String,
      default: "unit",
    },
    // VENDOR INFORMATION
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    vendorStoreName: {
      type: String,
      required: true,
    },
    vendorPhone: {
      type: String,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index untuk query per vendor
productSchema.index({ vendor: 1 });
productSchema.index({ isActive: 1 });

module.exports = mongoose.model("Product", productSchema);
