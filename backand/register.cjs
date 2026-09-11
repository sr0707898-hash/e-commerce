const mongoose = require("mongoose");

const RegisterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["customer"],
    default: "customer"
  }
}, { timestamps: true });

const Register = mongoose.model("Register", RegisterSchema);
module.exports = Register;