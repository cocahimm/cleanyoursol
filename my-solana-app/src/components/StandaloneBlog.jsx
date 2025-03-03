import BlogPost from "./BlogPost";

const StandaloneBlog = () => {
    return (
        <div className=" min-h-screen">
            {/* ✅ Header riêng */}
            <header className=" py-4 shadow-md">
                <div className="max-w-4xl mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-bold">📰 CleanYourSOL Blog</h1>
                    <a href="/" className=" hover:underline">🏠 Home</a>
                </div>
            </header>

            {/* ✅ Nội dung bài viết */}
            <div className="max-w-4xl mx-auto p-6  shadow-lg rounded-lg mt-6">
                <BlogPost />
            </div>

            {/* ✅ Footer riêng */}
            <footer className="  text-center py-4 mt-10">
                <p>© {new Date().getFullYear()} CleanYourSOL - All rights reserved.</p>
            </footer>
        </div>
    );
};

export default StandaloneBlog;
