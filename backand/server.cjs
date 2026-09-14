const crypto = require("crypto");
const dns = require("dns");
const path = require("path");
require("dotenv").config();



const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Register = require("./register.cjs");
const Product = require("./product.cjs");
const Order = require("./order.cjs");

const server = express();
const port = Number(process.env.PORT || 5000);
const adminEmail = process.env.ADMIN_EMAIL || "owner@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";
const tokenSecret = process.env.ADMIN_TOKEN_SECRET || "local-development-token-secret";
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

const addProductImagesToOrders = async (orders) => {
  const products = await Product.find({}, "_id name image").lean();
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const productsByName = new Map(products.map((product) => [product.name.trim().toLowerCase(), product]));

  return orders.map((order) => ({
    ...order,
    items: (order.items || []).map((item) => {
      if (item.image) return item;
      const product = productsById.get(String(item.id)) || productsByName.get(String(item.name || "").trim().toLowerCase());
      return product?.image ? { ...item, image: product.image } : item;
    }),
  }));
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
    const order = await Order.create(req.body);
    res.status(201).json({ order });
  } catch (error) {
    res.status(400).json({ message: "Could not save order", error: error.message });
  }
});

server.get("/orders", async (req, res) => {
  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ message: "Email is required" });
    const orders = await Order.find({ email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } }).sort({ createdAt: -1 }).lean();
    res.json({ orders: await addProductImagesToOrders(orders) });
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
    res.json({ order: (await addProductImagesToOrders([order]))[0] });
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
  res.json({ orders: await addProductImagesToOrders(orders) });
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

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
} else {
  console.error("MongoDB connection skipped: set MONGODB_URI in backand/.env");
}

if (require.main === module) {
  server.listen(port, "0.0.0.0", () => {
    console.log(`API server running on port ${port}`);
  });
}

module.exports = server;

