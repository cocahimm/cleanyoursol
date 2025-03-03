import { useState } from "react";

const VIP_LEVELS = [
    { level: "vip0", title: "Bronze 🟤", bonus: "20%", required: 1 },
    { level: "vip1", title: "Silver ⚪", bonus: "25%", required: 100 },
    { level: "vip2", title: "Gold 🟡", bonus: "30%", required: 1000 },
    { level: "vip3", title: "Platinum 🔵", bonus: "35%", required: 10000 },
    { level: "vip4", title: "Diamond 💎", bonus: "40%", required: 20000 },
    { level: "vip5", title: "Legend 🔥", bonus: "45%", required: "Max Level" }
];

const VipTable = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="mt-6">
            {/* 🔥 Expand/Collapse Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition-all"
            >
                {isExpanded ? "🔽 Hide VIP Information" : "🔼 Show VIP Information"}
            </button>

            {/* 🔥 VIP Tables */}
            {isExpanded && (
                <div className="mt-3 overflow-hidden transition-all">
                    {/* 🔥 Table 1: VIP Level & Referral Bonus */}
                    <h3 className="text-xl font-semibold text-center mt-4">💰 VIP Levels & Referral Bonus</h3>
                    <table className="w-full border-collapse border border-gray-400 text-center mt-2">
                        <thead>
                            <tr className="bg-gray-700 text-white">
                                <th className="border border-gray-400 px-4 py-2">VIP Level</th>
                                <th className="border border-gray-400 px-4 py-2">Title</th>
                                <th className="border border-gray-400 px-4 py-2">Referral Bonus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VIP_LEVELS.map((vip, index) => (
                                <tr key={index} className="bg-gray-500 text-white">
                                    <td className="border border-gray-400 px-4 py-2 font-bold  vip-glow animate-fire uppercase">{vip.level}</td>
                                    <td className="border border-gray-400 px-4 py-2 vip-glow animate-fire uppercase">{vip.title}</td>
                                    <td className="border border-gray-400 px-4 py-2 text-green-300  vip-glow animate-fire font-semibold">{vip.bonus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
					{/* 🔥 Explanation of Referral Bonus */}
                    <p className="text-center text-blue-700 mt-4 italic bold">
                        * The referral bonus is deducted from **20% of the service fee** when a referred user claims tokens.
                    </p>
                    {/* 🔥 Table 2: Required Referrals to Upgrade */}
                    <h3 className="text-xl font-semibold text-center mt-6">🚀 Required Referrals to Upgrade</h3>
                    <table className="w-full border-collapse border border-gray-400 text-center mt-2">
                        <thead>
                            <tr className="bg-gray-700 text-white">
                                <th className="border border-gray-400 px-4 py-2">Current VIP</th>
                                <th className="border border-gray-400 px-4 py-2">Referrals Needed</th>
                                <th className="border border-gray-400 px-4 py-2">Next VIP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {VIP_LEVELS.slice(0, -1).map((vip, index) => (
                                <tr key={index} className="bg-gray-500 text-white">
                                    <td className="border border-gray-400 px-4 py-2 font-bold uppercase">{vip.title}</td>
                                    <td className="border border-gray-400 px-4 py-2 text-yellow-300">{vip.required}</td>
                                    <td className="border border-gray-400 px-4 py-2 font-bold uppercase">{VIP_LEVELS[index + 1].title}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    
                </div>
            )}
        </div>
    );
};

export default VipTable;
