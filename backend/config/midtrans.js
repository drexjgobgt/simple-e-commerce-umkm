const midtransClient = require("midtrans-client");

// Debug logging
console.log("🔑 Initializing Midtrans Configuration...");
console.log("- Server Key exists:", !!process.env.MIDTRANS_SERVER_KEY);
console.log(
  "- Server Key preview:",
  process.env.MIDTRANS_SERVER_KEY?.substring(0, 25) + "..."
);
console.log("- Client Key exists:", !!process.env.MIDTRANS_CLIENT_KEY);
console.log(
  "- Client Key preview:",
  process.env.MIDTRANS_CLIENT_KEY?.substring(0, 25) + "..."
);
console.log("- Is Production:", process.env.MIDTRANS_IS_PRODUCTION);

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
