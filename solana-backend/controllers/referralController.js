const User = require("../models/user");
const Referral = require("../models/referral");

// Lấy danh sách người dùng đã giới thiệu
exports.getMyReferrals = async (req, res) => {
  try {
    const referralCode = req.params.referralCode;
    const limit = parseInt(req.query.limit) || 5;
    const offset = parseInt(req.query.offset) || 0;

    // Tìm user đã đăng ký với referralCode này
    const referredUsers = await User.find({ referredBy: referralCode })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const totalCount = await User.countDocuments({ referredBy: referralCode });

    res.json({ success: true, totalCount, referredUsers });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};


// Tạo hoặc lấy referral link cho user
exports.getReferralLink = async (req, res) => {
  try {
    const { publicKey } = req.params;
    let referral = await Referral.findOne({ fullPublicKey: publicKey });

    if (!referral) {
      const referralCode = generateReferralCode(publicKey);
      referral = new Referral({ referralCode, fullPublicKey: publicKey });
      await referral.save();
    }

    res.json({ referralLink: `https://cleanyoursol.com/${referral.referralCode}` });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
};

// Hàm tạo mã referral từ publicKey
function generateReferralCode(publicKey) {
  return publicKey.slice(-8);
}
