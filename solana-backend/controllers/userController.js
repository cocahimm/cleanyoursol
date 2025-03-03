const User = require("../models/user");
const Referral = require("../models/referral");
/* old
exports.register = async (req, res) => {
    try {
        const { publicKey, referredBy } = req.body;

        console.log(`🔍 Received referralCode from frontend: ${referredBy}`);

        // Kiểm tra nếu user đã tồn tại
        const existingUser = await User.findOne({ publicKey });
        if (existingUser) {
            return res.json({ success: true, user: existingUser });
        }

        let validReferral = null;
        if (referredBy) {
            console.log(`🔍 Checking referral code in MongoDB: ${referredBy}`);
            const referralExists = await Referral.findOne({ referralCode: referredBy });

            if (referralExists) {
                validReferral = referredBy;
                console.log(`✅ Valid referral found: ${validReferral}`);
            } else {
                console.warn(`❌ Invalid referral code provided: ${referredBy}`);
            }
        }

        const newUser = new User({ publicKey, referredBy: validReferral });
        await newUser.save();

        console.log("✅ New user registered:", newUser);
        res.json({ success: true, user: newUser });
    } catch (error) {
        console.error("❌ Error in register:", error);
        res.status(500).json({ error: error.toString() });
    }
};
*/

// cập nhập ref mới cho null

//Thêm bảng quy tắc VIP
const VIP_REQUIREMENTS = {
    vip1: 1,     // 1 người đã claim
    vip2: 101,   // 100 người đã claim
    vip3: 1101,  // 1000 người đã claim
    vip4: 11101,  // 5000 người đã claim
    vip5: 31101  // 10000 người đã claim
};

// 📌 Hàm nâng cấp VIP cho user
exports.upgradeUserVip = async (req, res) => {
    try {
        const { publicKey, newVipLevel } = req.body;

        if (!publicKey || !newVipLevel) {
            return res.status(400).json({ error: "Missing publicKey or newVipLevel" });
        }

        const user = await User.findOne({ publicKey });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // 🏆 Kiểm tra số referrals đã claim
        const currentVip = user.vipLevel || "vip0";
        const requiredForNextVip = VIP_REQUIREMENTS[currentVip];

        if (user.claimedReferrals < requiredForNextVip) {
            return res.status(400).json({ error: "Not enough claimed referrals to upgrade" });
        }

        // 📌 Chỉ nâng cấp nếu chưa đạt cấp cao hơn
        const validVipLevels = ["vip0", "vip1", "vip2", "vip3", "vip4", "vip5"];
        const currentVipIndex = validVipLevels.indexOf(currentVip);
        const newVipIndex = validVipLevels.indexOf(newVipLevel);

        if (newVipIndex <= currentVipIndex) {
            return res.status(400).json({ error: "Already at this or higher VIP level" });
        }

        // ✅ Cập nhật VIP level
        user.vipLevel = newVipLevel;
        await user.save();

        console.log(`✅ ${publicKey} upgraded to ${newVipLevel}`);
        res.json({ success: true, newVipLevel });

    } catch (error) {
        console.error("❌ Error upgrading VIP:", error);
        res.status(500).json({ error: error.toString() });
    }
};

exports.getUserByPublicKey = async (req, res) => {
    try {
        const { publicKey } = req.params;
        const user = await User.findOne({ publicKey });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



/*
exports.registerUser = async (req, res) => {
    try {
        const { publicKey, referredBy } = req.body;

        // Kiểm tra xem user đã tồn tại chưa
        let user = await User.findOne({ publicKey });

        if (user) {
            // Nếu user đã tồn tại nhưng chưa có referral → Cập nhật referral mới
            if (!user.referredBy && referredBy) {
                user.referredBy = referredBy;
                await user.save();
                console.log(`✅ Updated referral for user: ${publicKey}, referred by: ${referredBy}`);
            }
            return res.json({ success: true, user });
        }

        // Nếu user chưa tồn tại, tạo mới
        user = new User({ publicKey, referredBy: referredBy || null });
        await user.save();
        console.log("✅ New user registered:", user);

        res.json({ success: true, user });
    } catch (error) {
        console.error("❌ Error in registerUser:", error);
        res.status(500).json({ error: error.toString() });
    }
};
*/

exports.registerUser = async (req, res) => {
    try {
        const { publicKey, referredBy } = req.body;

        if (!publicKey) {
            return res.status(400).json({ error: "Missing publicKey" });
        }

        // 🔹 Kiểm tra xem user đã tồn tại chưa
        let user = await User.findOne({ publicKey });

        if (user) {
            //console.log(`✅ User ${publicKey} already exists.`);
            return res.json({ success: true, message: "User already registered", user });
        }

        // 🔹 Kiểm tra mã giới thiệu hợp lệ
        let referrer = null;
        let referrerWallet = null;

        if (referredBy) {
            referrer = await User.findOne({ referralCode: referredBy });

            if (!referrer) {
                console.warn(`⚠️ Invalid referral code: ${referredBy}`);
                return res.status(400).json({ error: "Invalid referral code" });
            }

            referrerWallet = referrer.publicKey;
        }

        // 🔹 Tạo referralCode từ publicKey
        const referralCode = generateReferralCode(publicKey);
        if (!referralCode) {
            return res.status(500).json({ error: "Failed to generate referral code" });
        }

        // 🔹 Tạo user mới
        user = new User({
            publicKey,
            referralCode,
            referredBy: referrer ? referrer.referralCode : null, // Lưu mã referrer nếu có
            referredWallet: referrerWallet, // Lưu publicKey của referrer
            claimedReferrals: 0,
            vipLevel: "vip0",
            createdAt: new Date(),
        });

        await user.save();
	console.log(`🎉 New user registered: ${publicKey} | Referral : ${referredBy} `);
		//console.log("✅ info:", user);

        res.json({ success: true, message: "User registered successfully", user });
    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// 🔹 Hàm tạo mã giới thiệu ngẫu nhiên (8 ký tự)


function generateReferralCode(publicKey) {
    if (!publicKey || typeof publicKey !== "string") {
        console.error("❌ Error: Invalid publicKey for generating referral code", publicKey);
        return null; // Tránh lỗi khi `publicKey` không hợp lệ
    }
    return publicKey.slice(-8);
}





// 📌 Lấy 5 user mới nhất
/*exports.getLatestUsers = async (req, res) => {
    try {
        const latestUsers = await User.find().sort({ createdAt: -1 }).limit(5);
        res.json({ success: true, latestUsers });
    } catch (error) {
        console.error("❌ Error fetching latest users:", error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};*/

exports.getLatestUsers = async (req, res) => {
    try {
        const latestUsers = await User.find().sort({ createdAt: -1 }).limit(2);
        
        if (!Array.isArray(latestUsers)) {
            return res.status(500).json({ error: "Data format error" });
        }
        
        res.json({ success: true, users: latestUsers }); // 🔹 Đảm bảo trả về JSON đúng format
    } catch (error) {
        console.error("❌ Error fetching latest users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

