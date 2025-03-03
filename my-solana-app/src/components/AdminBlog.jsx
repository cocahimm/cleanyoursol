import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const API_BASE = "https://cleanyoursol.com/api/blog";

const AdminBlog = () => {
    const { publicKey } = useWallet();
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [editingPost, setEditingPost] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
	
    // 🔥 Kiểm tra quyền Admin
    useEffect(() => {
        if (!publicKey) return;
        fetch("https://cleanyoursol.com/api/user/admins")
            .then(res => res.json())
            .then(data => {
                if (data.admins.includes(publicKey.toBase58())) {
                    setIsAdmin(true);
                }
            })
            .catch(error => console.error("❌ Error checking admin:", error));
    }, [publicKey]);

    // 🔥 Lấy danh sách bài viết
    useEffect(() => {
        fetch(`${API_BASE}/`)
            .then(res => res.json())
            .then(data => setPosts(data))
            .catch(error => console.error("❌ Error fetching posts:", error));
    }, []);

    // 🖼️ Xử lý chọn ảnh
    const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result); // Hiển thị ảnh xem trước
        };
        reader.readAsDataURL(file);
    }
};


    // 🔥 Tạo bài viết mới
 const handleCreatePost = async () => {
    if (!publicKey) return alert("🚫 Bạn chưa kết nối ví!");

    console.log("🔑 PublicKey đang gửi:", publicKey?.toBase58()); // Debug

    if (!title || !content) return alert("🚫 Vui lòng nhập tiêu đề và nội dung!");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("publicKey", publicKey.toBase58()); // Gửi publicKey lên backend
    if (image) {
        formData.append("image", image);
    }

    try {
        const res = await fetch(`${API_BASE}/create`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setPosts([...posts, data]);
        setTitle("");
        setContent("");
        setImage(null);
        setPreview(null);
        alert("✅ Bài viết đã được tạo!");
    } catch (error) {
        console.error("❌ Error creating post:", error);
    }
};

const handleEditPost = async (postId) => {
    try {
        // 🛑 Gọi API lấy bài viết đầy đủ trước khi chỉnh sửa
        const res = await fetch(`https://cleanyoursol.com/api/blog/${postId}`);
        const fullPost = await res.json();

        // ✅ Gán nội dung đầy đủ vào form sửa
        setTitle(fullPost.title);
        setContent(fullPost.content); // Nội dung đầy đủ
        setEditingPost(fullPost);
    } catch (error) {
        console.error("❌ Error fetching full post:", error);
        alert("🚫 Không thể tải nội dung bài viết đầy đủ!");
    }
};




    // 🔥 Cập nhật bài viết
   const handleUpdatePost = async () => {
    if (!editingPost) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("publicKey", publicKey.toBase58());

    if (image) {
        formData.append("image", image); // ✅ Nếu có ảnh mới thì gửi lên
    }

    try {
        const res = await fetch(`${API_BASE}/update/${editingPost._id}`, {
            method: "PUT",
            body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setPosts(posts.map(p => (p._id === editingPost._id ? data.post : p)));
        setTitle("");
        setContent("");
        setImage(null);
        setPreview(null);
        setEditingPost(null);
        alert("✅ Cập nhật bài viết thành công!");
    } catch (error) {
        console.error("❌ Error updating post:", error);
    }
};

    // 🔥 Xóa bài viết
    const handleDeletePost = async (postId) => {
        if (!window.confirm("⚠️ Bạn có chắc chắn muốn xóa bài viết này?")) return;

        try {
            await fetch(`${API_BASE}/delete/${postId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ publicKey: publicKey.toBase58() }),
            });

            setPosts(posts.filter(p => p._id !== postId));
            alert("✅ Bài viết đã bị xóa!");
        } catch (error) {
            console.error("❌ Error deleting post:", error);
        }
    };

    if (!isAdmin) return <p className="text-center text-red-500">⛔ Bạn không có quyền Admin!</p>;

    return (
        <div className="p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">📢 Quản lý bài viết</h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tiêu đề"
                    className="w-full p-2 rounded mb-2 text-black"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Nội dung..."
                    className="w-full p-2 rounded mb-2 text-black"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
                <input type="file" accept="image/*" onChange={handleFileChange} className="mb-2"/>

                {preview && (
                    <img src={preview} alt="Xem trước" className="w-full h-40 object-cover mt-2 rounded-lg" />
                )}

                <button
                    onClick={editingPost ? handleUpdatePost : handleCreatePost}
                    className="bg-green-500 px-4 py-2 rounded-lg mt-2"
                >
                    {editingPost ? "💾 Cập nhật bài viết" : "✏️ Tạo bài viết"}
                </button>
            </div>

             <div className="max-w-4xl mx-auto p-6 shadow-lg rounded-lg">
			{posts.map((post) => (
				<div 
					key={post._id} 
					 className="flex flex-col md:flex-row items-center md:items-start border-b pb-6 mb-6"
				>
				 
                {/* Ảnh bài viết */}
                {post.image && (
                    <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full md:w-48 h-48 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
                    />
                )}

                {/* Nội dung bài viết */}
                <div className="flex-1">
                    <h3 className="text-2xl font-semibold">{post.title}</h3>
                    
                    {/* Nội dung rút gọn (Loại bỏ HTML) */}
                    <p className="mt-2 text-gray-600">
                        {post.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                    </p>
				<div className="mt-2">
                <button 
					onClick={() => handleEditPost(post._id)}
					className="bg-yellow-500 px-3 py-1 rounded-lg"
				>
					✏️ Sửa
				</button>


                <button onClick={() => handleDeletePost(post._id)}
                    className="bg-red-500 px-3 py-1 rounded-lg ml-2">🗑️ Xóa</button>
            </div>
                    
                </div>
            </div>
        )
	
	
	)}
</div>

        </div>
    );
};

export default AdminBlog;
