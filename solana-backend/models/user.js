/*const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  publicKey: { type: String, required: true, unique: true },
  referredBy: { type: String, default: null }, // Người đã giới thiệu
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
*/
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    publicKey: { type: String, required: true, unique: true },
	referralCode: { type: String, required: true, unique: true }, // 🔥 Thêm dòng này
    referredBy: { type: String, default: null },
	referredWallet: { type: String, default: null },
    vipLevel: { type: String, enum: ["vip0", "vip1", "vip2", "vip3", "vip4", "vip5"], default: "vip0" },
    claimedReferrals: { type: Number, default: 0 }, // Đếm số ví đã claim
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

