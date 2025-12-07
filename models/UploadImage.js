const mongoose = require("mongoose");

const UploadImageScheme = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  imagename:{ type: String, required: true },
  tag: { type: String, required: true , default:'dashboard'},
  createdAt: { type: Date, default: Date.now },   // ✔ auto current time
  status: { type: Boolean, default: true } // optional
}, { timestamps: true });

module.exports = mongoose.model("UploadImageScheme", UploadImageScheme);
