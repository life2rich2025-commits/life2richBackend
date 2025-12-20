const mongoose = require("mongoose");

const referralCodeScheme = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  usedUserId: { type: mongoose.Schema.Types.ObjectId,required: false },
  refferalCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});1

const referralCode = mongoose.model("referralCodeScheme", referralCodeScheme);

module.exports = referralCode;
