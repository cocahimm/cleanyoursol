const mongoose = require("mongoose");
const slugify = require("/root/solana-backend/node_modules/slugify");


const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    content: { type: String, required: true },
    image: { type: String }, // URL hình ảnh
    author: { type: String, required: true }, // PublicKey của tác giả
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

// 📌 Tạo slug tự động trước khi lưu
BlogSchema.pre("save", function (next) {
    if (!this.slug) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model("Blog", BlogSchema);
