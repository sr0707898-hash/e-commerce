const crypto = require("crypto");
const dns = require("dns");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Razorpay = require("razorpay");
const Register = require("./register.cjs");
const Product = require("./product.cjs");
const Order = require("./order.cjs");
const fallbackProductPrices = require("./fallback-product-prices.json");

const server = express();
const port = Number(process.env.PORT || 5000);
const usdToInr = Number(process.env.USD_TO_INR || 83);
const sanitizeEnv = (value) => String(value ?? "").trim().replace(/^['"]|['"]$/g, "");
const adminEmail = sanitizeEnv(process.env.ADMIN_EMAIL || "owner@example.com");
const adminPassword = sanitizeEnv(process.env.ADMIN_PASSWORD || "change-this-password");
const tokenSecret = sanitizeEnv(process.env.ADMIN_TOKEN_SECRET || "local-development-token-secret");
const razorpayKeyId = sanitizeEnv(process.env.RAZORPAY_KEY_ID);
const razorpayKeySecret = sanitizeEnv(process.env.RAZORPAY_KEY_SECRET);
const razorpay = razorpayKeyId && razorpayKeySecret
  ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })
  : null;
dns.setServers([
  '1.1.1.1', // Cloudflare
  '8.8.8.8'  // Google
]);



server.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

const createAdminToken = () => {
  const payload = Buffer.from(JSON.stringify({ email: adminEmail, role: "admin", exp: Date.now() + 1000 * 60 * 60 * 8 })).toString("base64url");
  const signature = crypto.createHmac("sha256", tokenSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const normalizeOrderRecord = async (source) => {
  if (!source || !Array.isArray(source.items) || source.items.length === 0) {
    throw new Error("Order must contain at least one product");
  }

  const items = [];
  for (const item of source.items) {
    const productId = String(item.id || "");
    let product;

    if (/^\d+$/.test(productId)) {
      product = fallbackProductPrices[productId];
      if (!product || product.name.toLowerCase() !== String(item.name || "").trim().toLowerCase()) {
        throw new Error("A product in this order is no longer available");
      }
    } else if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId).lean();
      if (!product) throw new Error("A product in this order is no longer available");
    } else {
      throw new Error("Invalid product in order");
    }

    const quantity = Number(item.quantity);
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Product quantity is invalid");
    }
    if (product.stock !== undefined && product.stock < quantity) {
      throw new Error(`${product.name} does not have enough stock`);
    }

    items.push({
      id: productId,
      name: product.name,
      image: String(item.image || product.image || ""),
      quantity,
      price: Number(product.price),
    });
  }

  const totalUSD = Number(items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2));
  const totalINR = Number((totalUSD * usdToInr).toFixed(2));
  const submittedUSD = Number(source.totalUSD);
  const submittedINR = Number(source.totalINR);
  if (
    !Number.isFinite(submittedUSD)
    || !Number.isFinite(submittedINR)
    || !["UPI", "Credit/Debit Card", "Cash on Delivery"].includes(source.paymentMethod)
    || Math.abs(submittedUSD - totalUSD) > 0.01
    || Math.abs(submittedINR - totalINR) > 0.01
  ) {
    throw new Error("Cart prices changed. Refresh the cart and try again");
  }

  const customer = String(source.customer || "").trim();
  const email = String(source.email || "").trim().toLowerCase();
  const address = String(source.address || "").trim();
  if (!customer || !email || !address) throw new Error("Customer and delivery details are required");

  return {
    id: String(source.id || ""),
    customer,
    email,
    address,
    houseNo: String(source.houseNo || ""),
    sectorColony: String(source.sectorColony || ""),
    district: String(source.district || ""),
    state: String(source.state || ""),
    phone: String(source.phone || ""),
    items,
    totalUSD,
    totalINR,
    paymentMethod: String(source.paymentMethod || ""),
    paymentStatus: "Pending",
    status: "Processing",
    createdAt: source.createdAt || new Date().toISOString(),
    qrCode: "",
  };
};

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Admin login required" });
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return res.status(401).json({ message: "Invalid admin session" });
  const expectedSignature = crypto.createHmac("sha256", tokenSecret).update(payload).digest("base64url");
  const isValid = signature.length === expectedSignature.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  if (!isValid) return res.status(401).json({ message: "Invalid admin session" });
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (session.role !== "admin" || session.email !== adminEmail || session.exp < Date.now()) return res.status(401).json({ message: "Admin session expired" });
    req.admin = session;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid admin session" });
  }
};

server.get("/", (req, res) => res.send("Grocify API is working"));

server.get("/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Could not load products", error: error.message });
  }
});

server.get("/store/progress", async (req, res) => {
  try {
    const now = new Date();
    const trendStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const [products, orders, deliveredOrders, customers, monthlyOrders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: { $regex: /^delivered$/i } }),
      Register.countDocuments(),
      Order.aggregate([
        { $match: { createdAt: { $gte: trendStart } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            orders: { $sum: 1 },
            deliveredOrders: {
              $sum: {
                $cond: [
                  { $eq: [{ $toLower: { $ifNull: ["$status", ""] } }, "delivered"] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);
    res.json({ products, orders, deliveredOrders, customers, monthlyOrders });
  } catch (error) {
    res.status(500).json({ message: "Could not load store progress", error: error.message });
  }
});

server.post("/Register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const phone = String(req.body.phone || "").trim();
    if (!name || !username || !email || !password || !phone) {
      return res.status(400).json({ message: "All registration fields are required" });
    }
    const existingUser = await Register.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ message: "Email or username already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    await Register.create({ name, username, email, password: passwordHash, phone, role: "customer" });
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Registration failed", error.message);
    res.status(500).json({ message: "Could not register this account", error: error.message });
  }
});

server.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await Register.findOne({ email }).lean();
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    const { password: storedPassword, ...safeUser } = user;
    res.json({ message: "Login successful", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

server.post("/orders", async (req, res) => {
  try {
    if (req.body.paymentMethod !== "Cash on Delivery") {
      return res.status(400).json({ message: "Online orders must be completed through verified checkout" });
    }
    const orderRecord = await normalizeOrderRecord(req.body);
    const order = await Order.create(orderRecord);
    res.status(201).json({ order });
  } catch (error) {
    res.status(400).json({ message: error.message || "Could not save order" });
  }
});

server.get("/payments/razorpay/config", (req, res) => {
  res.json({ onlinePaymentsEnabled: Boolean(razorpay) });
});

server.post("/payments/razorpay/order", async (req, res) => {
  if (!razorpay) return res.status(503).json({ message: "Razorpay is not configured on the server" });

  if (!["UPI", "Credit/Debit Card"].includes(req.body.orderRecord?.paymentMethod)) {
    return res.status(400).json({ message: "Choose UPI or card for online payment" });
  }

  let orderRecord;
  try {
    orderRecord = await normalizeOrderRecord(req.body.orderRecord);
    if (!orderRecord.id || orderRecord.id.length > 40) throw new Error("Invalid order reference");
  } catch (error) {
    return res.status(400).json({ message: error.message || "Order details are invalid" });
  }

  const amount = Math.round(orderRecord.totalINR * 100);
  const orderHash = crypto.createHash("sha256").update(JSON.stringify(orderRecord)).digest("hex");

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: orderRecord.id,
      notes: { appOrderId: orderRecord.id, orderHash },
    });
    res.status(201).json({
      keyId: razorpayKeyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderRecord,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", {
      status: error.statusCode || error.status || "unknown",
      code: error.error?.code || "unknown",
      reason: error.error?.description || error.message || "Unknown provider error",
    });
    res.status(502).json({ message: "Razorpay checkout could not start. Check the backend Razorpay API keys and try again." });
  }
});

server.post("/payments/razorpay/verify", async (req, res) => {
  if (!razorpay) return res.status(503).json({ message: "Razorpay is not configured on the server" });

  const { razorpay_order_id: razorpayOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature, orderRecord } = req.body;
  if (!razorpayOrderId || !paymentId || !signature || !orderRecord?.id) {
    return res.status(400).json({ message: "Payment verification details are incomplete" });
  }

  let normalizedOrder;
  try {
    normalizedOrder = await normalizeOrderRecord(orderRecord);
  } catch (error) {
    return res.status(400).json({ message: error.message || "Order details are invalid" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", razorpayKeySecret)
    .update(`${razorpayOrderId}|${paymentId}`)
    .digest("hex");
  const receivedSignature = Buffer.from(String(signature));
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (receivedSignature.length !== expectedSignatureBuffer.length || !crypto.timingSafeEqual(receivedSignature, expectedSignatureBuffer)) {
    return res.status(400).json({ message: "Payment signature verification failed" });
  }

  try {
    const razorpayOrder = await razorpay.orders.fetch(razorpayOrderId);
    const orderHash = crypto.createHash("sha256").update(JSON.stringify(normalizedOrder)).digest("hex");
    const expectedAmount = Math.round(normalizedOrder.totalINR * 100);
    if (
      razorpayOrder.amount !== expectedAmount
      || razorpayOrder.notes?.appOrderId !== normalizedOrder.id
      || razorpayOrder.notes?.orderHash !== orderHash
    ) {
      return res.status(400).json({ message: "Payment order does not match the verified cart" });
    }

    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.order_id !== razorpayOrderId || payment.amount !== expectedAmount) {
      return res.status(400).json({ message: "Payment details do not match this order" });
    }

    const capturedPayment = payment.status === "authorized"
      ? await razorpay.payments.capture(paymentId, payment.amount, payment.currency)
      : payment;
    if (capturedPayment.status !== "captured") {
      return res.status(409).json({ message: "Payment has not been captured yet" });
    }

    const existingOrder = await Order.findOne({ id: normalizedOrder.id }).lean();
    if (existingOrder) {
      if (existingOrder.paymentStatus === "Paid" && existingOrder.paymentReference === paymentId) {
        return res.json({ order: existingOrder });
      }
      return res.status(409).json({ message: "This order has already been submitted" });
    }

    const order = await Order.create({
      ...normalizedOrder,
      paymentMethod: capturedPayment.method === "upi" ? "UPI" : "Credit/Debit Card",
      paymentStatus: "Paid",
      paymentReference: paymentId,
      status: "Processing",
      qrCode: "",
    });
    res.status(201).json({ order });
  } catch (error) {
    console.error("Razorpay payment verification failed:", error.message);
    res.status(502).json({ message: "Could not verify payment with Razorpay" });
  }
});

server.get("/orders", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });
    const orders = await Order.find({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } }).sort({ createdAt: -1 }).lean();
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Could not load orders", error: error.message });
  }
});

server.get("/orders/:id", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });
    const order = await Order.findOne({ id: req.params.id, email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } }).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Could not load order", error: error.message });
  }
});

server.post("/admin/login", (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "").trim();
  if (email !== adminEmail.trim().toLowerCase() || password !== adminPassword.trim()) {
    return res.status(401).json({ message: "Only the authorized admin can enter this panel" });
  }
  res.json({ token: createAdminToken(), admin: { email: adminEmail, role: "admin" } });
});

server.get("/admin/users", requireAdmin, async (req, res) => {
  const users = await Register.find({}, "name username email phone createdAt").sort({ createdAt: -1 }).lean();
  res.json({ users });
});

server.get("/admin/orders", requireAdmin, async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  res.json({ orders });
});

server.patch("/admin/orders/:id/payment-status", requireAdmin, async (req, res) => {
  const paymentStatus = String(req.body.paymentStatus || "");
  if (!["Pending", "Paid"].includes(paymentStatus)) {
    return res.status(400).json({ message: "Payment status must be Pending or Paid" });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: { paymentStatus } },
      { new: true, runValidators: true }
    ).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    res.status(400).json({ message: "Could not update payment status", error: error.message });
  }
});

server.delete("/admin/orders/:id", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete order", error: error.message });
  }
});

server.get("/admin/products", requireAdmin, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.json({ products });
});

server.post("/admin/products", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, stock, image } = req.body;
    const product = await Product.create({ name, category, price, stock, image });
    res.status(201).json({ product });
  } catch (error) {
    res.status(400).json({ message: "Could not add product", error: error.message });
  }
});

server.put("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const { name, category, price, stock, image } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price, stock, image },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (error) {
    res.status(400).json({ message: "Could not update product", error: error.message });
  }
});

server.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete product", error: error.message });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

if (require.main === module) {
  server.listen(port, "0.0.0.0", () => {
    console.log(`API server running on port ${port}`);
  });
}

module.exports = server;

