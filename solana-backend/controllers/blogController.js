const Blog = require("../models/blogModel");

// ✅ Tạo bài viết mới
const createPost = async (req, res) => {
    try { 
		//console.log("📩 Dữ liệu nhận từ frontend:", req.body); // Debug
        const { title, content, publicKey } = req.body;
        if (!publicKey) return res.status(401).json({ error: "Login!" });

        // 📌 Kiểm tra nếu có ảnh được tải lên
        const imageUrl = req.file ? `https://cleanyoursol.com/uploads/${req.file.filename}` : null;


        // 📌 Tạo bài viết mới
        const newPost = new Blog({
            title,
            content,
            image: imageUrl,  // 🔹 Lưu đường dẫn ảnh vào DB
            author: publicKey
        });

        await newPost.save();
        res.status(201).json({ success: true, post: newPost });
    } catch (error) {
        console.error("❌ Error creating blog post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Lấy danh sách bài viết
// ✅ Lấy danh sách bài viết (Rút ngắn nội dung)
/*
const getAllPosts = async (req, res) => {
    try {
        const posts = await Blog.find().sort({ createdAt: -1 });

        // 🔥 Rút gọn nội dung trước khi trả về client
        const formattedPosts = posts.map(post => ({
            _id: post._id,
            title: post.title,
            slug: post.slug,
            image: post.image,
            content: post.content.length > 200 
                ? post.content.slice(0, 200) + "..." 
                : post.content, // Rút gọn nếu quá 200 ký tự
            createdAt: post.createdAt,
            author: post.author
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error("❌ Error fetching blog posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
*/


const getAllPosts = async (req, res) => {
    try {
        const posts = await Blog.find().sort({ createdAt: -1 });

        if (!Array.isArray(posts)) {
            return res.json([]);
        }

        res.json(posts);
    } catch (error) {
        console.error("❌ Error fetching blog posts:", error);
        res.status(500).json([]);
    }
};











// ✅ Lấy bài viết theo slug
const getPostBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        //console.log("🔍 Slug nhận được:", slug);  // Check slug từ request

        const post = await Blog.findOne({ slug });

        if (!post) {
            return res.status(404).json({ error: "❌ Eror 404!" });
        }

        res.json(post);
    } catch (error) {
        console.error("❌ Error fetching post by slug:", error);
        res.status(500).json({ error: "Lỗi server!" });
    }
};
/*
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Blog.findById(id);
        
        if (!post) return res.status(404).json({ error: "Bài viết không tồn tại!" });

        res.json(post);
    } catch (error) {
        console.error("❌ Error fetching post by ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

*/
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Kiểm tra id có đúng định dạng MongoDB ObjectId không
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "❌ Invalid post ID format!" });
        }

        const post = await Blog.findById(id);

        if (!post) return res.status(404).json({ error: "❌ Post not found!" });

        res.json(post);
    } catch (error) {
        console.error("❌ Error fetching post by ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



// ✅ Cập nhật bài viết
const updatePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const { title, content } = req.body;
        let imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // 📌 Kiểm tra bài viết có tồn tại không
        const existingPost = await Blog.findById(postId);
        if (!existingPost) {
            return res.status(404).json({ error: "error 404!" });
        }

        // 📌 Nếu không có ảnh mới, giữ nguyên ảnh cũ
        if (!imageUrl) {
            imageUrl = existingPost.image;
        }

        const updatedPost = await Blog.findByIdAndUpdate(
            postId,
            { title, content, image: imageUrl, updatedAt: new Date() },
            { new: true }
        );

        res.json({ success: true, message: "✅ Bài viết đã được cập nhật!", post: updatedPost });
    } catch (error) {
        console.error("❌ Error updating blog post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Xóa bài viết
const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        await Blog.findByIdAndDelete(postId);
        res.json({ success: true, message: "🗑️ Bài viết đã bị xóa!" });
    } catch (error) {
        console.error("❌ Error deleting blog post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// ✅ Xuất tất cả các hàm
module.exports = { createPost, getAllPosts, getPostBySlug, getPostById, updatePost, deletePost };
