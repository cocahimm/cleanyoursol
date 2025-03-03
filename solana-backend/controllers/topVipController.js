// controllers/topVipController.js
const UserModel = require("../models/user");

/**
 * GET /api/topvip
 * Trả về danh sách 50 người dùng có claimedReferrals cao nhất.
 * Kết quả: { success: true, topUsers: [ { publicKey, vipLevel, claimedReferrals }, ... ] }
 */
const getTopVipUsers = async (req, res) => {
  try {
    // Sắp xếp theo claimedReferrals giảm dần, giới hạn 50 người dùng
    const topUsers = await UserModel.find({})
      .sort({ claimedReferrals: -1 })
      .limit(50)
      .select("publicKey vipLevel claimedReferrals -_id"); // Chỉ lấy 3 trường

    res.json({ success: true, topUsers });
  } catch (error) {
    console.error("Error fetching top VIP users:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getTopVipUsers };
