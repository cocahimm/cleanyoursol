
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE = "https://cleanyoursol.com/api/blog";

const BlogList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`${API_BASE}/`);
                const data = await response.json();

                //console.log("🔍 API Response:", data); // Debug API response

                if (Array.isArray(data)) {
                    setPosts(data);
                } else {
                    console.error("❌ API Error: Invalid response format", data);
                }
            } catch (error) {
                console.error("❌ Error fetching blog posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="max-w-4xl mx-auto p-6 shadow-lg rounded-lg">
            <h2 className="text-3xl font-bold text-center mb-6">📜 Blog Posts</h2>

            {loading ? (
                <p className="text-center">⏳ Loading posts...</p>
            ) : posts.length > 0 ? (
                posts.map((post) => (
                    <div key={post._id} className="mb-6 flex flex-col md:flex-row border-b pb-4">
                       
                        {post.image && (
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full md:w-48 h-48 object-cover rounded-lg mb-4 md:mb-0 md:mr-6"
                            />
                        )}

                       
                        <div>
                            <h3 className="text-2xl font-semibold">{post.title}</h3>
                            
                            
                            <p className="mt-2 text-gray-600">
                                {post.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
                            </p>

                            <Link 
                                to={`/blog/${post.slug}`} 
                                className="text-blue-500 hover:underline font-semibold mt-3 inline-block"
                            >
                                Read more →
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center">🚫 No blog posts found.</p>
            )}
        </div>
    );
};

export default BlogList;

