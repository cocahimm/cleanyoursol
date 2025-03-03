const express = require("express");
const { claimMultipleTokens,confirmClaimTransaction,claimSingleToken } = require("../controllers/claimController");

const router = express.Router();
// 🔹 **API gửi giao dịch cho người dùng ký**
router.post("/claim-multiple", claimMultipleTokens);
// 🔹 **API xác nhận giao dịch sau khi ký**
router.post("/confirm-transaction", confirmClaimTransaction);

router.post("/claim/single", claimSingleToken);   

module.exports = router; 
