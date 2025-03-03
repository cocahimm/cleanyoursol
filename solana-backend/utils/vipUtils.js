const VIP_REQUIREMENTS = {
    vip0: 1,     // Cần 1 referral có claim để lên VIP1
    vip1: 100,   // VIP1 cần 100 referral có claim để lên VIP2
    vip2: 1000,  // VIP2 cần 1000 referral có claim để lên VIP3
    vip3: 5000,  // VIP3 cần 5000 referral có claim để lên VIP4
    vip4: 20000, // VIP4 cần 10000 referral có claim để lên VIP5
    vip5: null   // VIP5 là cấp cao nhất, không nâng cấp tiếp
};

// 🔥 Hàm kiểm tra có lên cấp VIP hay không
const getNextVipLevel = (currentVip, claimedReferrals) => {
    const vipLevels = Object.keys(VIP_REQUIREMENTS); // ["vip0", "vip1", "vip2", "vip3", "vip4", "vip5"]
    let currentIndex = vipLevels.indexOf(currentVip);

    if (currentIndex === -1) return "vip0"; // Nếu không tìm thấy, mặc định là vip0

    for (let i = currentIndex + 1; i < vipLevels.length; i++) {
        const nextVip = vipLevels[i];
        if (claimedReferrals >= VIP_REQUIREMENTS[nextVip]) {
            return nextVip;
        } else {
            break;
        }
    }

    return currentVip; // Nếu chưa đủ điều kiện, giữ nguyên VIP hiện tại
};

module.exports = { VIP_REQUIREMENTS, getNextVipLevel };
