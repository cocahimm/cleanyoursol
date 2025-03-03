const express = require("express");
const { getUserLedgerHistory, getAllLedgerHistory ,saveLedgerEntry,getClaimStats  } = require("../controllers/ledgerController");

const router = express.Router();

// Lấy lịch sử claim của một người dùng
router.get("/user/:publicKey", getUserLedgerHistory);

// Lấy lịch sử claim của toàn hệ thống
router.get("/all", getAllLedgerHistory); // Khi gọi /api/ledger sẽ trả về toàn bộ lịch sử

// Lưu giao dịch vào ledger
router.post("/", async (req, res) => {
    try {
        const { publicKey, tokenId, txHash, amount ,referral } = req.body;
        await saveLedgerEntry(publicKey, tokenId, txHash, amount ,referral);
        res.json({ success: true });
    } catch (error) {
        console.error("❌ Error saving ledger entry:", error);
        res.status(500).json({ error: "Failed to save ledger entry" });
    }
});


// API lấy thống kê tổng số tài khoản đã claim & tổng số SOL nhận được
router.get("/stats", getClaimStats);

module.exports = router;
