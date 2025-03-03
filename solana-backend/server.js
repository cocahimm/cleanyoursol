const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const claimRoutes = require("./routes/claim");
const tokenRoutes = require("./routes/tokenRoutes");

const { Connection } = require("@solana/web3.js");
const connection = new Connection("https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02", "confirmed");


dotenv.config();



const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", claimRoutes);

const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/solanaDB";

mongoose.connect(MONGO_URI);


const referralRoutes = require("./routes/referral");
app.use("/api/referral", referralRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const ledgerRoutes = require("./routes/ledger");
app.use("/api/ledger", ledgerRoutes);

const blogRoutes = require("./routes/blogRoutes");
app.use("/api/blog", blogRoutes);
app.use("/uploads", express.static("uploads")); // ✅ Cho phép hiển thị ảnh

app.use("/api", tokenRoutes);
const topVipRoutes = require("./routes/topVipRoutes");
app.use("/api", topVipRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server đang chạy tại http://0.0.0.0:${PORT}`);
})
