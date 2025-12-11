const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      postalCode: String,
      province: String,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        price: Number,
        quantity: {
          type: Number,
          required: true,
        },
        // VENDOR INFO PER ITEM
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        vendorStoreName: String,
      vendorPhone: String,
        vendorAddress: String,
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
          },
          coordinates: [Number], // [lng, lat]
        },
        vendorAmount: Number, // Amount yang masuk ke vendor ini
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["Transfer Bank", "COD", "E-Wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    // Inventory guard to avoid double adjustments
    stockAdjusted: {
      type: Boolean,
      default: false,
    },
    notes: String,
    // SPLIT PAYMENT INFO
    vendorPayments: [
      {
        vendor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        vendorStoreName: String,
        amount: Number,
        paymentStatus: {
          type: String,
          enum: ["pending", "paid"],
          default: "pending",
        },
        paidAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index untuk query
orderSchema.index({ customer: 1 });
orderSchema.index({ "items.vendor": 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, customer: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, customer: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
