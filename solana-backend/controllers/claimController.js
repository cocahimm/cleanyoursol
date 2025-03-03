const { Connection, PublicKey, Transaction, SystemProgram } = require("@solana/web3.js");
const { createCloseAccountInstruction, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const dotenv = require("dotenv");
const Referral = require("../models/referral");
const Ledger = require("../models/ledger"); // ✅ Thêm dòng này
const { saveLedgerEntry } = require("../controllers/ledgerController");
const User = require("../models/user");
const { VIP_REQUIREMENTS, getNextVipLevel } = require("../utils/vipUtils"); // Import hàm xử lý VIP
require("dotenv").config(); 

// Kết nối với Solana RPC
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");




/* oke

exports.claimMultipleTokens = async (req, res) => {
    const { publicKey, tokenIds, referral } = req.body;

    try {
        const userPubKey = new PublicKey(publicKey);
        const refundAmount = await connection.getMinimumBalanceForRentExemption(165);
        console.log("Refund amount per token:", refundAmount);

        let transaction = new Transaction();

        // 🔹 **Đóng từng token account**
        for (const tokenId of tokenIds) {
            try {
                const tokenAccount = new PublicKey(tokenId.trim());
                const closeIx = createCloseAccountInstruction(
                    tokenAccount,
                    userPubKey,
                    userPubKey,
                    [],
                    TOKEN_PROGRAM_ID
                );
                transaction.add(closeIx);
            } catch (error) {
                console.error(`Invalid token ID: ${tokenId}, skipping.`);
            }
        }

        // 🔹 **Tính phí dịch vụ**       
// 🔥 Người claim sẽ luôn trích 20% refundAmount làm phí
const feePerToken = Math.floor(refundAmount * 0.2);
console.log(`🏛️ feePerToken: ${feePerToken}`);
// 🔥 Nếu có referral, tính hoa hồng cho người giới thiệu
let perReferralFee = 0;
let totalReferralFee = 0;
// 🔥 Nếu có referral, tính hoa hồng cho người giới thiệu
if (referral) {
    const refRecord = await Referral.findOne({ referralCode: referral });

    if (refRecord && refRecord.fullPublicKey) {
        try {
            const referralWallet = new PublicKey(refRecord.fullPublicKey);

            // 🔥 Lấy thông tin referrer để kiểm tra VIP level
            const referrer = await User.findOne({ publicKey: refRecord.fullPublicKey });

            if (referrer) {
                console.log(`✅ Found referrer: ${referrer.publicKey}, VIP Level: ${referrer.vipLevel}`);

                // 📌 Kiểm tra nếu người được giới thiệu đã claim ít nhất 1 lần
                const existingClaim = await Ledger.findOne({ publicKey: userPubKey });

                // 📌 Tỷ lệ % hoa hồng theo cấp VIP
                const VIP_REFERRAL_REWARD = {
                    vip0: 0.20, // 20% của phí dịch vụ
                    vip1: 0.25, // 25%
                    vip2: 0.30, // 30%
                    vip3: 0.35, // 35%
                    vip4: 0.40, // 40%
                    vip5: 0.45  // 45%
                };

                // 🔥 Lấy cấp VIP của referrer
                const referrerVipLevel = referrer.vipLevel || "vip0";
                const referralRewardRate = VIP_REFERRAL_REWARD[referrerVipLevel] || 0.20; // Mặc định là 20%

                // 🔥 Tính hoa hồng referral dựa trên cấp VIP
                 perReferralFee =  Math.floor(Number(feePerToken) * referralRewardRate)
                 totalReferralFee = perReferralFee * tokenIds.length;
				console.log(`ref nhận được: ${totalReferralFee} `);
               // console.log(`💰 Referral ${refRecord.fullPublicKey} (VIP: ${referrerVipLevel}) nhận được: ${totalReferralFee} lamports`);

                // ✅ Gửi phí hoa hồng cho referrer nếu tổng hoa hồng > 0
                if (totalReferralFee > 0) {
                    transaction.add(SystemProgram.transfer({
                        fromPubkey: userPubKey,
                        toPubkey: referralWallet,
                        lamports: totalReferralFee
                    }));
                }

                
            } else {
                console.error(`❌ Không tìm thấy referrer ${refRecord.fullPublicKey} trong User DB.`);
            }
        } catch (error) {
            console.error("❌ Lỗi khi gửi hoa hồng referral:", error);
        }
    } else {
        console.error(`❌ Referral không tồn tại hoặc thiếu fullPublicKey: ${JSON.stringify(refRecord)}`);
    }
}


 // 🔥 Admin nhận phần còn lại sau khi trừ phí referral
        
const effectiveAdminFeePerToken = feePerToken - perReferralFee;
const totalAdminFee = effectiveAdminFeePerToken * tokenIds.length;

console.log(`🏛️ admin : ${totalAdminFee}`);
 // 🔹 **Gửi phí cho admin**
        if (totalAdminFee > 0) {
            const adminWallet = new PublicKey(process.env.ADMIN_WALLET);
            transaction.add(SystemProgram.transfer({
                fromPubkey: userPubKey,
                toPubkey: adminWallet,
                lamports: totalAdminFee
            }));
        }
			

        // 🔹 **Set blockhash và feePayer**
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = userPubKey;

        console.log("Blockhash:", blockhash, "LastValidBlockHeight:", lastValidBlockHeight);

        // 🔹 **Simulate trước khi gửi cho client**
        const simulationResult = await connection.simulateTransaction(transaction);
        if (simulationResult.value.err) {
            console.error("Simulation error:", simulationResult.value.err);
            return res.status(500).json({ error: "Simulation failed: " + JSON.stringify(simulationResult.value.err) });
        }

        // ✅ **Gửi giao dịch đến client để ký**
        const serializedTx = transaction.serialize({ requireAllSignatures: false });

        res.json({ transaction: serializedTx.toString("base64"), refundAmount });

        // ❗ **Không lưu vào ledger tại đây vì giao dịch chưa hoàn tất**  

    } catch (error) {
        console.error("❌ Error in claimMultipleTokens:", error);
        res.status(500).json({ error: error.toString() });
    }
};

ok */
exports.claimMultipleTokens = async (req, res) => {
    const { publicKey, tokenIds, referral } = req.body;

    if (!publicKey || !Array.isArray(tokenIds) || tokenIds.length === 0) {
        return res.status(400).json({ error: "❌ Missing required fields" });
    }

    try {
        const userPubKey = new PublicKey(publicKey);
        let transaction = new Transaction();
        const refundAmount = await connection.getMinimumBalanceForRentExemption(165);
        let totalAdminFee = 0;
        let totalReferralFee = 0;
        let perReferralFee = 0;

        // 🔥 **Tính kích thước thực tế mỗi instruction**
        const sampleTokenAccount = new PublicKey(tokenIds[0].trim());
        const sampleInstruction = createCloseAccountInstruction(
            sampleTokenAccount,
            userPubKey,
            userPubKey,
            [],
            TOKEN_PROGRAM_ID
        );
		
		// 🔥 Chuyển instruction thành Buffer để tính size
		const instructionBuffer = Buffer.from(sampleInstruction.keys.map(k => k.pubkey.toBuffer()).flat());
		
        // 🔥 Ước lượng kích thước transaction
		const instructionSize = instructionBuffer.length;  
		const MAX_TX_SIZE = 1232;
		const BASE_TX_SIZE = 150;
		const MAX_TOKENS = Math.floor((MAX_TX_SIZE - BASE_TX_SIZE) / instructionSize);

		console.log(`🔍 Max tokens per transaction: ${MAX_TOKENS} (Instruction size: ${instructionSize} bytes)`);

        let processableTokens = tokenIds.slice(0, MAX_TOKENS);
        if (processableTokens.length < tokenIds.length) {
            console.warn(`⚠️ Too many tokens! Processing only ${processableTokens.length} tokens.`);
        }

        for (const tokenId of processableTokens) {
            try {
                const tokenAccount = new PublicKey(tokenId.trim());
                const closeIx = createCloseAccountInstruction(
                    tokenAccount,
                    userPubKey,
                    userPubKey,
                    [],
                    TOKEN_PROGRAM_ID
                );
                transaction.add(closeIx);
            } catch (error) {
                console.error(`❌ Invalid token ID: ${tokenId}, skipping.`);
            }
        }

        // 🔥 Tính phí dịch vụ
        const feePerToken = Math.floor(refundAmount * 0.2);
        totalAdminFee = feePerToken * processableTokens.length;

        // 🔥 Nếu có referral, tính hoa hồng referrer
        if (referral) {
            const refRecord = await Referral.findOne({ referralCode: referral });

            if (refRecord && refRecord.fullPublicKey) {
                try {
                    const referralWallet = new PublicKey(refRecord.fullPublicKey);

                    // 🔥 Lấy thông tin referrer để kiểm tra VIP level
                    const referrer = await User.findOne({ publicKey: refRecord.fullPublicKey });

                    if (referrer) {
                        console.log(`✅ Found referrer: ${referrer.publicKey}, VIP Level: ${referrer.vipLevel}`);

                        // 📌 Tỷ lệ % hoa hồng theo cấp VIP
                        const VIP_REFERRAL_REWARD = {
                            vip0: 0.20, // 20% của phí dịch vụ
                            vip1: 0.25, // 25%
                            vip2: 0.30, // 30%
                            vip3: 0.35, // 35%
                            vip4: 0.40, // 40%
                            vip5: 0.45  // 45%
                        };

                        // 🔥 Lấy cấp VIP của referrer
                        const referrerVipLevel = referrer.vipLevel || "vip0";
                        const referralRewardRate = VIP_REFERRAL_REWARD[referrerVipLevel] || 0.20; // Mặc định là 20%

                        // 🔥 Tính hoa hồng referral dựa trên cấp VIP
                        perReferralFee = Math.floor(Number(feePerToken) * referralRewardRate);
                        totalReferralFee = perReferralFee * processableTokens.length;

                        console.log(`💰 Referral ${refRecord.fullPublicKey} (VIP: ${referrerVipLevel}) nhận được: ${totalReferralFee} lamports`);

                        // ✅ Gửi phí hoa hồng cho referrer nếu tổng hoa hồng > 0
                        if (totalReferralFee > 0) {
                            transaction.add(SystemProgram.transfer({
                                fromPubkey: userPubKey,
                                toPubkey: referralWallet,
                                lamports: totalReferralFee
                            }));
                        }
                    } else {
                        console.error(`❌ Không tìm thấy referrer ${refRecord.fullPublicKey} trong User DB.`);
                    }
                } catch (error) {
                    console.error("❌ Lỗi khi gửi hoa hồng referral:", error);
                }
            } else {
                console.error(`❌ Referral không tồn tại hoặc thiếu fullPublicKey: ${JSON.stringify(refRecord)}`);
            }
        }

        // 🔥 Admin nhận phần còn lại sau khi trừ phí referral
        const effectiveAdminFeePerToken = feePerToken - perReferralFee;
        totalAdminFee = effectiveAdminFeePerToken * processableTokens.length;

        console.log(`🏛️ Admin nhận tổng cộng: ${totalAdminFee} lamports`);

        // 🔥 Chuyển phí admin
        if (totalAdminFee > 0) {
            const adminWallet = new PublicKey(process.env.ADMIN_WALLET);
            transaction.add(SystemProgram.transfer({
                fromPubkey: userPubKey,
                toPubkey: adminWallet,
                lamports: totalAdminFee
            }));
        }

        // 🔥 Set blockhash & feePayer
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = userPubKey;

        // 🔥 Serialize transaction và gửi về client
        const serializedTx = transaction.serialize({ requireAllSignatures: false });
        res.json({ 
            transaction: serializedTx.toString("base64"), 
            refundAmount, 
            maxTokens: MAX_TOKENS 
        });

    } catch (error) {
        console.error("❌ Error in claimMultipleTokens:", error);
        res.status(500).json({ error: error.toString() });
    }
};


// ✅ **Xử lý sau khi người dùng ký giao dịch và gửi lên Solana**
exports.confirmClaimTransaction = async (req, res) => {
    const { publicKey, tokenIds, txHash, referral } = req.body;

    try {
        console.log(`🔄 Confirming transaction: ${txHash}`);
        const userPubKey = publicKey.toString();

        // ✅ **Kiểm tra nếu user đã từng claim trước đó**
        const existingClaim = await Ledger.findOne({ publicKey: userPubKey });

        // ✅ **Lưu vào ledger (giao dịch claim)**
        await saveLedgerEntry(userPubKey, tokenIds.join(","), txHash, tokenIds.length * 1630000, referral);

        // ✅ **Cập nhật claimedReferrals nếu có referral**
        if (referral && !existingClaim) {  // 🔥 Chỉ +1 nếu đây là lần đầu tiên user claim
            const referrer = await User.findOne({ referralCode: referral });

            if (referrer) {
                // 🔥 **Cập nhật số lượng referrals đã claim**
                referrer.claimedReferrals = (referrer.claimedReferrals || 0) + 1;
                console.log(`✅ First claim! Updated Claimed Referrals for ${referrer.publicKey}: ${referrer.claimedReferrals}`);

                // 🔥 **Kiểm tra nếu đủ điều kiện để lên cấp VIP**
                const currentVip = referrer.vipLevel || "vip0";
                const requiredForNextVip = VIP_REQUIREMENTS[currentVip];

                if (requiredForNextVip !== undefined && referrer.claimedReferrals >= requiredForNextVip) {
                    // ✅ Tự động nâng cấp VIP nếu đủ điều kiện
                    const nextVipLevel = `vip${parseInt(currentVip.replace("vip", "")) + 1}`;
                    if (VIP_REQUIREMENTS.hasOwnProperty(nextVipLevel)) {
                        referrer.vipLevel = nextVipLevel;
                        console.log(`🚀 ${referrer.publicKey} đã lên cấp ${nextVipLevel}`);
                    }
                }

                await referrer.save(); // ✅ Lưu vào database
                console.log(`✅ Updated claimedReferrals for ${referrer.publicKey}: ${referrer.claimedReferrals}, VIP: ${referrer.vipLevel}`);
            }
        }

        res.json({ success: true });

    } catch (error) {
        console.error("❌ Error in confirmClaimTransaction:", error);
        res.status(500).json({ error: error.toString() });
    }
};

exports.claimSingleToken = async (req, res) => {
    const { publicKey, tokenId, referral } = req.body;
    if (!publicKey || !tokenId) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const userPubKey = new PublicKey(publicKey);
        const tokenAccount = new PublicKey(tokenId);

        // 🔥 Kiểm tra nếu có referral thì lấy thông tin ref
        let refRecord = null;
        let referrerVipLevel = "vip0"; // Mặc định VIP0
        if (referral) {
            refRecord = await Referral.findOne({ referralCode: referral });

            if (refRecord && refRecord.fullPublicKey) {
                const referrer = await User.findOne({ publicKey: refRecord.fullPublicKey });
                if (referrer) {
                    referrerVipLevel = referrer.vipLevel || "vip0";
                }
            }
        }

        // 🔥 Bảng tỷ lệ hoa hồng theo cấp VIP
        const VIP_REFERRAL_REWARD = {
            vip0: 0.20, // 20% của phí dịch vụ
            vip1: 0.25, // 25%
            vip2: 0.30, // 30%
            vip3: 0.35, // 35%
            vip4: 0.40, // 40%
            vip5: 0.45  // 45%
        };

        const referralRate = VIP_REFERRAL_REWARD[referrerVipLevel] || 0.20; // Mặc định 20%

        // Tạo transaction đóng tài khoản token
        const closeIx = createCloseAccountInstruction(
            tokenAccount,
            userPubKey,  // Nhận SOL sau khi đóng tài khoản
            userPubKey,  // Chủ sở hữu tài khoản
            [],
            TOKEN_PROGRAM_ID
        );

        // Tính phí admin và referral
        const refundAmount = await connection.getMinimumBalanceForRentExemption(165);
        let totalFee = Math.floor(refundAmount * 0.2); // 20% của refundAmount
        let referralFee = refRecord ? Math.floor(totalFee * referralRate) : 0;
        let adminFee = totalFee - referralFee;

        const transaction = new Transaction();
        transaction.add(closeIx);

        // Thêm transaction chuyển phí admin
        const adminWallet = new PublicKey(process.env.ADMIN_WALLET);
        transaction.add(SystemProgram.transfer({
            fromPubkey: userPubKey,
            toPubkey: adminWallet,
            lamports: adminFee
        }));

        // Nếu có referral, thêm transaction chuyển phí referral
        if (refRecord && refRecord.fullPublicKey) {
            const referralWallet = new PublicKey(refRecord.fullPublicKey);
            transaction.add(SystemProgram.transfer({
                fromPubkey: userPubKey,
                toPubkey: referralWallet,
                lamports: referralFee
            }));
        }

        // Set blockhash và feePayer
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = userPubKey;

        console.log(`✅ Blockhash: ${blockhash}, Ref Fee: ${referralFee}, Admin Fee: ${adminFee}`);

        // Serialize transaction và gửi về client
        const serializedTx = transaction.serialize({ requireAllSignatures: false });
        res.json({ transaction: serializedTx.toString("base64") });

    } catch (error) {
        console.error("❌ Error in claimSingleToken:", error);
        res.status(500).json({ error: error.toString() });
    }
};




const checkAndUpgradeVip = async (user) => {
    const currentVip = user.vipLevel || "vip0";
    const nextVipLevel = `vip${parseInt(currentVip.replace("vip", "")) + 1}`;
    
    if (VIP_REQUIREMENTS.hasOwnProperty(nextVipLevel)) {
        if (user.claimedReferrals >= VIP_REQUIREMENTS[currentVip]) {
            user.vipLevel = nextVipLevel;
            await user.save();
            console.log(`🏆 User ${user.publicKey} upgraded to ${nextVipLevel}`);
        }
    }
};
/*
exports.claimMultipleTokens = async (req, res) => {
    const { publicKey, tokenIds, referral } = req.body;

    try {
        const userPubKey = new PublicKey(publicKey);
        const refundAmount = await connection.getMinimumBalanceForRentExemption(165); 
        console.log("Refund amount per token:", refundAmount);

        let transaction = new Transaction();

        // Đóng từng token account
        for (const tokenId of tokenIds) {
            let tokenAccount;
            try {
                tokenAccount = new PublicKey(tokenId.trim());
            } catch (error) {
               // console.error(`Invalid token ID: ${tokenId}, skipping.`);
                continue;
            }
            const closeIx = createCloseAccountInstruction(
                tokenAccount,
                userPubKey, // Nhận SOL refund
                userPubKey, // Chủ sở hữu
                [],
                TOKEN_PROGRAM_ID
            );
            transaction.add(closeIx);
        }

        // Tính phí dịch vụ
        const feePerToken = Math.floor(refundAmount * 0.2);
        let perReferralFee = referral ? Math.floor(feePerToken * 0.2) : 0;
        const effectiveAdminFeePerToken = feePerToken - perReferralFee;
        const totalAdminFee = effectiveAdminFeePerToken * tokenIds.length;
        const totalReferralFee = perReferralFee * tokenIds.length;

        // Gửi phí admin
        const adminWallet = new PublicKey(process.env.ADMIN_WALLET);
        transaction.add(SystemProgram.transfer({
            fromPubkey: userPubKey,
            toPubkey: adminWallet,
            lamports: totalAdminFee
        }));

        // Nếu có referral, gửi hoa hồng cho referral
        if (referral) {
            const refRecord = await Referral.findOne({ referralCode: referral });
            if (refRecord && refRecord.fullPublicKey) {
                try {
                    const referralWallet = new PublicKey(refRecord.fullPublicKey);
                    transaction.add(SystemProgram.transfer({
                        fromPubkey: userPubKey,
                        toPubkey: referralWallet,
                        lamports: totalReferralFee
                    }));
                } catch (error) {
                   console.error("Invalid referral public key:", refRecord.fullPublicKey);
                }
            }
        }

        // Set blockhash và feePayer
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = userPubKey;

        console.log("Blockhash:", blockhash, "LastValidBlockHeight:", lastValidBlockHeight);

        // Simulate transaction trước khi gửi về client
        const simulationResult = await connection.simulateTransaction(transaction);
        if (simulationResult.value.err) {
            console.error("Simulation error:", simulationResult.value.err);
            return res.status(500).json({ error: "Simulation failed: " + JSON.stringify(simulationResult.value.err) });
        }

        // ✅ **Gửi giao dịch đến client để ký và thực hiện**
        const serializedTx = transaction.serialize({ requireAllSignatures: false });

        res.json({ transaction: serializedTx.toString("base64"), refundAmount });

        // ❗❗❗ **Dừng tại đây, KHÔNG lưu vào ledger khi giao dịch chưa hoàn thành**
        // Vì người dùng sẽ ký giao dịch từ client rồi gửi lên mạng Solana.
        
    } catch (error) {
        console.error("❌ Error in claimMultipleTokens:", error);
        res.status(500).json({ error: error.toString() });
    }
};
*/
/*
exports.claimMultipleTokens = async (req, res) => {
    const { publicKey, tokenIds, referral } = req.body;

    try {
        const userPubKey = new PublicKey(publicKey);
        const refundAmount = await connection.getMinimumBalanceForRentExemption(165);
        console.log("Refund amount per token:", refundAmount);

        let transaction = new Transaction();

        for (const tokenId of tokenIds) {
            let tokenAccount;
            try {
                tokenAccount = new PublicKey(tokenId.trim());
            } catch (error) {
                console.error(`Invalid token ID: ${tokenId}, skipping.`);
                continue;
            }
            const closeIx = createCloseAccountInstruction(
                tokenAccount,
                userPubKey,
                userPubKey,
                [],
                TOKEN_PROGRAM_ID
            );
            transaction.add(closeIx);
        }

        let referralFeePercentage = VIP_REWARDS.vip0; // Mặc định VIP0 = 20%
        if (referral) {
            const referrer = await User.findOne({ referralCode: referral });
            if (referrer) {
                referralFeePercentage = VIP_REWARDS[referrer.vipLevel] || 0.2;

                // 📌 Cập nhật số lượng ví đã claim cho referrer
                referrer.claimedReferrals += 1;
                await referrer.save();

                // 🔥 Kiểm tra nâng cấp VIP
                await updateUserVIP(referrer.publicKey);
            }
        }

        const feePerToken = Math.floor(refundAmount * 0.2);
        const referralFee = Math.floor(feePerToken * referralFeePercentage);
        const effectiveAdminFee = feePerToken - referralFee;
        const totalAdminFee = effectiveAdminFee * tokenIds.length;
        const totalReferralFee = referralFee * tokenIds.length;

        const adminWallet = new PublicKey(process.env.ADMIN_WALLET);
        transaction.add(SystemProgram.transfer({
            fromPubkey: userPubKey,
            toPubkey: adminWallet,
            lamports: totalAdminFee
        }));

        if (referral) {
            const refRecord = await Referral.findOne({ referralCode: referral });
            if (refRecord && refRecord.fullPublicKey) {
                try {
                    const referralWallet = new PublicKey(refRecord.fullPublicKey);
                    transaction.add(SystemProgram.transfer({
                        fromPubkey: userPubKey,
                        toPubkey: referralWallet,
                        lamports: totalReferralFee
                    }));
                } catch (error) {
                    console.error("Invalid referral public key:", refRecord.fullPublicKey);
                }
            }
        }

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.lastValidBlockHeight = lastValidBlockHeight;
        transaction.feePayer = userPubKey;

        console.log("Blockhash:", blockhash, "LastValidBlockHeight:", lastValidBlockHeight);

        const simulationResult = await connection.simulateTransaction(transaction);
        if (simulationResult.value.err) {
            console.error("Simulation error:", simulationResult.value.err);
            return res.status(500).json({ error: "Simulation failed: " + JSON.stringify(simulationResult.value.err) });
        }

        const serializedTx = transaction.serialize({ requireAllSignatures: false });
        res.json({ transaction: serializedTx.toString("base64"), refundAmount });

    } catch (error) {
        console.error("Error in claimMultipleTokens:", error);
        res.status(500).json({ error: error.toString() });
    }
};
*/