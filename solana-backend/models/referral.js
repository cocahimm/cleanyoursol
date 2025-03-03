const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  referralCode: { type: String, required: true, unique: true },
  fullPublicKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Referral", referralSchema);
