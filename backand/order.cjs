const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  customer: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  houseNo: { type: String, default: "" },
  sectorColony: { type: String, default: "" },
  district: { type: String, default: "" },
  state: { type: String, default: "" },
  phone: { type: String, default: "" },
  items: [{
    id: String,
    name: String,
    quantity: Number,
    price: Number,
  }],
  totalUSD: { type: Number, required: true },
  totalINR: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  status: { type: String, default: "Processing" },
  qrCode: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
