const midtransClient = require("midtrans-client");

// Validasi environment variables
if (!process.env.MIDTRANS_SERVER_KEY) {
  throw new Error("❌ MIDTRANS_SERVER_KEY not found in .env file!");
}

if (!process.env.MIDTRANS_CLIENT_KEY) {
  throw new Error("❌ MIDTRANS_CLIENT_KEY not found in .env file!");
}

// Initialize Snap
let snap;
try {
  snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY.trim(), // Trim whitespace
    clientKey: process.env.MIDTRANS_CLIENT_KEY.trim(), // Trim whitespace
  });
  console.log("✅ Midtrans Snap initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Midtrans Snap:", error.message);
  throw error;
}

module.exports = snap;
