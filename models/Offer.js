const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  validTill: { type: Date, required: true },
  status: { type: Boolean, default: true } // optional
}, { timestamps: true });

module.exports = mongoose.model("Offer", OfferSchema);
