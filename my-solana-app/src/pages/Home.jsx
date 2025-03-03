import React from "react";
import BlogList from "../components/BlogList";  // ✅ Hiển thị danh sách bài viết


const Home = () => {
    return (
        <div className="container mx-auto">
                     
            <div className="mt-0">
               
                <BlogList />
            </div>
        </div>
    );
};

export default Home;
