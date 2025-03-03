const express = require("express");
const { createPost, getAllPosts, getPostBySlug, updatePost, deletePost, getPostById } = require("../controllers/blogController"); 
const { isAdmin } = require("../middlewares/authMiddleware");
const multer = require("multer");
// ⚡ Cấu hình lưu ảnh với đuôi mở rộng đầy đủ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "/var/www/uploads/"); // ✅ Thay đổi đường dẫn lưu ảnh
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // ✅ Đổi tên file tránh trùng
    },
});

const upload = multer({ storage: storage });
//const upload = multer({ dest: "uploads/" }); // Lưu ảnh vào thư mục "uploads"
const path = require("path");
const router = express.Router();
router.post("/create", upload.single("image"), (req, res, next) => {next();}, createPost);
//router.post("/create", isAdmin, upload.single("image"), createPost);
router.get("/", getAllPosts);
router.get("/post/:slug", getPostBySlug);
router.put("/update/:postId", upload.single("image"), updatePost);
router.post("/create", upload.single("image"), (req, res, next) => { next();}, updatePost);
router.delete("/delete/:postId", isAdmin, deletePost);
router.get("/:id", getPostById);  // Thêm route lấy bài viết theo ID




module.exports = router;
