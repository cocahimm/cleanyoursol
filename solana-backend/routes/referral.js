const express = require("express");
const { getMyReferrals, getReferralLink } = require("../controllers/referralController");

const router = express.Router();

router.get("/:publicKey", getReferralLink);
router.get("/my-referrals/:referralCode", getMyReferrals);

module.exports = router;
