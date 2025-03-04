//App.jsx
import { Buffer } from "buffer";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, LAMPORTS_PER_SOL, Transaction } from "@solana/web3.js";
import VipTable from "./components/VipTable";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import BlogList from "./components/BlogList";
import AdminBlog from "./components/AdminBlog";
import BlogPost from "./components/BlogPost";

const SOLANA_NETWORK = "https://divine-old-bridge.solana-mainnet.quiknode.pro/e6cba5f73fa09260f937f65f73bbe8fa7fa0dd24";
const API_BASE_URL = "https://cleanyoursol.com/api"; // 🔹 Định nghĩa URL chuẩn
const API_CLAIM_URL = "https://cleanyoursol.com/api/claim-multiple";
const API_REFERRAL_URL = "https://cleanyoursol.com/api/referral";
const API_USER_URL = "https://cleanyoursol.com/api/user/register";
const API_LEDGER_URL = "https://cleanyoursol.com/api/ledger";
const API_URL = "https://cleanyoursol.com/api";
const MIN_REQUIRED_SOL = 0.002;
//burn

import TokenBurnList from "./components/TokenBurnList";
//import TokenBurnList from "./components/BurnTokens";


const generateFakeUser = () => {
    const base58Chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const randomPubKey = [...Array(44)].map(() => base58Chars[Math.floor(Math.random() * base58Chars.length)]).join("");
    
    return {
        publicKey: randomPubKey,
        createdAt: new Date().toISOString()
    };
};

const App = () => {
	
	
	
    const { publicKey,signTransaction,signAndSendTransaction  } = useWallet();
    const [solBalance, setSolBalance] = useState(null);
	const [isClaiming, setIsClaiming] = useState(false);// ✅ Thêm state xử lý loadin

    const [claimableTokens, setClaimableTokens] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [referralLink, setReferralLink] = useState(null);
    const [referrals, setReferrals] = useState([]);
    const [totalReferrals, setTotalReferrals] = useState(0);
	const [userHistory, setUserHistory] = useState([]);
    const [allHistory, setAllHistory] = useState([]);
    const connection = new Connection(SOLANA_NETWORK, "confirmed");

const [totalClaimableTokens, setTotalClaimableTokens] = useState(0);
const [totalRefundSOL, setTotalRefundSOL] = useState(0);

const [totalAccountsClaimed, setTotalAccountsClaimed] = useState(0);
const [totalSOLReceived, setTotalSOLReceived] = useState(0);
const [userOffset, setUserOffset] = useState(0)
const [allOffset, setAllOffset] = useState(0);
const [userTotal, setUserTotal] = useState(0);
const [allTotal, setAllTotal] = useState(0);


const limit = 5;

const [referralOffset, setReferralOffset] = useState(0);
const referralLimit = 5; // Số người dùng mỗi lần load
const [userVipLevel, setUserVipLevel] = useState("vip0"); // Mặc định VIP0
const [claimedReferrals, setClaimedReferrals] = useState(0); // Số lượng ví đã claim
const VIP_REWARDS = { 
    vip0: 0.2,  // 20% 
    vip1: 0.25, // 25% 
    vip2: 0.3,  // 30%
    vip3: 0.35, // 35%
    vip4: 0.4,  // 40%
    vip5: 0.45   // 50%
};
const VIP_REQUIREMENTS = {
    vip0: 1,     // Cần 1 người để lên vip1
    vip1: 101,   // Cần 100 người để lên vip2
    vip2: 1101,  // Cần 1000 người để lên vip3
    vip3: 11101,  // Cần 10000 người để lên vip4
    vip4: 31101, // Cần 20000 người để lên vip5
    vip5: null   // vip5 là cấp cao nhất, không thể lên nữa
};

/* new usr*/
/*
const [latestUsers, setLatestUsers] = useState([]);
useEffect(() => {
    const fetchLatestUsers = async () => {
    try {
        const response = await fetch("https://cleanyoursol.com/api/user/latest");
        const data = await response.json();

        // 🔥 Đọc `latestUsers` từ object API trả về
        if (!Array.isArray(data.latestUsers)) {
            throw new Error("API did not return an array");
        }

        setLatestUsers(data.latestUsers); // ✅ Lưu danh sách user
    } catch (error) {
        console.error("❌ Error fetching latest users:", error);
    }
};


    fetchLatestUsers();
    const interval = setInterval(fetchLatestUsers, 5000);
    return () => clearInterval(interval);
}, []);
*/
/* blog */

const [isAdminView, setIsAdminView] = useState(false);
const [adminWallets, setAdminWallets] = useState([]);
// 📌 Lấy danh sách admin từ backend
    useEffect(() => {
        fetch(`${API_URL}/user/admins`)
            .then(res => res.json())
            .then(data => setAdminWallets(data.admins || []))
            .catch(error => console.error("❌ Error fetching admin wallets:", error));
    }, []);

    // ✅ Kiểm tra user có phải admin không
    const isAdmin = publicKey && adminWallets.includes(publicKey.toBase58());
/* blog */


/* user mới */
 const [latestUsers, setLatestUsers] = useState([]); // Lưu user từ API
    const [fakeUser, setFakeUser] = useState(null); // Lưu user ảo tạm thời

    // 🔹 **Lấy danh sách user thật từ API**
    const fetchLatestUsers = async () => {
        try {
            const response = await fetch("https://cleanyoursol.com/api/user/latest");
            const data = await response.json();

            if (!data.success || !Array.isArray(data.users)) {
                throw new Error("API did not return a valid user list");
            }

            setLatestUsers(data.users);
        } catch (error) {
            console.error("❌ Error fetching latest users:", error);
        }
    };

     useEffect(() => {
        fetchLatestUsers(); // Gọi API khi component mount

        const interval = setInterval(() => {
            const newFakeUser = generateFakeUser();
            setFakeUser(newFakeUser); // Cập nhật user ảo
            setTimeout(() => setFakeUser(null), 30000); // Ẩn user ảo sau 6s
        }, 40000); // Mỗi 20s hiển thị 1 user mới

        return () => clearInterval(interval); // Cleanup interval khi unmount
    }, []);
/* new usr*/

const [remainingToNextVip, setRemainingToNextVip] = useState(null); // Còn bao nhiêu để lên cấp

const [claimMode, setClaimMode] = useState("multiple"); // "multiple" hoặc "single"
const claimTokensOneByOne = async () => {
    for (const token of claimableTokens) {
        await claimSingleToken(token.id);
    }
};
/* cu
const claimSingleToken = async (tokenId) => {
    if (!publicKey) return;
    setIsClaiming(true);
	// ✅ Lấy referral code từ localStorage (nếu có)
    let referralCode = localStorage.getItem("referralCode") || null;
    try {
       const response = await fetch(`${API_BASE_URL}/claim/single`, {  // 🔹 Đảm bảo gọi API đúng
            method: "POST",
            body: JSON.stringify({ publicKey: publicKey.toBase58(), tokenId,  referral: referralCode  }),
            headers: { "Content-Type": "application/json" }
        });
		if (!response.ok) {
            throw new Error(`❌ API returned ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();  // 🔹 Đọc JSON chính xác
        console.log("✅ API response:", data);
        if (!data.transaction) {
            console.error("API Error:", data.error);
            return;
        }

        //const txBuffer = Buffer.from(data.transaction, "base64");
        //let transaction = Transaction.from(txBuffer);
		
        //const signedTx = await window.solana.signTransaction(transaction);		
        //const rawTx = signedTx.serialize();
        //const txid = await connection.sendRawTransaction(rawTx);
        //await connection.confirmTransaction(txid, "confirmed");
		

const txBuffer = Buffer.from(data.transaction, "base64");
let transaction = Transaction.from(txBuffer);

let txid;
try {
  if (signAndSendTransaction) {
    const result = await signAndSendTransaction(transaction);
    console.log("Result from signAndSendTransaction:", result);
    // Kiểm tra xem txid có tồn tại không
    if (result && result.txid) {
      txid = result.txid;
    } else {
      console.warn("signAndSendTransaction did not return a valid txid, falling back to signTransaction.");
    }
  }
} catch (err) {
  console.error("Error in signAndSendTransaction:", err);
}

if (!txid && signTransaction) {
  const signedTx = await signTransaction(transaction);
  console.log("Signed transaction:", signedTx);
  txid = await connection.sendRawTransaction(signedTx.serialize());
}

if (!txid) {
  throw new Error("No valid transaction signature received.");
}

const latestBlockhash = await connection.getLatestBlockhash();
await connection.confirmTransaction({
  signature: txid,
  blockhash: latestBlockhash.blockhash,
  lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
}, { commitment: "confirmed" });

console.log("Transaction confirmed, txid:", txid);


		
		// ✅ **Gọi confirmClaimTransaction sau khi giao dịch thành công**
        const confirmRes = await fetch(`${API_BASE_URL}/confirm-transaction`, {
            method: "POST",
            body: JSON.stringify({
                publicKey: publicKey.toBase58(),
                tokenIds: [tokenId],  // API yêu cầu tokenIds dạng mảng
                txHash: txid,
                referral: referralCode
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (!confirmRes.ok) {
            console.error("❌ Error confirming transaction:", await confirmRes.text());
        }
		console.log("✅ Claim confirmed in backend!")
		
        fetchClaimableTokens(); // Cập nhật danh sách token
    } catch (error) {
        console.error("❌ Error claiming token:", error);
    } finally {
        setIsClaiming(false);
    }
};


*/

const claimSingleToken = async (tokenId) => {
    if (!publicKey) return;
    setIsClaiming(true);

    // ✅ Lấy referral code từ localStorage (nếu có)
    let referralCode = localStorage.getItem("referralCode") || null;

    try {
        // 🔹 Gọi API lấy transaction để claim token
        const response = await fetch(`${API_BASE_URL}/claim/single`, {
            method: "POST",
            body: JSON.stringify({ 
                publicKey: publicKey.toBase58(), 
                tokenId,  
                referral: referralCode  
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error(`❌ API returned ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();
        console.log("✅ API response:", data);

        if (!data.transaction) {
            console.error("❌ API Error:", data.error);
            return;
        }

        // ✅ Chuyển transaction từ base64 về Transaction object
        const txBuffer = Buffer.from(data.transaction, "base64");
        let transaction = Transaction.from(txBuffer);

        let txid;
        try {
            if (window.solana && window.solana.isPhantom) {
                // ✅ Đảm bảo `feePayer` và `recentBlockhash` hợp lệ trước khi ký
                transaction.feePayer = transaction.feePayer || window.solana.publicKey;
                transaction.recentBlockhash = transaction.recentBlockhash || (await connection.getLatestBlockhash()).blockhash;

                // 🛠 Debug trước khi gửi
                console.log("📌 Transaction:", transaction);
                console.log("📌 Fee Payer:", transaction.feePayer?.toBase58());
                console.log("📌 Blockhash:", transaction.recentBlockhash);
                console.log("📌 Instructions:", transaction.instructions.length);

                // ✅ Gọi `signAndSendTransaction` của Phantom
                console.log("🔹 Using signAndSendTransaction...");
                const result = await window.solana.signAndSendTransaction(transaction);
                console.log("✅ Result from signAndSendTransaction:", result);

                if (result && result.signature) {
                    txid = result.signature;
                } else {
                    console.warn("⚠️ signAndSendTransaction did not return a valid signature.");
                }
            }
        } catch (err) {
            console.error("❌ Error in signAndSendTransaction:", err);

            // 🔹 Nếu lỗi do blockhash hết hạn, cập nhật lại blockhash rồi fallback sang `signTransaction`
            if (err.message.includes("block height exceeded") || err.message.includes("blockhash expired")) {
                console.warn("⚠️ Transaction expired, retrying with a new blockhash...");
                transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

                try {
                    const signedTx = await window.solana.signTransaction(transaction);
                    const rawTx = signedTx.serialize();
                    txid = await connection.sendRawTransaction(rawTx, { skipPreflight: false });
                } catch (fallbackErr) {
                    console.error("❌ Error in signTransaction fallback:", fallbackErr);
                }
            }
        }

        if (!txid) {
            throw new Error("❌ No valid transaction signature received.");
        }

        // ✅ Xác nhận giao dịch trên blockchain
        console.log("✅ Transaction submitted, txid:", txid);
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
            {
                signature: txid,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            { commitment: "confirmed" }
        );

        console.log("✅ Transaction confirmed, txid:", txid);

        // ✅ Gọi confirmClaimTransaction sau khi giao dịch thành công
        const confirmRes = await fetch(`${API_BASE_URL}/confirm-transaction`, {
            method: "POST",
            body: JSON.stringify({
                publicKey: publicKey.toBase58(),
                tokenIds: [tokenId],  // API yêu cầu tokenIds dạng mảng
                txHash: txid,
                referral: referralCode
            }),
            headers: { "Content-Type": "application/json" }
        });

        if (!confirmRes.ok) {
            console.error("❌ Error confirming transaction:", await confirmRes.text());
        }
        console.log("✅ Claim confirmed in backend!");

        // ✅ Cập nhật danh sách token sau khi claim thành công
        fetchClaimableTokens();
    } catch (error) {
        console.error("❌ Error claiming token:", error);
    } finally {
        setIsClaiming(false);
    }
};


useEffect(() => {
    const fetchData = async () => {
        if (!publicKey) return;

        try {
            // 🔍 Lấy số dư SOL
            const balance = await connection.getBalance(publicKey);
            const solAmount = balance / LAMPORTS_PER_SOL;
            setSolBalance(solAmount);

            // 🔍 Lấy Referral Code từ URL hoặc Query Params
            let referralCode = window.location.pathname.substring(1);
            if (!referralCode || referralCode.length !== 8) {
                referralCode = new URLSearchParams(window.location.search).get("ref");
            }

            // 📌 Kiểm tra và lưu referralCode vào localStorage
            if (referralCode && referralCode.length === 8) {
                //console.log("🔍 Referral Code Found in URL:", referralCode);
                localStorage.setItem("referralCode", referralCode);
            } else {
                referralCode = localStorage.getItem("referralCode") || null;
                //console.log("🔍 Referral Code Found in localStorage:", referralCode);
            }

            //console.log("🚀 Referral Code Sent to Backend:", referralCode || "None");

            // 📌 Đăng ký user hoặc cập nhật referral nếu chưa có
            const userRes = await fetch(API_USER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    publicKey: publicKey.toBase58(),
                    referredBy: referralCode,
                }),
            });

            if (!userRes.ok) {
                console.error(`❌ Failed to register user (Status: ${userRes.status}):`, await userRes.text());
                return;
            }

            // 📌 Lấy thông tin VIP của người dùng từ backend
            const userInfoRes = await fetch(`https://cleanyoursol.com/api/user/${publicKey.toBase58()}`);
            if (!userInfoRes.ok) {
                console.error(`❌ Failed to fetch user info (Status: ${userInfoRes.status})`);
                return;
            }

            const userInfo = await userInfoRes.json();

            // ✅ Nếu không có VIP trong DB, gán mặc định "vip0"
            let userVip = userInfo.vipLevel || "vip0";
            let claimedReferrals = userInfo.claimedReferrals || 0;

            // 🏆 Tính số referrals cần để lên cấp tiếp theo
            const vipIndex = parseInt(userVip.replace("vip", "")) || 0;
            const nextVipLevel = `vip${vipIndex + 1}`;
            const requiredForNextVip = VIP_REQUIREMENTS[userVip] || null;
            const remainingReferrals = requiredForNextVip !== null ? Math.max(0, requiredForNextVip - claimedReferrals) : null;

            setUserVipLevel(userVip);
            setClaimedReferrals(claimedReferrals);
            setRemainingToNextVip(remainingReferrals);

            //console.log(`🏆 Current VIP: ${userVip}, Claimed Referrals: ${claimedReferrals}, Next VIP: ${nextVipLevel}, Needed: ${remainingReferrals}`);

            // 🏆 **Tự động nâng cấp VIP nếu đủ điều kiện**
            if (remainingReferrals === 0 && VIP_REQUIREMENTS.hasOwnProperty(nextVipLevel)) {
                console.log(`🔥 Upgrading user to ${nextVipLevel}...`);
                const upgradeRes = await fetch(`https://cleanyoursol.com/api/user/upgrade-vip`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        publicKey: publicKey.toBase58(),
                        newVipLevel: nextVipLevel,
                    }),
                });

                if (upgradeRes.ok) {
                    console.log(`✅ Successfully upgraded to ${nextVipLevel}`);
                    setUserVipLevel(nextVipLevel); // Cập nhật UI ngay lập tức
                } else {
                    console.error(`❌ Failed to upgrade VIP (Status: ${upgradeRes.status})`);
                }
            }

            // 📌 Nếu tài khoản có đủ SOL, lấy referral link
            if (solAmount >= MIN_REQUIRED_SOL) {
                const referralRes = await fetch(`${API_REFERRAL_URL}/${publicKey.toBase58()}`);
                if (!referralRes.ok) {
                    console.error(`❌ Failed to fetch referral link (Status: ${referralRes.status})`);
                    return;
                }

                const referralData = await referralRes.json();
                if (referralData.referralLink) {
                    setReferralLink(referralData.referralLink);
                    const refCode = referralData.referralLink.split("/").pop();
                    fetchReferrals(refCode);
                }
            }
        } catch (error) {
            console.error("❌ Error in fetchData:", error);
        }
    };

    fetchData();
}, [publicKey, claimedReferrals]); // 👈 Thêm claimedReferrals để cập nhật khi có thay đổi



 const fetchClaimableTokens = async () => {
		//console.log("Claiming tokens...");
        if (!publicKey) return;

        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const emptyTokens = tokenAccounts.value
            .filter((account) => account.account.data.parsed.info.tokenAmount.uiAmount === 0)
            .map((account) => ({
                id: account.pubkey.toBase58(),
                mint: account.account.data.parsed.info.mint,
            }));

        setClaimableTokens(emptyTokens);
        setTotalClaimableTokens(emptyTokens.length);

        // 🔥 Tính số SOL có thể nhận: số token * 0.00163 SOL
        setTotalRefundSOL((emptyTokens.length * 0.00163).toFixed(6));
    };
useEffect(() => {
    fetchClaimableTokens();
	
	
}, [publicKey]);


useEffect(() => {
    const fetchStats = async () => {
        try {
            const res = await fetch("https://cleanyoursol.com/api/ledger/stats");
            const data = await res.json();
            setTotalAccountsClaimed(data.totalAccountsClaimed);
            setTotalSOLReceived(data.totalSOLReceived.toFixed(4));
        } catch (error) {
            console.error("❌ Error fetching claim stats:", error);
        }
    };

    fetchStats();
}, []);






    // Fetch referral list

const fetchReferrals = async (reset = false) => {
    if (!publicKey) return; // Nếu chưa kết nối ví thì return

    try {
        // 🔥 Lấy referralCode từ API
        const referralRes = await fetch(`https://cleanyoursol.com/api/referral/${publicKey.toBase58()}`);
        const referralData = await referralRes.json();

        if (!referralData.referralLink) {
            console.log("❌ User has no referral code.");
            return;
        }

        const referralCode = referralData.referralLink.split("/").pop(); // Lấy mã referral từ URL
        const newOffset = reset ? 0 : referralOffset;

        console.log("📢 Fetching referrals for code:", referralCode, "Offset:", newOffset);

        // 🔥 Gọi API để lấy danh sách referrals
        const res = await fetch(`https://cleanyoursol.com/api/referral/my-referrals/${referralCode}?limit=${referralLimit}&offset=${newOffset}`);
        const data = await res.json();

        if (!data.success || !data.referredUsers) {
            console.error("❌ API error:", data.error);
            return;
        }

        // ✅ Cập nhật danh sách referral
        setReferrals(prevReferrals => reset ? data.referredUsers : [...prevReferrals, ...data.referredUsers]);
        setTotalReferrals(data.totalCount);
        setReferralOffset(prevOffset => prevOffset + referralLimit);

    } catch (error) {
        console.error("❌ Error fetching referrals:", error);
    }
};

// 🔥 Dùng `useEffect` để theo dõi sự thay đổi của `referrals`
useEffect(() => {
    console.log("✅ Updated referrals length:", referrals.length, "Total referrals:", totalReferrals);
}, [referrals, totalReferrals]); // Chỉ chạy khi referrals hoặc totalReferrals thay đổi




    // Fetch empty tokens
    useEffect(() => {
        const fetchClaimableTokens = async () => {
            if (!publicKey) return;

            const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
                programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
            });

            const emptyTokens = tokenAccounts.value
                .filter((account) => account.account.data.parsed.info.tokenAmount.uiAmount === 0)
                .map((account) => ({
                    id: account.pubkey.toBase58(),
                    mint: account.account.data.parsed.info.mint,
                }));

            setClaimableTokens(emptyTokens);
        };

        fetchClaimableTokens();
		
    }, [publicKey]);

    // Claim function with SOL balance check
	/* old 
    const claimAllTokens = async () => {
        setErrorMessage("");

        if (!claimableTokens.length) {
            setErrorMessage("No tokens available to claim.");
            return;
        }

        if (solBalance < MIN_REQUIRED_SOL) {
            setErrorMessage(`You need at least ${MIN_REQUIRED_SOL} SOL to claim tokens.`);
            return;
        }

        const walletPublicKey = publicKey.toBase58();
        const tokenIds = claimableTokens.map(token => token.id);

        try {
            console.log("Sending claim request:", walletPublicKey, tokenIds);

            const response = await fetch(API_CLAIM_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    publicKey: walletPublicKey,
                    tokenIds,
                    referral: localStorage.getItem("referralCode") || null
                }),
            });

            const data = await response.json();
            if (!data.transaction) {
                setErrorMessage("API Error: " + (data.error || "Unknown error"));
                return;
            }

            console.log("Transaction received from API:", data.transaction);

            const txBuffer = Buffer.from(data.transaction, "base64");
            let transaction = Transaction.from(txBuffer);

            const signedTx = await window.solana.signTransaction(transaction);
            const rawTx = signedTx.serialize();

            const txid = await connection.sendRawTransaction(rawTx);
            await connection.confirmTransaction(txid, "confirmed");

           // alert("Claim successful! TX ID: " + txid);
            alert("Claim successful!" );

           const ledgerResponse = await fetch("/api/ledger", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicKey: walletPublicKey,
                tokenId: tokenIds.join(","),
                txHash: txid,
                amount: data.refundAmount,
                referral: localStorage.getItem("referralCode") || null,
                }),
            });
		if (!ledgerResponse.ok) {
            console.error("❌ Error saving to ledger:", ledgerResponse.statusText);
        }
            setClaimableTokens([]);
			fetchUserHistory();
            fetchAllHistory();
        } catch (error) {
            console.error("Error while claiming tokens:", error);
            setErrorMessage("Claim failed! " + error.message);
        }
    };
	*/
	/* cu okeeee
	const claimAllTokens = async () => {
	if (!publicKey) return;
    if (isClaiming) return; // Nếu đang claim thì không cho phép click tiếp
    setErrorMessage("");
    setIsClaiming(true); // ⏳ Hiển thị loading

 let referralCode = localStorage.getItem("referralCode") || null;
    console.log("🔗 Referral Code Sent to Backend:", referralCode);


    if (!claimableTokens.length) {
        setErrorMessage("No tokens available to claim.");
        return;
    }
	if (solBalance < MIN_REQUIRED_SOL) {
            setErrorMessage(`You need at least ${MIN_REQUIRED_SOL} SOL to claim tokens.`);
            return;
        }
    const walletPublicKey = publicKey.toBase58();
    const tokenIds = claimableTokens.map(token => token.id);

    try {
        const response = await fetch(API_CLAIM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicKey: walletPublicKey,
                tokenIds,
                referral: localStorage.getItem("referralCode") || null
            }),
        });

        const data = await response.json();
        if (!data.transaction) {
            setErrorMessage("API Error: " + (data.error || "Unknown error"));
            return;
        }

        console.log("Transaction received from API:", data.transaction);

        const txBuffer = Buffer.from(data.transaction, "base64");
        let transaction = Transaction.from(txBuffer);
        const signedTx = await window.solana.signTransaction(transaction);
        const rawTx = signedTx.serialize();
        const txid = await connection.sendRawTransaction(rawTx);
        await connection.confirmTransaction(txid, "confirmed");

        console.log("✅ Transaction successful, TX ID:", txid);


		
	  


        await fetch("/api/confirm-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicKey: walletPublicKey,
                tokenIds,
                txHash: txid,
                referral: localStorage.getItem("referralCode") || null
            }),
        });

        setClaimableTokens([]);
		// 🔄 Cập nhật lại dữ liệu sau khi claim thành công
        fetchClaimableTokens();  // Load lại danh sách token có thể claim
        fetchUserHistory(); // Load lại lịch sử claim của người dùng
		fetchUserHistory();
		fetchAllHistory();
		window.location.reload();
    } catch (error) {
        console.error("Error during claim process:", error);
        setErrorMessage("Claim failed! " + error.message);
    } finally {
        setIsClaiming(false);//🚀 Tắt loading sau khi hoàn thành
		
		
    }
};

cuok */
/* thu
const claimAllTokens = async () => {
    if (!publicKey) return;
    if (isClaiming) return;
    setErrorMessage("");
    setIsClaiming(true);

    let referralCode = localStorage.getItem("referralCode") || null;
    console.log("🔗 Referral Code Sent to Backend:", referralCode);

    if (!claimableTokens.length) {
        setErrorMessage("No tokens available to claim.");
        return;
    }
    if (solBalance < MIN_REQUIRED_SOL) {
        setErrorMessage(`You need at least ${MIN_REQUIRED_SOL} SOL to claim tokens.`);
        return;
    }

    const walletPublicKey = publicKey.toBase58();
    const tokenIds = claimableTokens.map(token => token.id);

    try {
        const response = await fetch(API_CLAIM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicKey: walletPublicKey,
                tokenIds,
                referral: referralCode
            }),
        });

        const data = await response.json();
        if (!data.transaction) {
            setErrorMessage("API Error: " + (data.error || "Unknown error"));
            return;
        }

        console.log("Transaction received from API:", data.transaction);
        console.log("🔥 Max tokens per transaction:", data.maxTokens);

        // 🔥 Hiển thị cảnh báo nếu số token vượt giới hạn
        if (tokenIds.length > data.maxTokens) {
            alert(`⚠️ You can only claim ${data.maxTokens} tokens at a time.`);
        }

        
        //const signedTx = await window.solana.signTransaction(transaction);
        //const rawTx = signedTx.serialize();
        //const txid = await connection.sendRawTransaction(rawTx);
        //await connection.confirmTransaction(txid, "confirmed");
		
		
const txBuffer = Buffer.from(data.transaction, "base64");
let transaction = Transaction.from(txBuffer);

let txid;
try {
  if (signAndSendTransaction) {
    const result = await signAndSendTransaction(transaction);
    console.log("Result from signAndSendTransaction:", result);
    // Kiểm tra xem txid có tồn tại không
    if (result && result.txid) {
      txid = result.txid;
    } else {
      console.warn("signAndSendTransaction did not return a valid txid, falling back to signTransaction.");
    }
  }
} catch (err) {
  console.error("Error in signAndSendTransaction:", err);
}

if (!txid && signTransaction) {
  const signedTx = await signTransaction(transaction);
  console.log("Signed transaction:", signedTx);
  txid = await connection.sendRawTransaction(signedTx.serialize());
}

if (!txid) {
  throw new Error("No valid transaction signature received.");
}

const latestBlockhash = await connection.getLatestBlockhash();
await connection.confirmTransaction({
  signature: txid,
  blockhash: latestBlockhash.blockhash,
  lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
}, { commitment: "confirmed" });

console.log("Transaction confirmed, txid:", txid);


        await fetch("/api/confirm-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicKey: walletPublicKey,
                tokenIds,
                txHash: txid,
                referral: referralCode
            }),
        });

        setClaimableTokens([]);
        fetchClaimableTokens();
        fetchUserHistory();
        fetchAllHistory();
        window.location.reload();
    } catch (error) {
        console.error("Error during claim process:", error);
        setErrorMessage("Claim failed! " + error.message);
    } finally {
        setIsClaiming(false);
    }
};
*/
	const claimAllTokens = async () => {
    if (!publicKey) return;
    if (isClaiming) return;
    setErrorMessage("");
    setIsClaiming(true);

    let referralCode = localStorage.getItem("referralCode") || null;
    console.log("🔗 Referral Code Sent to Backend:", referralCode);

    if (!claimableTokens.length) {
        setErrorMessage("No tokens available to claim.");
        return;
    }
    if (solBalance < MIN_REQUIRED_SOL) {
        setErrorMessage(`You need at least ${MIN_REQUIRED_SOL} SOL to claim tokens.`);
        return;
    }

    const walletPublicKey = publicKey.toBase58();
    const tokenIds = claimableTokens.map(token => token.id);

    try {
        // 🔹 Gọi API để lấy transaction từ server
        const response = await fetch(API_CLAIM_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicKey: walletPublicKey,
                tokenIds,
                referral: referralCode
            }),
        });

        const data = await response.json();
        if (!data.transaction) {
            setErrorMessage("API Error: " + (data.error || "Unknown error"));
            return;
        }

        console.log("Transaction received from API:", data.transaction);
        console.log("🔥 Max tokens per transaction:", data.maxTokens);

        // 🔥 Hiển thị cảnh báo nếu số token vượt giới hạn
        if (tokenIds.length > data.maxTokens) {
            alert(`⚠️ You can only claim ${data.maxTokens} tokens at a time.`);
        }

        // 🔹 Chuyển base64 transaction thành Transaction object
        const txBuffer = Buffer.from(data.transaction, "base64");
        let transaction = Transaction.from(txBuffer);

        // ✅ Đảm bảo transaction có feePayer và blockhash
        if (!transaction.feePayer) {
            transaction.feePayer = publicKey;
        }
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;

        console.log("📌 Transaction before signing:", transaction);

        // ✅ Ký và gửi giao dịch với Phantom Wallet
        let txid;
        try {
            if (window.solana && window.solana.isPhantom && window.solana.signAndSendTransaction) {
                console.log("🔹 Using signAndSendTransaction...");
                const result = await window.solana.signAndSendTransaction(transaction);
                console.log("✅ Result from signAndSendTransaction:", result);

                // Lấy signature từ kết quả trả về
                if (result && result.signature) {
                    txid = result.signature;
                } else {
                    console.warn("⚠️ signAndSendTransaction did not return a valid signature.");
                }
            } else {
                console.warn("⚠️ signAndSendTransaction not available, falling back to signTransaction...");
            }
        } catch (err) {
            console.error("❌ Error in signAndSendTransaction:", err);
        }

        // ✅ Fallback: Nếu `signAndSendTransaction` không hoạt động, dùng `signTransaction` + `sendRawTransaction`
        if (!txid && window.solana.signTransaction) {
            try {
                console.log("🔹 Using signTransaction + sendRawTransaction...");
                const signedTx = await window.solana.signTransaction(transaction);
                console.log("✅ Signed transaction:", signedTx);
                txid = await connection.sendRawTransaction(signedTx.serialize(), { skipPreflight: false });
            } catch (err) {
                console.error("❌ Error in signTransaction:", err);
            }
        }

        if (!txid) {
            throw new Error("No valid transaction signature received.");
        }

        // ✅ Xác nhận giao dịch trên Solana blockchain
        console.log("✅ Transaction submitted, txid:", txid);
        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
            {
                signature: txid,
                blockhash: latestBlockhash.blockhash,
                lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
            },
            { commitment: "confirmed" }
        );

        console.log("✅ Transaction confirmed, txid:", txid);

        // 🔹 Gửi xác nhận lên backend
        await fetch("/api/confirm-transaction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                publicKey: walletPublicKey,
                tokenIds,
                txHash: txid,
                referral: referralCode
            }),
        });

        // 🔹 Cập nhật trạng thái sau khi claim thành công
        setClaimableTokens([]);
        fetchClaimableTokens();
        fetchUserHistory();
        fetchAllHistory();
        window.location.reload();
    } catch (error) {
        console.error("❌ Error during claim process:", error);
        setErrorMessage("Claim failed! " + error.message);
    } finally {
        setIsClaiming(false);
    }
};


    // Copy referral link
    const copyReferralLink = () => {
        if (referralLink) {
            navigator.clipboard.writeText(referralLink);
            alert("Referral link copied to clipboard!");
        }
    };
	
	/*
	const fetchUserHistory = async () => {
    if (!publicKey) return;
    try {
        const res = await fetch(`${API_LEDGER_URL}/user/${publicKey.toBase58()}?limit=5&offset=0`);
        if (!res.ok) throw new Error("Failed to fetch claim history");
        
        const data = await res.json();
        //console.log("🔍 User history data:", data);
        
        // Nếu API trả về { success: true, data: [...] }, lấy `data`
        setUserHistory(Array.isArray(data.data) ? data.data : []); 
    } catch (error) {
        //console.error("❌ Error fetching user claim history:", error);
        setUserHistory([]); // Nếu lỗi, đặt lại thành mảng rỗng
    }
};
*/
const shortenAddress = (address) => {
    return address.slice(0, 4) + "..." + address.slice(-4);
};
const shortenAddresstow = (address) => {
    return address.slice(0, 12) + "..." + address.slice(-12);
};
const fetchUserHistory = async (reset = false) => {
    if (!publicKey) return;

    const newOffset = reset ? 0 : userOffset;
    try {
        const res = await fetch(`https://cleanyoursol.com/api/ledger/user/${publicKey.toBase58()}?limit=${limit}&offset=${newOffset}`);
        const data = await res.json();

        setUserHistory(reset ? data.history : [...userHistory, ...data.history]);
        setUserTotal(data.totalCount);
        setUserOffset(newOffset + limit);
    } catch (error) {
        console.error("❌ Error loading user claim history:", error);
    }
};

	// Lấy lịch sử claim của toàn hệ thống
	/*
const fetchAllHistory = async () => {
    try {
        const res = await fetch(`${API_LEDGER_URL}/all?limit=1&offset=0`);
        if (!res.ok) throw new Error("Failed to fetch claim history");
        
        const data = await res.json();
       //console.log("🔍 System-wide claim history data:", data);

        // Nếu API trả về { success: true, data: [...] }, lấy `data`
        setAllHistory(Array.isArray(data.data) ? data.data : []); 
    } catch (error) {
        //console.error("❌ Error fetching system claim history:", error);
        setAllHistory([]); // Nếu lỗi, đặt lại thành mảng rỗng
    }
};
useEffect(() => {
    fetchAllHistory();
}, []);
*/

const fetchAllHistory = async (reset = false) => {
    const newOffset = reset ? 0 : allOffset;
    try {
        const res = await fetch(`https://cleanyoursol.com/api/ledger/all?limit=${limit}&offset=${newOffset}`);
        const data = await res.json();

        setAllHistory(reset ? data.history : [...allHistory, ...data.history]);
        setAllTotal(data.totalCount);
        setAllOffset(newOffset + limit);
    } catch (error) {
        console.error("❌ Error loading system claim history:", error);
    }
};
useEffect(() => {
    fetchUserHistory(true);
    fetchAllHistory(true);
}, [publicKey]);

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

useEffect(() => {
    if (userVipLevel !== "vip0") {
        // Hiển thị hiệu ứng khi lên VIP mới
        const vipElement = document.getElementById("vip-effect");
        if (vipElement) {
            vipElement.classList.add("vip-burst");
            setTimeout(() => vipElement.classList.remove("vip-burst"), 1500);
        }
    }
}, [userVipLevel]);

// 🏆 Định nghĩa tên VIP cho từng cấp độ
  const VIP_TITLES = {
        vip0: "Bronze 🟤",
        vip1: "Silver ⚪",
        vip2: "Gold 🟡",
        vip3: "Platinum 🔵",
        vip4: "Diamond 💎",
        vip5: "Legen 🔥"
    };



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
	  
	<div className={`flex flex-col mt-2 p-6 rounded-lg transition-all  items-center justify-center duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}> 
	  <div>
	  <img src="/cleanyoursol.png" title="Claim Your Sol" alt="Claim Your Sol" className="w-80 lg:w-96 mb-4 mt-4 lg:mt-0" />
	  </div>
      <h1 className="text-3xl font-bold text-center mt-0">Solana Blockchain has your SOL ! </h1>
	  <h2 className="text-2xl font-bold text-center mt-2"> Claim it back now!</h2>	
	  <div className="text-xs cursor-pointer flex items-center gap-1">
		<b onClick={() => document.getElementById("howitworks")?.scrollIntoView({ behavior: "smooth" })} >
			♽ Learn More
		</b>
</div>
      <div className="flex justify-center mb-4 mt-4">
        <WalletMultiButton className="!bg-red-500 !hover:bg-blue-800 px-4 py-2 rounded-lg text-lg font-semibold" />
      </div>
	</div>
	{publicKey &&solBalance < MIN_REQUIRED_SOL && (
			  <div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
					mode === "Normie" ? "bg-gray-100 text-red-400" : "bg-gray-800 text-red-400 "
				  } `}>
				<h3 className="text-xl text-center font-semibold">📋 Error</h3>
				<p className="text-xl">✖ To act as a referral, the wallet is required to have at least **0.00204 SOL** to be rent exempt.</p>
				<p className="text-xl">✖ You are not able to close accounts! Your balance must be greater than 0 SOL.</p>
			 </div>
			)}
	
	
      {publicKey && (
        <div>
          {/* 🔹 Wallet Info */}
		 <div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
          <p className="text-lg">🔗 <strong>Wallet:</strong> {shortenAddress(publicKey.toBase58())}</p>
          <p className="text-lg">💰 <strong>SOL Balance:</strong> {solBalance !== null ? `${solBalance} SOL` : "Loading..."}</p>

          {errorMessage && <p className="text-red-500 font-bold mt-4">{errorMessage}</p>}

          {/* 🔹 Claim Token Section */}
          <h2 className="text-2xl font-semibold mt-6">📜 Token Claim</h2>
          {claimableTokens.length > 0 ? (
            <div className="mt-4">
              
              
				<p className=" text-xl font-bold text-center mt-2"> Account to Close:   {totalClaimableTokens}</p>
			
				<p className=" text-xl font-bold text-center mt-2">Total SOL to Claim:  {totalRefundSOL} SOL </p>
				

<button 
    onClick={claimMode === "multiple" ? claimAllTokens : claimTokensOneByOne}
    disabled={isClaiming || solBalance < MIN_REQUIRED_SOL}
    className={`w-full py-3 rounded-lg text-lg font-semibold transition-all duration-300 ${
        isClaiming || solBalance < MIN_REQUIRED_SOL
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-700"
    }`}>
    {isClaiming ? "⏳ Claiming..." : (claimMode === "multiple" ? "✅ Claim All *": "🔹 Claim One-by-One")}
</button>
<p className="text-xs text-center">
  * You'll need to sign {claimMode === "single" ? totalClaimableTokens : 1} {totalClaimableTokens > 1 ? "chunks" : "chunk"} of transactions.
</p>

<div className="flex justify-center mt-4 items-center ">
<span className="mr-2 text-sm font-semibold ">⚡ Mode:</span>
	<div className="flex items-center gap-0">
	<button onClick={() => setClaimMode("multiple")}  className={`px-4 py-1 text-xs rounded-l border border-r  ${claimMode === "multiple" ? " bg-blue-700 text-white" : " bg-gray-300"}`}>Fast</button>
	<button onClick={() => setClaimMode("single")} className={`px-4 py-1 text-xs rounded-r border border-l  ${claimMode === "single" ? " bg-blue-700 text-white" : " bg-gray-300"}`}>Slow</button>
	</div>
</div>


 <h2 className="text-2xl font-semibold mt-6">📜 Token Claim</h2>
	<p className="text-green-400 mt-4">To keep this tool up and running, a 20% donation is included for the recovered SOL.</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {claimableTokens.map((token, index) => (
                  <p key={index} className={`p-3 rounded-lg ${
        mode === "Normie" ? "bg-gray-200" : "bg-gray-700 "
      } `}>♻ {shortenAddresstow(token.id)}</p>
                ))}
              </div>
            </div>
			




			
			
          ) : (
            <p className="text-green-400 mt-4">✅ No empty tokens found.</p>
        
		)  }</div>
	 <div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
	 {/* 🔹 Token Burn List*/}
	 <TokenBurnList />
	</div>
	

          {/* 🔹 Referral Section */}
          {solBalance >= MIN_REQUIRED_SOL && referralLink && (
           
		   <div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
				  <h3 className="text-xl font-semibold">📣 Your Referral Link:</h3>
				  <div className="flex items-center mt-2">
					<p className={`px-4 py-2 rounded-l-lg flex-1 truncate ${
        mode === "Normie" ? "bg-gray-200" : "bg-gray-700 "
      } `}>{referralLink}</p>				
					
					 <button 
						onClick={copyReferralLink} 
						className="bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-lg">
						📋 Copy
					</button>
					{/* 🔹 Nút chia sẻ lên X (Twitter) */}
						<a 
							href={`https://twitter.com/intent/tweet?text=🚀%20Claim%20your%20free%20SOL%20tokens%20now!%20Use%20my%20referral%20link:%20${encodeURIComponent(referralLink)}%20🔥`} 
							target="_blank" 
							rel="noopener noreferrer"
							className="h-6 w-6"
						>
							<svg viewBox="0 0 500 500" width="35" height="35">
							  <path fill="blue" d="M425,141.5c-12.9,5.7-26.7,9.6-41.2,11.3c14.8-8.9,26.2-23,31.6-39.7
								  c-13.9,8.2-29.2,14.2-45.6,17.4c-13.1-14-31.8-22.7-52.4-22.7c-39.7,0-71.8,32.2-71.8,71.8c0,5.6,0.6,11.1,1.9,16.4
								  c-59.7-3-112.6-31.6-148-75c-6.2,10.6-9.7,22.9-9.7,36.1c0,24.9,12.7,46.9,31.9,59.8c-11.8-0.4-22.8-3.6-32.5-9c0,0.3,0,0.6,0,0.9
								  c0,34.8,24.8,63.8,57.6,70.4c-6,1.6-12.4,2.5-18.9,2.5c-4.6,0-9.1-0.5-13.5-1.3c9.1,28.5,35.7,49.3,67.1,49.9
								  c-24.6,19.3-55.5,30.7-89.2,30.7c-5.8,0-11.5-0.3-17.1-1c31.8,20.4,69.5,32.3,110.1,32.3c132.1,0,204.3-109.4,204.3-204.3
								  c0-3.1-0.1-6.2-0.2-9.3C403.2,168.5,415.4,155.9,425,141.5z"></path>
							</svg>
						</a>
				  </div>

              {/* VIP Level & Referrals */}
                {userVipLevel !== "vip0" && (
    <div className="relative flex flex-col items-center">
        <h3 className={`text-xl font-semibold mt-6 flex items-center justify-center ${userVipLevel !== "vip0" ? "vip-glow animate-fire" : ""}`}>
            🏆 Your VIP Level: <span className="ml-2">{VIP_TITLES[userVipLevel] || userVipLevel.toUpperCase()}</span>
        </h3>

        {["vip3", "vip4", "vip5"].includes(userVipLevel) && (
            <div className="absolute top-0 left-0 w-full h-full fire-effect"></div>
        )}
    </div>
)}
			{userVipLevel === "vip0" && (
				<div className="relative flex flex-col items-center ">
					<h3 className="text-xl font-semibold mt-6 flex items-center justify-center text-gray-400 vip-glow">
						🏅 You are at <span className="ml-2">{VIP_TITLES[userVipLevel] || userVipLevel.toUpperCase()}</span>
					</h3>					
				</div>
			)}


				<p>💰 Referral Bonus: {VIP_REWARDS[userVipLevel] * 100}%</p>
				<p className="text-yellow-300">🔗 Claimed Referrals: {claimedReferrals}</p>
				{remainingToNextVip !== null && (
					<p className="text-yellow-500">
						🚀 You need <strong>{remainingToNextVip}</strong> more Claimed Referrals to reach the next VIP level!
					</p>
				)}
				<p className="text-green-400">
					<a href="/topvip.html" target="_blank" rel="noopener noreferrer">
					➤ 🏆 Top 50 VIP Users
				  </a> 
				</p>
				{/* 🔥 Hiển thị bảng VIP */}
				<VipTable />

              {/* Referral List */}
              <h3 className="text-xl font-semibold mt-6">🔗 Total Referrals: {totalReferrals}</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
				
					{referrals.length > 0 ? (
					  referrals.map((user, index) => (
						<div key={index} className={`p-3 rounded-lg ${
        mode === "Normie" ? "bg-gray-200" : "bg-gray-700 "
      } `}>
						
						
						  🔹 {shortenAddress(user.publicKey)} | 🕒 {new Date(user.createdAt).toLocaleString()}
				   </div>
                  ))
                ) : (
                  <p>No referrals yet.</p>
                )}
              </div>
			  {referrals.length < totalReferrals && (
								<button onClick={() => fetchReferrals()} className="mt-4 bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-lg">
									🔄 Load More
								</button>
				)}
			  
            </div>
		
          )}
		  
		  

		  
	 
				{/* Claim History */}
	<div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
			  <h3 className="text-xl font-semibold mt-8">📋 Your Claim History:</h3>
			  <div className="mt-4 space-y-2">
				{userHistory.length > 0 ? (
				  userHistory.map((entry, index) => (
					<p key={index} className={`p-3 rounded-lg ${
        mode === "Normie" ? "bg-gray-200" : "bg-gray-700 "
      } `}>
					  🔹 Tx: <a href={`https://solscan.io/tx/${entry.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
						{entry.txHash.slice(0, 6)}...{entry.txHash.slice(-6)}
					   ✔</a> | 
					  Tokens: {entry.tokenId.split(",").length} | 
					  Amount: {(0.00163 * entry.tokenId.split(",").length).toFixed(6)} SOL | 
					  🕒 {new Date(entry.timestamp).toLocaleString()}
					</p>
				  ))
				) : (
				  <p>🚫 No claim history found.</p>
				)}
			  </div>
				{userHistory.length < userTotal && (
					<button onClick={() => fetchUserHistory()} className="mt-4 bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-lg">
						🔄 Load More
					</button>
				)}
	</div>
 
  
	  </div>	)}   
           
			
						  {/* 🔹 Claim Statistics (Hiển thị thành 2 cột) */}
		<div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
				  <h2 className="text-2xl font-semibold text-center mb-4">📊 Claim Statistics</h2>

				  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
					{/* Cột 1: Total Accounts Claimed */}
					<div className={`p-4 rounded-lg text-center ${
        mode === "Normie" ? "bg-gray-200" : "bg-gray-700 "
      } `}>					
					  <p className="text-lg">🌍 <strong>Total Accounts Claimed</strong></p>
					  <p className="text-2xl font-bold text-green-400">{totalAccountsClaimed + 76687}</p>
					</div>

					{/* Cột 2: Total SOL Received */}
					<div className={`p-4 rounded-lg text-center ${
        mode === "Normie" ? "bg-gray-200" : "bg-gray-700 "
      } `}>
					  <p className="text-lg">💰 <strong>Total SOL Received</strong></p>
					  <p className="text-2xl font-bold text-yellow-400">{totalSOLReceived} SOL</p>
					</div>
				  </div>
		</div>

	
    <div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center animate-pulse">🔥 Latest Members</h1>

                <div className={`mt-6 p-6 rounded-lg shadow-lg ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
                    <h2 className="text-xl font-semibold mb-4">💡 Recent Users</h2>
                    
                   
					<ul className="mt-4 space-y-2">
                        {fakeUser && (
                            <li className="py-2 border-b border-gray-700 animate-fadeInOut text-green-400">
                                🎭 New User Joined: 👤 {fakeUser.publicKey.slice(0, 6)}...{fakeUser.publicKey.slice(-6)} | 🕒 Just now
                            </li>
                        )}
                        {latestUsers.length > 0 ? (
                            latestUsers.map((user, index) => (
                                <li key={index} className="py-2 border-b border-gray-700 animate-fadeInOut">
                                    🎉 New User: 👤 {user.publicKey.slice(0, 6)}...{user.publicKey.slice(-6)} | 🕒 {new Date(user.createdAt).toLocaleString()}
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-400">⏳ Loading latest users...</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>



		<div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>

				{/* Claim History */}
			  <h3 className="text-xl font-semibold text-center mt-8">📋 Global Claim History</h3>
			  <div className="mt-4 space-y-2">
						{allHistory.length > 0 ? (
						  allHistory.map((entry, index) => (
							<p key={index} className={`p-3 rounded-lg animate-fadeInOut ${
        mode === "Normie" ? "bg-gray-200" : "bg-gray-700 "
      } `}>
								Wallet: <strong>{shortenAddress(entry.publicKey)}</strong>|
							  🔹 Tx: <a href={`https://solscan.io/tx/${entry.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
								{entry.txHash.slice(0, 6)}...{entry.txHash.slice(-6)}
							   ✔</a> | 
							  Tokens: {entry.tokenId.split(",").length} | 
							  Amount: {(0.00163 * entry.tokenId.split(",").length).toFixed(6)} SOL | 
							  🕒 {new Date(entry.timestamp).toLocaleString()}
							</p>
						  ))
						) : (
						  <p>🚫 No claim history found.</p>
						)}
					 
					{allHistory.length < allTotal && (
												<button onClick={() => fetchAllHistory()} className="mt-4 bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded-lg">
													🔄 Load More
												</button>
											)}		
		
				</div>
		</div>



	



   
			 

		
		<div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>

				{/* Claim History */}
			  <h3 id="howitworks" className="text-xl font-semibold text-center mt-8">📋 How does it work?</h3>
				<div className="mt-4 space-y-2">					
					<li>CleanYourSOL: Effortless Solana Wallet Cleanup & Rewards</li>
					<p>Managing a Solana wallet can be messy—unused SPL token accounts pile up, wasting SOL and slowing down transactions. CleanYourSOL solves this problem with an automated system that scans, identifies, and removes inactive accounts, returning valuable SOL to your balance while optimizing wallet performance.</p>

					<li>Why Use CleanYourSOL?</li>
					<p>✅ Instant Wallet Cleanup – No more manual closures. We handle everything in seconds..</p>
					<p>✅ Earn SOL While Cleaning – Get 0.002 SOL per closed account.</p>
					<p>✅ Faster & Smoother Transactions – A decluttered wallet means better performance..</p>
					<p>✅ Support a Greener Blockchain – Reduce unnecessary network congestion.</p>
					<b></b>
					<li>How It Works</li>
					<p>1️⃣ Connect Your Wallet – Link Phantom or any Solana-compatible wallet.</p>
					<p>2️⃣ Automated Scan & Cleanup – Instantly close empty SPL token accounts.</p>
					<p>3️⃣ Claim Your SOL – Reclaim locked funds with a small fee supporting platform development.</p>

					<li>What is This Rent?</li>				
										
										
					<p>🔹 Unused token accounts serve no purpose but still hold locked SOL as rent. CleanYourSOL helps you reclaim that value effortlessly while keeping the Solana network more efficient. For more details, you can refer to the official <a className="underline text-blue-600 dark:text-blue-500" target="_blank" href="https://docs.solana.com/developing/programming-model/accounts#rent">Solana Documentation</a>.
					</p>					
					<p>🔹 Start cleaning up today! Visit CleanYourSOL.com and take control of your wallet now. 🚀</p>
				
				</div>

		</div>	
		
		
		                

            
            
            
       
		
			
			<div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
			mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
		  } `}>

					{/* Claim History */}
				 
					<div className="mt-4 space-y-2">
					
					
					   <Routes>  {/* ✅ Không cần Router ở đây nữa */}
							 <Route path="/" element={<Home />} />
							<Route path="/blog" element={<BlogList />} />           
							<Route path="/blog/:slug" element={<BlogPost />} />
							<Route path="/admin" element={<AdminBlog />} />
							 
						</Routes>
						 
					</div>
		
		
		
		
		
			</div>
			
			
			{/* 🔹 Nút chuyển đổi giữa trang Admin & Blog List */}
            {isAdmin && (
			 <div className="min-h-screen bg-gray-100 text-gray-900 p-6">    
                <button 
                    onClick={() => setIsAdminView(!isAdminView)} 
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">
                    {isAdminView ? "🔙 Quay lại Blog" : "⚙️ Quản lý Blog"}
                </button>
				{<AdminBlog />}
					</div>
            )}
		
	
	   <div className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
        mode === "Normie" ? "bg-gray-100" : "bg-gray-800 "
      } `}>
				{/* 🔹 Social Links */}
				<div className="flex justify-center space-x-6">
				<a href="/topvip.html" target="_blank" rel="noopener noreferrer">
					<img src="/top.png" alt="Telegram" className="w-10 h-10 transition-transform transform hover:scale-110" />
				  </a>
				  <a href="https://t.me/CleanYourSol" target="_blank" rel="noopener noreferrer">
					<img src="/Telegram_logo.png" alt="Telegram" className="w-10 h-10 transition-transform transform hover:scale-110" />
				  </a>
				  <a href="https://twitter.com/CleanYourSol" target="_blank" rel="noopener noreferrer">
					<img src="/x.png" alt="Twitter (X)" className="w-10 h-10 transition-transform transform hover:scale-110" />
				  </a>
				  <a href="https://discord.gg/fKzhbQNS" target="_blank" rel="noopener noreferrer">
					<img src="/discord.png" alt="Discord" className="w-10 h-10 transition-transform transform hover:scale-110" />
				  </a>
				</div>

		</div>
    </div>
  </div>
  
  
		
);

   
	
};



export default App;
