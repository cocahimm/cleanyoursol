import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await fetch(`https://cleanyoursol.com/api/blog/post/${slug}`);
                if (!response.ok) throw new Error("Bài viết không tồn tại!");
                const data = await response.json();
                setPost(data);
            } catch (error) {
                console.error("❌ Error fetching blog post:", error);
            }
        };
        fetchPost();
    }, [slug]);

    if (!post) return <p className="text-center ">⏳ Loading...</p>;

    return (
        <div>
            
            <header className="bg-blue-600 text-white py-4 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-bold">📰 CleanYourSOL Blog</h1>
                    <Link to="/" className="text-white hover:underline">🏠 Home</Link>
                </div>
            </header>

            
            <div className="max-w-4xl mx-auto p-6 shadow-lg rounded-lg mt-6">
                {post.image && (
                    <img src={post.image} alt={post.title} className="w-full h-64 object-cover rounded-md mb-4" />
                )}
                <h1 className="text-3xl font-semibold">{post.title}</h1>
                <p className=" text-sm">
                    🖋️ Admin| 🕒 {new Date(post.createdAt).toLocaleString()}
                </p>
                <div className="mt-4 " dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

           
            <footer className="text-center py-4 mt-10">
                <p>© {new Date().getFullYear()} CleanYourSOL - All rights reserved.</p>
            </footer>
        </div>
    );
};

export default BlogPost;

