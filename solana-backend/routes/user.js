const express = require("express");
const { getLatestUsers, registerUser, getUserByPublicKey, upgradeUserVip } = require("../controllers/userController"); // Import đúng

const router = express.Router();
// 📌 API lấy danh sách admin từ `.env`
router.get("/admins", (req, res) => {
    const admins = process.env.ADMIN_WALLETS_BLOG ? process.env.ADMIN_WALLETS_BLOG.split(",") : [];
    //console.log("📢 Admins from ENV:", admins); // ✅ Debug log
    res.json({ admins });
});
// 📌 API lấy danh sách 5 user mới nhất
router.get("/latest", getLatestUsers);

router.post("/register", registerUser);
router.get("/:publicKey", getUserByPublicKey);
router.post("/upgrade-vip", upgradeUserVip);


module.exports = router;
