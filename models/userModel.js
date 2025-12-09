const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userName: { type: String, required: true, unique: true},
  email: { type: String, required: true},
  password: { type: String, required: true },
  confirmPassword: { type: String, required: false },
  phoneNumber: { type: String, required: true },
  profileImageUrl: { type: String, required: false },
  ewalletAmount: { type: String, required: false },
  rewards: { type: String, required: false },
  referral: { type: String, required: false },
  referralCode: { type: String, required: false },
  frdReferralCode: { type: String, required: false }
});

userSchema.virtual("paymentMethod", {
  ref: "PaymentMethod",
  localField: "_id",
  foreignField: "userId"
});

userSchema.set("toObject", { virtuals: true });
userSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("User", userSchema);
