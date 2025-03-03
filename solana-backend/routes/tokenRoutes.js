// routes/tokenRoutes.js
const express = require('express');
const router = express.Router();
const { getTokens } = require('../controllers/tokenController');
const { burnAndClaimTokens, confirmClaimTransaction } = require("../controllers/burnController");

router.get('/tokens', getTokens);

// Endpoint tạo giao dịch burn-claim
router.post("/burn-claim", burnAndClaimTokens);

// Endpoint confirm claim (cập nhật ledger và referral)
router.post("/confirm-claim", confirmClaimTransaction);

module.exports = router;
