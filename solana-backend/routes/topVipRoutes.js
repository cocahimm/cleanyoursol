// routes/topVipRoutes.js
const express = require("express");
const router = express.Router();
const { getTopVipUsers } = require("../controllers/topVipController");

router.get("/topvip", getTopVipUsers);

module.exports = router;
