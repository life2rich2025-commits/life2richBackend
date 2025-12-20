const mongoose = require("mongoose");

const referralCodeScheme = new mongoose.Schema({
  userId: { type:String , required: false },
  usedUserId: { type:String,required: false },
  referralCode: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});1

const referralCode = mongoose.model("referralCodeScheme", referralCodeScheme);

module.exports = referralCode;
