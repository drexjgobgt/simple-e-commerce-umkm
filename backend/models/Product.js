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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
