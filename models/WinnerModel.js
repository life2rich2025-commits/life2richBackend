const mongoose = require("mongoose");

const WinnerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  voucherId: { type: String, required: true },
  winnerAmount: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Winner", WinnerSchema);
