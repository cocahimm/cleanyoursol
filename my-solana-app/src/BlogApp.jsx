import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogList from "./components/BlogList";
import BlogPost from "./components/BlogPost";

const BlogApp = () => {
    return (
        <Router>
            <div className="bg-gray-100 min-h-screen">
                {/* ✅ Header riêng */}
                <header className="bg-blue-600 text-white py-4 shadow-md">
                    <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
                        <h1 className="text-2xl font-bold">📰 CleanYourSOL Blog</h1>
                        <a href="/" className="text-white hover:underline">🏠 Home</a>
                    </div>
                </header>

                {/* ✅ Nội dung blog */}
                <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-6">
                    <Routes>
                        <Route path="/" element={<BlogList />} />
                        <Route path="/:slug" element={<BlogPost />} />
                    </Routes>
                </div>

                {/* ✅ Footer riêng */}
                <footer className="bg-gray-800 text-white text-center py-4 mt-10">
                    <p>© {new Date().getFullYear()} CleanYourSOL - All rights reserved.</p>
                </footer>
            </div>
        </Router>
    );
};

ReactDOM.render(<BlogApp />, document.getElementById("blog-root"));
