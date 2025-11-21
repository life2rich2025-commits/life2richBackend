const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },      // 10, 50, 100
  payText: { type: String, required: true, unique: true },     // Pay ₹10 Rupee
  expiresAt: { type: Date, required: true },
  isScratched: { type: Boolean, default: false },
  winAmount: { type: Number, default: 0 },       // After scratch result
  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Voucher", voucherSchema);
