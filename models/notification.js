const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
 userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
  
  title: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, required: true },
  readAt: { type: Date }, // optional timestamp
  status: { type: Boolean, default: true } // optional
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);
