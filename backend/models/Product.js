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
    vendorAddress: {
      type: String,
    },
    vendorAddressDetail: {
      street: String,
      district: String,
      city: String,
      province: String,
      postalCode: String,
    },
    vendorLocation: {
      type: {
        type: String,
        enum: ["Point"],
        // default: "Point", // REMOVE DEFAULT to prevent invalid GeoJSON (Point without coords)
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
      },
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
productSchema.index({ "vendorAddressDetail.city": 1 });
productSchema.index({ vendorLocation: "2dsphere" });

module.exports = mongoose.model("Product", productSchema);
