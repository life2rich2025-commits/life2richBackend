const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categoryAmount: { type: String, required: true },
  voucherId: { type: String, unique: true }, // auto-generated
  isScratched: { type: Boolean, default: false },
  winAmount: { type: Number, default: 0 },
  position: { type: Number, default: 0 }, 
  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active"
  },
  createdAt: { type: Date, default: Date.now }
});


const Voucher = mongoose.model("Voucher", voucherSchema);

module.exports = Voucher;
