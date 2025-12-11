const https = require("https");
const nodemailer = require("nodemailer");

const formatCurrency = (value) =>
  `Rp ${Number(value || 0).toLocaleString("id-ID")}`;

const buildReceiptText = (order) => {
  const lines = [];
  lines.push(`Struk Pesanan #${order._id}`);
  lines.push(`Nama: ${order.customerName}`);
  lines.push(`Telepon: ${order.phone}`);
  lines.push(
    `Alamat: ${order.address?.street || ""}, ${order.address?.city || ""}, ${
      order.address?.province || ""
    } ${order.address?.postalCode || ""}`
  );
  lines.push(`Metode Pembayaran: ${order.paymentMethod}`);
  lines.push("");
  lines.push("Item:");
  order.items.forEach((item) => {
    lines.push(
      `- ${item.name} x${item.quantity} @ ${formatCurrency(
        item.price
      )} = ${formatCurrency(item.price * item.quantity)}${
        item.vendorStoreName ? ` (🏪 ${item.vendorStoreName})` : ""
      }`
    );
  });
  lines.push("");
  lines.push(`Total: ${formatCurrency(order.totalAmount)}`);
  lines.push(`Status Pembayaran: ${order.paymentStatus}`);
  lines.push(`Status Pesanan: ${order.orderStatus}`);
  lines.push("");
  lines.push("Terima kasih telah berbelanja di UMKM GAS.");
  return lines.join("\n");
};

const buildVendorReceiptText = (order, vendorId) => {
  const lines = [];
  const vendorItems = order.items.filter(
    (i) => i.vendor && i.vendor.toString() === vendorId
  );
  if (vendorItems.length === 0) return null;
  const vendorName = vendorItems[0].vendorStoreName || "Vendor";

  lines.push(`Struk Vendor #${order._id}`);
  lines.push(`Toko: ${vendorName}`);
  lines.push(`Tanggal: ${new Date(order.createdAt).toLocaleString("id-ID")}`);
  lines.push("");
  lines.push("Item vendor:");
  let subtotal = 0;
  vendorItems.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    lines.push(
      `- ${item.name} x${item.quantity} @ ${formatCurrency(
        item.price
      )} = ${formatCurrency(lineTotal)}`
    );
  });
  lines.push("");
  lines.push(`Subtotal vendor: ${formatCurrency(subtotal)}`);
  lines.push(`Status Pembayaran: ${order.paymentStatus}`);
  lines.push(`Status Pesanan: ${order.orderStatus}`);
  lines.push("");
  lines.push("Harap siapkan pesanan sesuai detail di atas.");
  return lines.join("\n");
};

const createTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

const sendEmailReceipt = async (order) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.warn("⚠️  SMTP not configured, skip email receipt");
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const subject = `Struk Pesanan #${order._id}`;
  const text = buildReceiptText(order);

  await transporter.sendMail({
    from,
    to: order.email,
    subject,
    text,
  });
  console.log("✅ Email receipt sent to", order.email);
};

const postJson = (url, payload, headers = {}) =>
  new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = JSON.stringify(payload);
    const options = {
      method: "POST",
      hostname: parsed.hostname,
      path: parsed.pathname + (parsed.search || ""),
      port: parsed.port || 443,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(body);
        } else {
          reject(
            new Error(`WA API ${res.statusCode}: ${body || "No response body"}`)
          );
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });

const sendWhatsAppReceipt = async (order) => {
  const url = process.env.WA_WEBHOOK_URL;
  const apiKey = process.env.WA_API_KEY;
  const phoneId = process.env.WA_PHONE_NUMBER_ID;
  if (!url || !apiKey || !phoneId) {
    console.warn("⚠️  WA Cloud API not configured, skip WA receipt");
    return;
  }

  const text = buildReceiptText(order);
  await postJson(
    url.replace("<PHONE_NUMBER_ID>", phoneId),
    {
      messaging_product: "whatsapp",
      to: order.phone,
      type: "text",
      text: { body: text },
    },
    {
      Authorization: `Bearer ${apiKey}`,
    }
  );
  console.log("✅ WhatsApp receipt sent to", order.phone);
};

const sendWhatsAppVendorReceipts = async (order) => {
  // Global fallback
  const globalUrl = process.env.WA_WEBHOOK_URL;
  const globalApiKey = process.env.WA_API_KEY;
  const globalPhoneId = process.env.WA_PHONE_NUMBER_ID;
  if (!globalUrl || !globalApiKey || !globalPhoneId) {
    console.warn("⚠️  Global WA Cloud API not configured for vendor receipts");
  }

  // vendorId -> phone map (destination number)
  const vendors = new Map();
  // vendorId -> per-vendor credentials
  const vendorCreds = new Map();

  order.items.forEach((item) => {
    if (!item.vendor || !item.vendorPhone) return;
    vendors.set(item.vendor.toString(), item.vendorPhone);
    if (item.vendorCreds) {
      vendorCreds.set(item.vendor.toString(), item.vendorCreds);
    }
  });

  for (const [vendorId, phone] of vendors.entries()) {
    const text = buildVendorReceiptText(order, vendorId);
    if (!text) continue;

    // pilih kredensial: vendor-specific > global
    const creds = vendorCreds.get(vendorId);
    const url = creds?.waWebhookUrl || globalUrl;
    const apiKey = creds?.waApiKey || globalApiKey;
    const phoneId = creds?.waPhoneNumberId || globalPhoneId;
    if (!url || !apiKey || !phoneId) {
      console.warn(
        `⚠️  WA creds missing for vendor ${vendorId}, skip vendor receipt`
      );
      continue;
    }

    try {
      await postJson(
        url.replace("<PHONE_NUMBER_ID>", phoneId),
        {
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: text },
        },
        { Authorization: `Bearer ${apiKey}` }
      );
      console.log("✅ WA vendor receipt sent to", phone);
    } catch (err) {
      console.error("❌ Failed WA vendor receipt:", err.message);
    }
  }
};

const sendReceipts = async (order) => {
  try {
    await Promise.all([
      sendEmailReceipt(order),
      sendWhatsAppReceipt(order),
      sendWhatsAppVendorReceipts(order),
    ]);
  } catch (err) {
    console.error("❌ Failed sending receipt:", err.message);
  }
};

module.exports = {
  sendReceipts,
  buildReceiptText,
};
