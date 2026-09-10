const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Register = require("./register.cjs");
const Product = require("./product.cjs");

const server = express();
const port = Number(process.env.PORT || 5000);
const adminEmail = process.env.ADMIN_EMAIL || "owner@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || "change-this-password";
const tokenSecret = process.env.ADMIN_TOKEN_SECRET || "local-development-token-secret";

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/register")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection failed", error.message));

server.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
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
    const { name, username, email, password, phone } = req.body;
    const existingUser = await Register.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(409).json({ message: "Email or username already registered" });
    const passwordHash = await bcrypt.hash(password, 10);
    await Register.create({ name, username, email, password: passwordHash, phone, role: "customer" });
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    res.status(400).json({ message: "Could not register this account", error: error.message });
  }
});

server.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Register.findOne({ email }).lean();
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    const { password: storedPassword, ...safeUser } = user;
    res.json({ message: "Login successful", user: safeUser });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
});

server.post("/admin/login", (req, res) => {
  const { email, password } = req.body;
  if (email !== adminEmail || password !== adminPassword) return res.status(401).json({ message: "Only the authorized admin can enter this panel" });
  res.json({ token: createAdminToken(), admin: { email: adminEmail, role: "admin" } });
});

server.get("/admin/users", requireAdmin, async (req, res) => {
  const users = await Register.find({}, "name username email phone createdAt").sort({ createdAt: -1 }).lean();
  res.json({ users });
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

server.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Could not delete product", error: error.message });
  }
});

server.listen(port, () => console.log(`API server started on port ${port}`));
