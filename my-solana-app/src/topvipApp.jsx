// src/topvipApp.jsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import VipTable from "./components/VipTable";
import "../src/index.css";

import axios from "axios";

// Hàm rút gọn địa chỉ ví: hiển thị 4 ký tự đầu và 4 ký tự cuối
const shortenAddress = (address) => {
  if (!address) return "";
  return address.slice(0, 8) + "..." + address.slice(-8);
};
const shortenAddresslink = (address) => {
  if (!address) return "";
  return address.slice(-8);
};


// Mapping cấp VIP sang Title với icon
const VIP_TITLES = {
  vip0: "Bronze 🟤",
  vip1: "Silver ⚪",
  vip2: "Gold 🟡",
  vip3: "Platinum 🔵",
  vip4: "Diamond 💎",
  vip5: "Legend 🔥",
};

const TopVipApp = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await axios.get("https://cleanyoursol.com/api/topvip", {
          params: { limit: 50 },
        });
        console.log("API response:", response.data);
        setTopUsers(response.data.topUsers || []);
      } catch (err) {
        console.error("Error fetching top VIP users:", err);
        setError("Error fetching top VIP users.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopUsers();
  }, []);
  
  
const [mode, setMode] = useState("Degen"); // Mặc định là "Normie"

const toggleMode = () => {
    setMode((prevMode) => (prevMode === "Normie" ? "Degen" : "Normie"));
};

useEffect(() => {
  const savedMode = localStorage.getItem("mode");
  if (savedMode) {
    setMode(savedMode);
  }
}, []);

useEffect(() => {
  localStorage.setItem("mode", mode);
}, [mode]);

  

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-xl font-medium">
        Loading 🔥 Top 50 VIP...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  if (topUsers.length === 0)
    return (
      <div className="text-center mt-10">
        No Data
      </div>
    );

  return (
<div className={`min-h-screen transition-all duration-300 ${
    mode === "Degen" ? "bg-gray-900 text-white" : "bg-gray-300 text-black"
  } p-6`}>
  
   {/* 🔹 Toggle Normie / Degen */}
    <div className="fixed top-4 right-4 flex items-center space-x-4 bg-gray-800 p-2 rounded-lg shadow-lg">
      <span className={`text-lg font-semibold ${mode === "Normie" ? "text-gray-300" : "text-gray-500"}`}>
        🌞 Normie
      </span>
      <button 
        onClick={toggleMode} 
        className={`relative w-16 h-8 flex items-center rounded-full p-1 transition-all duration-300 ${
          mode === "Degen" ? "bg-purple-600 justify-end" : "bg-gray-500 justify-start"
        }`}
      >
        <span className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-all duration-300 ${
          mode === "Degen" ? "translateX(32px)" : "translateX(0px)"
        }`}>
        </span>
      </button>
      <span className={`text-lg font-semibold ${mode === "Degen" ? "text-gray-300" : "text-gray-500"}`}>
        🌙 Degen
      </span>
    </div>


    {/* 🔹 Container chính */}
    <div className="max-w-4xl mx-auto pt-0">
      
      {/* 🔹 Header */}
  
      <h1 className="text-4xl font-bold text-center mb-8">🔥 Top 50 VIP Users 💎</h1>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full ">
          <thead>
            <tr className="bg-blue-500 text-white">
              <th className="py-3 px-5 text-left">Rank</th>
              <th className="py-3 px-5 text-left">Wallet Address</th>
              <th className="py-3 px-5 text-left">VIP Level</th>
              <th className="py-3 px-5 text-left">Claimed Referrals</th>
              <th className="py-3 px-5 text-left">Link</th>
            </tr>
          </thead>
          <tbody>
            {topUsers.map((user, index) => (
              <tr
                key={user.publicKey}
				 className={`border-b ${
						mode === "Degen"
						  ? "bg-gray-700 hover:bg-gray-500"
						  : "bg-gray-100 hover:bg-gray-300"
					  } ${index < 3 ? "vip-glow animate-fire " : ""}`}
					>
				<td className="py-3 px-5">{index + 1}</td>
                <td className="py-3 px-5 break-words">
                  {shortenAddress(user.publicKey)}
                </td>
                <td className="py-3 px-5">
                  {VIP_TITLES[user.vipLevel] || user.vipLevel}
                </td>
                <td className="py-3 px-5">{user.claimedReferrals}</td>
                <td className="py-3 px-5"><a href={`https://cleanyoursol.com/${shortenAddresslink(user.publicKey)}`} target="_blank" rel="noopener noreferrer">{shortenAddresslink(user.publicKey)}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
		 <VipTable />
      </div>
    </div>
</div>
  );
};



//export default TopVipApp;

ReactDOM.createRoot(document.getElementById("root")).render(<TopVipApp />);