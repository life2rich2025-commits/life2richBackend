const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    Description:{ type: String, required: true },

    method: {
      type: String,
      enum: ["PhonePe", "GPay", "Paytm", "Other"],
      required: true
    },

    utrNumber: { type: String, required: true },

    amount: { type: Number, required: true },

    orderId: { type: String, unique: true },  
    
    isReferralStaus: {type: Boolean, default: false},

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
