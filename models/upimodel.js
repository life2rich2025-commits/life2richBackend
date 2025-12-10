const mongoose = require("mongoose");

const UpiModel = new mongoose.Schema({
  upiid: { type: String, required: true },
  bussinessname:{ type: String, required: true },
  status:{ type: Boolean, default: false,required: true },
}, { timestamps: true });

module.exports = mongoose.model("UpiModel", UpiModel);
