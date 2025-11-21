const mongoose = require("mongoose");

const PaymentMethodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: ["bank", "upi"],
      required: true
    },

    // Bank details (only when type = bank)
    bankDetails: {
      accountHolder: { type: String },
      accountNumber: { type: String },
      ifsc: { type: String },
      bankName: { type: String }
    },

    // UPI details (only when type = upi)
    upiId: {
      type: String
    },

    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", PaymentMethodSchema);
