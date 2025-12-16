const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },
    // Vendor/Toko Information (untuk admin)
    storeName: {
      type: String,
      required: function () {
        return this.role === "admin";
      },
    },
    storeDescription: {
      type: String,
    },
    storePhone: {
      type: String,
    },
    storeAddress: {
      type: String,
    },
    storeAddressDetail: {
      street: String,
      district: String,
      city: String,
      province: String,
      postalCode: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined,
      },
    },
    // Vendor-specific WhatsApp Cloud API (opsional)
    waPhoneNumberId: {
      type: String,
    },
    waApiKey: {
      type: String,
    },
    // Payment Information (untuk admin)
    bankName: {
      type: String,
    },
    accountNumber: {
      type: String,
    },
    accountName: {
      type: String,
    },
    // Midtrans Merchant (opsional - untuk direct payment)
    midtransClientKey: {
      type: String,
    },
    midtransServerKey: {
      type: String,
    },
    // QRIS Manual Payment
    qrisImage: {
      type: String, // URL to uploaded image
    },
    // Status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password sebelum save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method untuk compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Geo index for vendor location
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
