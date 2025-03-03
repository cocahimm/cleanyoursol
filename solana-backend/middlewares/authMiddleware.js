require("dotenv").config();


exports.isAdmin = (req, res, next) => {
    const { publicKey } = req.body;

    //console.log("🔍 PublicKey từ request:", publicKey);

    if (!publicKey) {
        //console.log("⛔ Không có publicKey, từ chối truy cập.");
        return res.status(401).json({ error: "🚫 Please Login!" });
    }

    const adminWallets = process.env.ADMIN_WALLETS_BLOG 
        ? process.env.ADMIN_WALLETS_BLOG.split(",") 
        : [];

    //console.log("🛠 Danh sách Admin từ ENV:", adminWallets);

    if (!adminWallets.includes(publicKey)) {
        //console.log("⛔ PublicKey Not Admin.");
        return res.status(403).json({ error: "⛔ PublicKey Not Admin!" });
    }

    //console.log("✅ PublicKey hợp lệ, tiếp tục authmidd.js .");
    next();
};