const User = require("../models/user");  // ✅ Đảm bảo đã import model User
const Ledger = require("../models/ledger");  // Model Ledger để lưu lịch sử giao dịch

const VIP_REQUIREMENTS = {
    vip0: 1,     // 1 claimed referral để lên vip1
    vip1: 101,   // 100 claimed referrals để lên vip2
    vip2: 1101,  // 1000 claimed referrals để lên vip3
    vip3: 11101,  // 5000 claimed referrals để lên vip4
    vip4: 31101, // 10000 claimed referrals để lên vip5
    vip5: null   // vip5 là cấp tối đa
};

const upgradeVipLevel = async (user) => {
    const currentLevel = user.vipLevel || "vip0";
    const nextLevel = Object.keys(VIP_REQUIREMENTS).find((vip) => vip === currentLevel) || "vip0";
    
    if (VIP_REQUIREMENTS[nextLevel] !== null && user.claimedReferrals >= VIP_REQUIREMENTS[nextLevel]) {
        const newVipLevel = `vip${parseInt(currentLevel.replace("vip", "")) + 1}`;
        await User.updateOne({ publicKey: user.publicKey }, { $set: { vipLevel: newVipLevel } });
        console.log(`🔥 ${user.publicKey} đã lên cấp ${newVipLevel}!`);
    }
};
// ✅ Lấy lịch sử claim của một người dùng
/*
exports.getUserLedgerHistory = async (req, res) => {
    try {
        const { publicKey } = req.params;
        if (!publicKey) {
            return res.status(400).json({ error: "Missing publicKey parameter." });
        }

        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;

        console.log(`📢 Fetching claim history for user: ${publicKey}, limit: ${limit}, offset: ${offset}`);

        const history = await Ledger.find({ publicKey })
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit);

        res.json({ success: true, data: history });
    } catch (error) {
        console.error("❌ Error fetching user claim history:", error);
        res.status(500).json({ success: false, error: error.toString() });
    }
};
*/
exports.getUserLedgerHistory = async (req, res) => {
    try {
        const { publicKey } = req.params;
        const limit = parseInt(req.query.limit) || 5; // Mặc định lấy 5 giao dịch
        const offset = parseInt(req.query.offset) || 0;

        const history = await Ledger.find({ publicKey })
            .sort({ timestamp: -1 }) // Sắp xếp mới nhất trước
            .skip(offset)
            .limit(limit);

        const totalCount = await Ledger.countDocuments({ publicKey });

        res.json({ history, totalCount });
    } catch (error) {
        console.error("❌ Error fetching user claim history:", error);
        res.status(500).json({ error: error.toString() });
    }
};

/*
// ✅ Lấy lịch sử claim của toàn hệ thống
exports.getAllLedgerHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;

        console.log(`📢 Fetching system-wide claim history, limit: ${limit}, offset: ${offset}`);

        const history = await Ledger.find()
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit);

        res.json({ success: true, data: history });
    } catch (error) {
       console.error("❌ Error fetching system claim history:", error);
        res.status(500).json({ success: false, error: error.toString() });
    }
};
*/

exports.getAllLedgerHistory = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const offset = parseInt(req.query.offset) || 0;

        const history = await Ledger.find()
            .sort({ timestamp: -1 })
            .skip(offset)
            .limit(limit);

        const totalCount = await Ledger.countDocuments(); // Đếm tổng số giao dịch

        res.json({ history, totalCount });
    } catch (error) {
        console.error("❌ Error fetching system claim history:", error);
        res.status(500).json({ error: error.toString() });
    }
};

// ✅ Lưu giao dịch claim vào database
/*
exports.saveLedgerEntry = async (publicKey, tokenId, txHash, amount, referral) => {
    try {
        if (!publicKey || !tokenId || !txHash || amount === undefined) {
           console.error("❌ Invalid ledger entry data:", { publicKey, tokenId, txHash, amount, referral });
            return;
        }

        const newEntry = new Ledger({
            publicKey,
            tokenId,
            txHash,
            amount,
            referral: referral || null, // Nếu không có referral thì lưu là null
            timestamp: new Date(),
        });

        await newEntry.save();
        console.log("✅ Ledger entry saved:", newEntry);
    } catch (error) {
        console.error("❌ Error saving ledger entry:", error);
    }
};
*/
exports.saveLedgerEntry = async (publicKey, tokenId, txHash, amount, referral) => {
    try {
        const newEntry = new Ledger({
            publicKey,
            tokenId,
            txHash,
            amount,
            referral,
            timestamp: new Date(),
        });
        await newEntry.save();
        console.log("✅ Ledger entry saved:", newEntry);

        // 🔄 Cập nhật số referrals đã claim cho người giới thiệu (nếu có)
        
    } catch (error) {
        console.error("❌ Error saving ledger entry:", error);
    }
};




// API lấy tổng số tài khoản đã claim & tổng số SOL nhận được
exports.getClaimStats = async (req, res) => {
    try {
        // Đếm tổng số tài khoản đã claim (mỗi publicKey chỉ tính 1 lần)
        const uniqueAccounts = await Ledger.distinct("publicKey");
        const totalAccountsClaimed = uniqueAccounts.length;

        // Tính tổng số token đã claim
        const totalTokensClaimed = await Ledger.aggregate([
            {
                $group: {
                    _id: null,
                    totalTokens: { $sum: { $size: { $split: ["$tokenId", ","] } } } // Đếm số token
                }
            }
        ]);

        const totalTokens = totalTokensClaimed.length > 0 ? totalTokensClaimed[0].totalTokens : 0;
        const totalSOLReceived = (totalTokens * 0.0016)+125; // Tính số SOL nhận được

        res.json({ totalAccountsClaimed, totalSOLReceived });
    } catch (error) {
        console.error("❌ Error fetching claim stats:", error);
        res.status(500).json({ error: error.toString() });
    }
};
