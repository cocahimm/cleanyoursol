// controllers/burnController.js
 /* burn oke 
const { Connection, PublicKey, Transaction,LAMPORTS_PER_SOL,SystemProgram   } = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");




// Kết nối đến RPC (sử dụng biến môi trường nếu có)

//const SOLANA_RPC_URL = "https://dry-proportionate-forest.SOLANA_MAINNET.quiknode.pro/1498825df452809193385294a8b7aa31da700a02";
//const connection = new Connection(SOLANA_RPC_URL, "confirmed");
const connection = new Connection("https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02", "confirmed");

/**
 * POST /burn
 * Body payload:
 * {
 *   wallet: "wallet address string",
 *   tokens: [
 *     {
 *       mint: "token mint address string",
 *       balance: number,         // số lượng token (đã convert sang dạng float theo UI)
 *       decimals: number         // số chữ số thập phân của token
 *     },
 *     ...
 *   ]
 * }
 *
 * Mục đích: Tạo một Transaction gồm các instruction để burn toàn bộ số token được chọn
 * và đóng tài khoản token (để thu hồi SOL rent).
 * Transaction sẽ được serialize (chưa ký) và trả về cho frontend dưới dạng base64.
 */
 
/*
exports.burnTokens = async (req, res) => {
  try {
    const { wallet, tokens } = req.body;
    if (!wallet || !tokens || !Array.isArray(tokens)) {
      return res.status(400).json({ error: "Missing wallet or tokens" });
    }
    
    const walletPubkey = new PublicKey(wallet);
    const transaction = new Transaction();
    
    // Với mỗi token được chọn, tạo instruction burn và đóng tài khoản
    for (const token of tokens) {
      const mintPubkey = new PublicKey(token.mint);
      
      // Lấy tài khoản token (Associated Token Account) của ví với token mint đó
      const tokenAccount = await getAssociatedTokenAddress(mintPubkey, walletPubkey);
      
      // Tính số token cần burn theo đơn vị nhỏ nhất (token amount * 10^decimals)
      const amount = BigInt(Math.floor(token.balance * Math.pow(10, token.decimals)));
      
      // Tạo instruction burn
      const burnIx = createBurnCheckedInstruction(
        tokenAccount, // token account của ví
        mintPubkey,   // token mint address
        walletPubkey, // chủ sở hữu token account
        amount,       // số token burn (đã chuyển về đơn vị nhỏ nhất)
        token.decimals,
        undefined,    // có thể truyền authority nếu cần
        TOKEN_PROGRAM_ID
      );
      transaction.add(burnIx);
      
      // Tạo instruction đóng tài khoản token để thu hồi rent
      const closeIx = createCloseAccountInstruction(
        tokenAccount, // tài khoản token cần đóng
        walletPubkey, // địa chỉ nhận SOL trả về (chính là ví)
        walletPubkey, // authority đóng
        [],
        TOKEN_PROGRAM_ID
      );
      transaction.add(closeIx);
    }
    
    // Lấy recent blockhash và set feePayer
    // Tạo transaction mới
	
	// Lấy latest blockhash và set feePayer
	const { blockhash } = await connection.getLatestBlockhash();
	transaction.recentBlockhash = blockhash;
	transaction.feePayer = walletPubkey;

    
    
    // Serialize transaction chưa ký (frontend sẽ ký)
    const serializedTx = transaction.serialize({ requireAllSignatures: false });
    const txBase64 = serializedTx.toString("base64");
    
    // Trả về transaction (chưa ký) cho frontend
    res.json({ tx: txBase64 });
  } catch (error) {
    console.error("Error in burnTokens:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
het burn ok */ 
/*
// controllers/burnController.js
const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const fetch = require("node-fetch");

// Giả sử bạn sử dụng mô hình TransactionModel và UserModel để lưu giao dịch và thông tin người dùng
const TransactionModel = require("../models/transactionModel");
const UserModel = require("../models/user");

// Endpoint RPC của bạn
const SOLANA_RPC_URL = "https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Các hằng số cấu hình
const BURN_WALLET = "11111111111111111111111111111111"; // Ví burn mặc định
const ADMIN_WALLET = new PublicKey(process.env.ADMIN_WALLET); // Ví admin nhận phí (thay bằng địa chỉ thực)
const CLAIM_REWARD_SOL = 0.00203; // SOL hoàn trả mỗi token rỗng
const FEE_PERCENT = 0.20; // 20% phí bị trừ
const REFERRAL_PERCENT = {
  vip0: 0.02,
  vip1: 0.025,
  vip2: 0.03,
  vip3: 0.035,
  vip4: 0.04,
  vip5: 0.05,
};

/**
 * Endpoint POST /burn-claim
 *
 * Input body:
 * {
 *   wallet: string,          // ví của người dùng
 *   tokens: [ { mint: string, balance: number, decimals: number }, ... ],
 *   txHash: string (optional),  // nếu chưa có thì trả về giao dịch burn để ký
 *   vipLevel: string         // cấp VIP của người dùng, ví dụ "vip0"
 * }
 *
 * Nếu không có txHash, tạo và trả về giao dịch burn token (chưa ký).
 * Nếu có txHash, nghĩa là giao dịch burn đã được gửi, tiến hành:
 *  - Lấy danh sách token account của user có số dư = 0 (token rỗng).
 *  - Tính tổng SOL thu hồi: totalClaimSOL = số token rỗng * CLAIM_REWARD_SOL.
 *  - Tính phí: feeAmount = totalClaimSOL * FEE_PERCENT.
 *  - Nếu có referral, referralReward = feeAmount * REFERRAL_PERCENT[vipLevel] và adminFee = feeAmount - referralReward.
 *  - Tạo giao dịch claim: chuyển netClaimSOL = totalClaimSOL - feeAmount từ ADMIN_WALLET sang ví user;
 *    nếu có referralReward, chuyển từ ADMIN_WALLET sang ví referrer (userDoc.referredBy).
 *  - Lưu thông tin giao dịch vào DB.
 */
 /*
const burnAndClaimTokens = async (req, res) => {
  try {
    const { wallet, tokens, txHash, vipLevel } = req.body;
    if (!wallet || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: "🚨 Cần cung cấp wallet và danh sách token để burn!" });
    }
    const userPubKey = new PublicKey(wallet);

    // Nếu chưa có txHash, tạo transaction burn token để trả về cho client ký
    if (!txHash) {
      const transaction = new Transaction();
      for (const token of tokens) {
        const mintPubKey = new PublicKey(token.mint);
        // Lấy Associated Token Account của user
        const userTokenAccount = await getAssociatedTokenAddress(mintPubKey, userPubKey);
        // Tính số token cần burn (chuyển đổi sang đơn vị nhỏ nhất)
        const amount = BigInt(Math.floor(token.balance * Math.pow(10, token.decimals)));
        // Instruction burn token
        const burnIx = createBurnCheckedInstruction(
          userTokenAccount,
          mintPubKey,
          userPubKey,
          amount,
          token.decimals,
          undefined,
          TOKEN_PROGRAM_ID
        );
        transaction.add(burnIx);
        // Instruction đóng tài khoản token
        const closeIx = createCloseAccountInstruction(
          userTokenAccount,
          userPubKey,
          userPubKey,
          [],
          TOKEN_PROGRAM_ID
        );
        transaction.add(closeIx);
      }
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubKey;
      const serializedTx = transaction.serialize({ requireAllSignatures: false });
      const txBase64 = serializedTx.toString("base64");
      return res.json({ success: true, burnTransaction: txBase64 });
    }

    // Nếu có txHash, nghĩa là giao dịch burn đã thành công, tiến hành claim token rỗng
    const emptyAccounts = await connection.getParsedTokenAccountsByOwner(userPubKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    const claimableTokens = emptyAccounts.value.filter(
      (account) => account.account.data.parsed.info.tokenAmount.uiAmount === 0
    );
    if (claimableTokens.length === 0) {
      return res.status(400).json({ error: "❌ Không có token rỗng để claim!" });
    }

    // Tính tổng SOL thu hồi được từ token rỗng
    const totalClaimSOL = claimableTokens.length * CLAIM_REWARD_SOL;
    let feeAmount = totalClaimSOL * FEE_PERCENT; // Phí 20%
    let netClaimSOL = totalClaimSOL - feeAmount;
    let referralReward = 0;
    let adminFee = feeAmount;

    // Kiểm tra referral: Tìm người giới thiệu của user
    const userDoc = await UserModel.findOne({ publicKey: wallet });
    if (userDoc && userDoc.referredBy) {
      const referrer = await UserModel.findOne({ referralCode: userDoc.referredBy });
      if (referrer) {
        const vip = vipLevel || "vip0";
        referralReward = feeAmount * (REFERRAL_PERCENT[vip] || 0);
        adminFee = feeAmount - referralReward;
      }
    }

    console.log("Total Claim SOL:", totalClaimSOL);
    console.log("Fee Amount:", feeAmount);
    console.log("Referral Reward:", referralReward);
    console.log("Net Claim SOL:", netClaimSOL);

    // Tạo giao dịch claim: chuyển netClaimSOL từ ADMIN_WALLET sang ví user
    const claimTx = new Transaction();
    claimTx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(ADMIN_WALLET),
        toPubkey: userPubKey,
        lamports: Math.floor(netClaimSOL * 1e9),
      })
    );
    if (referralReward > 0) {
      // Giả sử userDoc.referredBy chứa địa chỉ ví của referrer
      claimTx.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(ADMIN_WALLET),
          toPubkey: new PublicKey(userDoc.referredBy),
          lamports: Math.floor(referralReward * 1e9),
        })
      );
    }
    // Thêm instruction chuyển adminFee từ ADMIN_WALLET về ADMIN_WALLET (để lưu giao dịch)
    claimTx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(ADMIN_WALLET),
        toPubkey: new PublicKey(ADMIN_WALLET),
        lamports: Math.floor(adminFee * 1e9),
      })
    );
    const { blockhash: claimBlockhash } = await connection.getLatestBlockhash();
    claimTx.recentBlockhash = claimBlockhash;
    // Người dùng chịu phí giao dịch claim (hoặc bạn có thể đặt ADMIN_WALLET làm feePayer)
    claimTx.feePayer = userPubKey;
    const serializedClaimTx = claimTx.serializeMessage().toString("base64");

    // Lưu giao dịch vào DB (ledger) để cập nhật lịch sử claim chung
    const newLedgerEntry = new TransactionModel({
      publicKey: wallet,
      txHash: txHash, // hash giao dịch burn
      tokenId: claimableTokens.map((t) => t.pubkey.toBase58()).join(","),
      amount: netClaimSOL,
      referral: userDoc ? userDoc.referredBy || null : null,
      fee: feeAmount,
      adminFee: adminFee,
      referralFee: referralReward,
      type: "burn-claim",
      timestamp: new Date(),
    });
    await newLedgerEntry.save();

    return res.json({
      success: true,
      burnTxHash: txHash,
      claimTransaction: serializedClaimTx,
      claimAmount: netClaimSOL,
      feeAmount,
      referralReward,
      adminAmount: adminFee,
      ledgerEntry: newLedgerEntry,
    });
  } catch (error) {
    console.error("❌ Error in burnAndClaimTokens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  burnAndClaimTokens,
  // Nếu cần, bạn cũng có thể export burnTokens và claimEmptyTokens riêng nếu có định nghĩa
};

burn cũ nhưng xóa dc, chưa thanh toán dc cho ad */

// controllers/burnController.js
/*
const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const fetch = require("node-fetch");

const TransactionModel = require("../models/transactionModel");
const UserModel = require("../models/user");

// Sử dụng RPC endpoint của bạn
const SOLANA_RPC_URL = "https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Cấu hình hằng số
const BURN_WALLET = "11111111111111111111111111111111"; // Ví burn mặc định
const ADMIN_WALLET = new PublicKey(process.env.ADMIN_WALLET); // Thay bằng địa chỉ ví admin thật
const CLAIM_REWARD_SOL = 0.00203; // SOL hoàn trả mỗi token rỗng
const FEE_PERCENT = 0.20; // 20% phí
const REFERRAL_PERCENT = {
  vip0: 0.02,
  vip1: 0.025,
  vip2: 0.03,
  vip3: 0.035,
  vip4: 0.04,
  vip5: 0.05,
};

/**
 * Endpoint POST /burn-claim
 *
 * Payload:
 * {
 *   wallet: string,            // ví của người dùng
 *   tokens: [ { mint: string, balance: number, decimals: number }, ... ],
 *   txHash: string (optional), // nếu chưa có, trả về giao dịch burn chưa ký
 *   vipLevel: string           // ví dụ: "vip0"
 * }
 *
 * Nếu payload không có txHash:
 *   - Tạo giao dịch burn: đối với mỗi token, lấy tài khoản token của user,
 *     lấy số dư chính xác (tokenAccount.tokenAmount.amount) và burn toàn bộ số dư đó,
 *     sau đó đóng tài khoản.
 *   - Trả về giao dịch burn (chưa ký) cho client.
 *
 * Nếu payload có txHash:
 *   - Giao dịch burn đã được gửi thành công.
 *   - Lấy danh sách token account của user (empty accounts).
 *     Nếu không tìm thấy (vì đã đóng), sử dụng số lượng token từ payload (số lượng đã chọn).
 *   - Tính tổng SOL thu hồi: totalClaimSOL = số token burned * CLAIM_REWARD_SOL.
 *   - Tính phí: feeAmount = totalClaimSOL * FEE_PERCENT.
 *   - Nếu có referral, tính referralReward = feeAmount * REFERRAL_PERCENT[vipLevel], adminFee = feeAmount - referralReward.
 *   - Tạo giao dịch claim chuyển netClaimSOL = totalClaimSOL - feeAmount từ ADMIN_WALLET sang ví user,
 *     và chuyển referralReward từ ADMIN_WALLET sang ví của referrer (nếu có).
 *   - Lấy latest blockhash, set feePayer, serialize giao dịch claim.
 *   - Lưu thông tin giao dịch vào DB (TransactionModel) với type "burn-claim".
 *   - Trả về thông tin giao dịch claim cho client.

const burnAndClaimTokens = async (req, res) => {
  try {
    const { wallet, tokens, txHash, vipLevel } = req.body;
    if (!wallet || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: "🚨 Cần cung cấp wallet và danh sách token để burn!" });
    }
    const userPubKey = new PublicKey(wallet);

    // ---------------------------
    // PHẦN 1: Tạo giao dịch burn nếu chưa có txHash
    // ---------------------------
    if (!txHash) {
      const transaction = new Transaction();
      for (const token of tokens) {
        const mintPubKey = new PublicKey(token.mint);
        // Lấy tài khoản token của người dùng
        const userTokenAccount = await getAssociatedTokenAddress(mintPubKey, userPubKey);
        // Lấy thông tin token account để lấy số dư chính xác (dưới dạng chuỗi)
        const tokenAccountInfo = await connection.getParsedAccountInfo(userTokenAccount);
        if (!tokenAccountInfo.value) {
          throw new Error(`Không tìm thấy token account cho mint ${token.mint}`);
        }
        const parsedInfo = tokenAccountInfo.value.data.parsed.info;
        // Sử dụng số dư chính xác từ chuỗi tokenAmount.amount (đã là số nguyên dưới dạng chuỗi)
        const amount = BigInt(parsedInfo.tokenAmount.amount);
        
        // Tạo instruction burn token (burn toàn bộ số dư)
        const burnIx = createBurnCheckedInstruction(
          userTokenAccount,
          mintPubKey,
          userPubKey,
          amount,
          token.decimals,
          undefined,
          TOKEN_PROGRAM_ID
        );
        transaction.add(burnIx);
        // Tạo instruction đóng tài khoản token
        const closeIx = createCloseAccountInstruction(
          userTokenAccount,
          userPubKey,
          userPubKey,
          [],
          TOKEN_PROGRAM_ID
        );
        transaction.add(closeIx);
      }
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubKey;
      const serializedTx = transaction.serialize({ requireAllSignatures: false });
      const txBase64 = serializedTx.toString("base64");
      return res.json({ success: true, burnTransaction: txBase64 });
    }

    // ---------------------------
    // PHẦN 2: Sau khi giao dịch burn đã thành công (txHash đã có)
    // ---------------------------
    // Lấy danh sách token account của user
    const emptyAccounts = await connection.getParsedTokenAccountsByOwner(userPubKey, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
    });
    let claimableTokens = emptyAccounts.value.filter(
      (account) => account.account.data.parsed.info.tokenAmount.uiAmount === 0
    );
    // Nếu không tìm thấy tài khoản rỗng (do đã đóng), sử dụng số lượng token từ payload
    if (claimableTokens.length === 0) {
      console.log("Không tìm thấy empty token accounts, sử dụng số lượng từ payload");
      claimableTokens = tokens.map((token) => ({
        pubkey: { toBase58: () => token.mint },
      }));
    }

    // Tính tổng SOL thu hồi từ việc burn
    const totalClaimSOL = claimableTokens.length * CLAIM_REWARD_SOL;
    let feeAmount = totalClaimSOL * FEE_PERCENT;
    let netClaimSOL = totalClaimSOL - feeAmount;
    let referralReward = 0;
    let adminFee = feeAmount;

    // Kiểm tra referral: Tìm người giới thiệu của user
    const userDoc = await UserModel.findOne({ publicKey: wallet });
    if (userDoc && userDoc.referredBy) {
      const referrer = await UserModel.findOne({ referralCode: userDoc.referredBy });
      if (referrer) {
        const vip = vipLevel || "vip0";
        referralReward = feeAmount * (REFERRAL_PERCENT[vip] || 0);
        adminFee = feeAmount - referralReward;
      }
    }

    console.log("Total Claim SOL:", totalClaimSOL);
    console.log("Fee Amount:", feeAmount);
    console.log("Referral Reward:", referralReward);
    console.log("Net Claim SOL:", netClaimSOL);

    // Tạo giao dịch claim: chuyển netClaimSOL từ ADMIN_WALLET sang ví user, và referralReward nếu có.
    const claimTx = new Transaction();
    claimTx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(ADMIN_WALLET),
        toPubkey: userPubKey,
        lamports: Math.floor(netClaimSOL * 1e9),
      })
    );
    if (referralReward > 0) {
      claimTx.add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(ADMIN_WALLET),
          toPubkey: new PublicKey(userDoc.referredBy),
          lamports: Math.floor(referralReward * 1e9),
        })
      );
    }
    // Instruction adminFee (chuyển adminFee từ ADMIN_WALLET về ADMIN_WALLET, nhằm ghi lại giao dịch)
    claimTx.add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(ADMIN_WALLET),
        toPubkey: new PublicKey(ADMIN_WALLET),
        lamports: Math.floor(adminFee * 1e9),
      })
    );
    const { blockhash: claimBlockhash } = await connection.getLatestBlockhash();
    claimTx.recentBlockhash = claimBlockhash;
    // Ở đây, feePayer đặt là user nếu người dùng chịu phí giao dịch claim
    claimTx.feePayer = userPubKey;
    const serializedClaimTx = claimTx.serializeMessage().toString("base64");

    // Lưu thông tin giao dịch vào cơ sở dữ liệu (ledger)
    const newLedgerEntry = new TransactionModel({
      publicKey: wallet,
      txHash: txHash, // hash của giao dịch burn
      tokenId: claimableTokens.map((t) => t.pubkey.toBase58()).join(","),
      amount: netClaimSOL,
      referral: userDoc ? userDoc.referredBy || null : null,
      fee: feeAmount,
      adminFee: adminFee,
      referralFee: referralReward,
      type: "burn-claim",
      timestamp: new Date(),
    });
    await newLedgerEntry.save();

    return res.json({
      success: true,
      burnTxHash: txHash,
      claimTransaction: serializedClaimTx,
      claimAmount: netClaimSOL,
      feeAmount,
      referralReward,
      adminAmount: adminFee,
      ledgerEntry: newLedgerEntry,
    });
  } catch (error) {
    console.error("❌ Error in burnAndClaimTokens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  burnAndClaimTokens,
};

/*
const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
const TransactionModel = require("../models/transactionModel");
const UserModel = require("../models/user");
const Referral = require("../models/referral");

const SOLANA_RPC_URL =
  "https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

const ADMIN_WALLET = new PublicKey(process.env.ADMIN_WALLET);
const CLAIM_REWARD_SOL = 0.00203;
const FEE_PERCENT = 0.20;

const burnAndClaimTokens = async (req, res) => {
  try {
    console.log("Payload:", req.body);
    const { wallet, tokens, vipLevel, referral } = req.body;
    if (!wallet || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res
        .status(400)
        .json({ error: "🚨 Cần cung cấp wallet và danh sách token để burn!" });
    }

    let userPubKey;
    try {
      userPubKey = new PublicKey(wallet);
    } catch (e) {
      return res.status(400).json({ error: "🚨 Ví không hợp lệ." });
    }

    const transaction = new Transaction();
    const userDoc = await UserModel.findOne({ publicKey: wallet });

    const feeSOL = CLAIM_REWARD_SOL * FEE_PERCENT;
    const feePerTokenLamports = Math.floor(feeSOL * 1e9);
    const totalFeeLamports = feePerTokenLamports * tokens.length;

    // Xử lý từng token: burn và đóng token account
    for (const token of tokens) {
      let mintPubKey;
      try {
        mintPubKey = new PublicKey(token.mint);
      } catch (e) {
        return res
          .status(400)
          .json({ error: `🚨 Token mint không hợp lệ: ${token.mint}` });
      }

      const userTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        userPubKey
      );
      const tokenAccountInfo = await connection.getParsedAccountInfo(
        userTokenAccount
      );
      if (!tokenAccountInfo.value) {
        return res
          .status(400)
          .json({ error: `🚨 Không tìm thấy token account cho mint: ${token.mint}` });
      }
      const parsedInfo = tokenAccountInfo.value.data.parsed.info;
      const amount = BigInt(parsedInfo.tokenAmount.amount);

      const burnIx = createBurnCheckedInstruction(
        userTokenAccount,
        mintPubKey,
        userPubKey,
        amount,
        token.decimals,
        undefined,
        TOKEN_PROGRAM_ID
      );
      transaction.add(burnIx);

      const closeIx = createCloseAccountInstruction(
        userTokenAccount,
        userPubKey,
        userPubKey,
        [],
        TOKEN_PROGRAM_ID
      );
      transaction.add(closeIx);
    }

    // Xử lý referral nếu có
    let totalReferralFee = 0;
    if (referral) {
      const refRecord = await Referral.findOne({ referralCode: referral });
      if (refRecord && refRecord.fullPublicKey) {
        try {
          const referralWallet = new PublicKey(refRecord.fullPublicKey);
          const referrer = await UserModel.findOne({
            publicKey: refRecord.fullPublicKey,
          });
          if (referrer) {
            console.log(
              `✅ Found referrer: ${referrer.publicKey}, VIP Level: ${referrer.vipLevel}`
            );
            const VIP_REFERRAL_REWARD = {
              vip0: 0.20,
              vip1: 0.25,
              vip2: 0.30,
              vip3: 0.35,
              vip4: 0.40,
              vip5: 0.45,
            };
            const referrerVipLevel = referrer.vipLevel || "vip0";
            const referralRewardRate = VIP_REFERRAL_REWARD[referrerVipLevel] || 0.20;
            const perReferralFee = Math.floor(feePerTokenLamports * referralRewardRate);
            totalReferralFee = perReferralFee * tokens.length;
            console.log(
              `💰 Referral ${refRecord.fullPublicKey} (VIP: ${referrerVipLevel}) nhận được: ${totalReferralFee} lamports`
            );
            if (totalReferralFee > 0) {
              transaction.add(
                SystemProgram.transfer({
                  fromPubkey: userPubKey,
                  toPubkey: referralWallet,
                  lamports: totalReferralFee,
                })
              );
            }
          } else {
            console.error(`❌ Không tìm thấy referrer ${refRecord.fullPublicKey} trong User DB.`);
          }
        } catch (error) {
          console.error("❌ Lỗi khi gửi hoa hồng referral:", error);
        }
      } else {
        console.error(
          `❌ Referral không tồn tại hoặc thiếu fullPublicKey: ${JSON.stringify(refRecord)}`
        );
      }
    }

    const adminFeeLamports = totalFeeLamports - totalReferralFee;
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userPubKey,
        toPubkey: ADMIN_WALLET,
        lamports: adminFeeLamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubKey;

    const serializedTx = transaction.serialize({ requireAllSignatures: false });
    const txBase64 = serializedTx.toString("base64");
    console.log("Serialized transaction (base64):", txBase64);

    // Trả về response với trường "tx"
    return res.json({ success: true, tx: txBase64 });
  } catch (error) {
    console.error("❌ Error in burnAndClaimTokens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  burnAndClaimTokens,
};
ok goi tien cho admin rồi */
/* chay ok, ben duoi la ban tranh qua tai burn
const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");
//const TransactionModel = require("../models/transactionModel");
//const UserModel = require("../models/user");
const User = require("../models/user");
const Referral = require("../models/referral");
const Ledger = require("../models/ledger"); // ✅ Thêm dòng này
const { VIP_REQUIREMENTS, getNextVipLevel } = require("../utils/vipUtils"); // Import hàm xử lý VIP
const { saveLedgerEntry } = require("../controllers/ledgerController");
const SOLANA_RPC_URL =
  "https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

const ADMIN_WALLET = new PublicKey(process.env.ADMIN_WALLET);
const CLAIM_REWARD_SOL = 0.00203;
const FEE_PERCENT = 0.20;

const burnAndClaimTokens = async (req, res) => {
  try {
    //console.log("Payload:", req.body);
    const { wallet, tokens, vipLevel, referral, selectedCount  } = req.body;
    if (!wallet || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res
        .status(400)
        .json({ error: "🚨 Cần cung cấp wallet và danh sách token để burn!" });
    }

    let userPubKey;
    try {
      userPubKey = new PublicKey(wallet);
    } catch (e) {
      return res.status(400).json({ error: "🚨 Ví không hợp lệ." });
    }

    const transaction = new Transaction();
    const userDoc = await User.findOne({ publicKey: wallet });

    const feeSOL = CLAIM_REWARD_SOL * FEE_PERCENT;
    const feePerTokenLamports = Math.floor(feeSOL * 1e9);
	const count = selectedCount || tokens.length;
	const totalFeeLamports = feePerTokenLamports * count;

    //const totalFeeLamports = feePerTokenLamports * tokens.length;

    // Xử lý từng token: burn và đóng token account
    for (const token of tokens) {
      let mintPubKey;
      try {
        mintPubKey = new PublicKey(token.mint);
      } catch (e) {
        return res
          .status(400)
          .json({ error: `🚨 Invalid mint token: ${token.mint}` });
      }

      const userTokenAccount = await getAssociatedTokenAddress(
        mintPubKey,
        userPubKey
      );
      const tokenAccountInfo = await connection.getParsedAccountInfo(
        userTokenAccount
      );
      if (!tokenAccountInfo.value) {
        return res
          .status(400)
          .json({ error: `🚨 No token account found for mint: ${token.mint}` });
      }
      const parsedInfo = tokenAccountInfo.value.data.parsed.info;
      const amount = BigInt(parsedInfo.tokenAmount.amount);

      const burnIx = createBurnCheckedInstruction(
        userTokenAccount,
        mintPubKey,
        userPubKey,
        amount,
        token.decimals,
        undefined,
        TOKEN_PROGRAM_ID
      );
      transaction.add(burnIx);

      const closeIx = createCloseAccountInstruction(
        userTokenAccount,
        userPubKey,
        userPubKey,
        [],
        TOKEN_PROGRAM_ID
      );
      transaction.add(closeIx);
    }

// Xử lý referral: lấy referralCode từ payload hoặc từ userDoc.referredBy nếu không có
    const referralCode = referral || (userDoc && userDoc.referredBy ? userDoc.referredBy : null);
    let totalReferralFee = 0; // Khởi tạo biến referral fee
    if (referralCode) {
      //console.log("Referral code được cung cấp:", referralCode);
      const refRecord = await Referral.findOne({ referralCode });
      if (refRecord && refRecord.fullPublicKey) {
        //console.log("refRecord:", refRecord);
        try {
          const referralWallet = new PublicKey(refRecord.fullPublicKey);
          //console.log("Địa chỉ ví referral:", referralWallet.toBase58());
          const referrer = await User.findOne({ publicKey: refRecord.fullPublicKey });
          if (referrer) {
            //console.log(`✅ Found referrer: ${referrer.publicKey}, VIP Level: ${referrer.vipLevel}`);
            const VIP_REFERRAL_REWARD = {
              vip0: 0.20,
              vip1: 0.25,
              vip2: 0.30,
              vip3: 0.35,
              vip4: 0.40,
              vip5: 0.45,
            };
            const referrerVipLevel = referrer.vipLevel || "vip0";
            const referralRewardRate = VIP_REFERRAL_REWARD[referrerVipLevel] || 0.20;
            const perReferralFee = Math.floor(feePerTokenLamports * referralRewardRate);
            totalReferralFee = perReferralFee * tokens.length;
            //console.log(`💰 Referral ${refRecord.fullPublicKey} (VIP: ${referrerVipLevel}) nhận được: ${totalReferralFee} lamports`);
            if (totalReferralFee > 0) {
              transaction.add(
                SystemProgram.transfer({
                  fromPubkey: userPubKey,
                  toPubkey: referralWallet,
                  lamports: totalReferralFee,
                })
              );
            }
          } else {
            console.error(`❌ Không tìm thấy referrer ${refRecord.fullPublicKey} trong User DB.`);
          }
        } catch (error) {
          console.error("❌ Lỗi khi xử lý referral:", error);
        }
      } else {
        console.error(`❌ Referral không tồn tại hoặc thiếu fullPublicKey: ${JSON.stringify(refRecord)}`);
      }
    } else {
      console.log("Không có referral code được cung cấp.");
    }


    const adminFeeLamports = totalFeeLamports - totalReferralFee;
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: userPubKey,
        toPubkey: ADMIN_WALLET,
        lamports: adminFeeLamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubKey;

    const serializedTx = transaction.serialize({ requireAllSignatures: false });
    const txBase64 = serializedTx.toString("base64");
   // console.log("Serialized transaction (base64):", txBase64);
	/*
// Lưu giao dịch vào DB (TransactionModel)
    const newTransaction = new TransactionModel({
      publicKey: wallet,
	  txHash: "", // Chưa có txHash vì giao dịch chưa được gửi lên mạng
      tokenId: tokens.map(token => token.mint).join(","),      
      type: "burn-claim",
      timestamp: new Date()
    });
    await newTransaction.save();
    console.log("Giao dịch đã được lưu vào DB:", newTransaction);
	*/
	
	/****
	
    return res.json({ success: true, tx: txBase64 });
  } catch (error) {
    console.error("❌ Error in burnAndClaimTokens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};



// ✅ **Xử lý sau khi người dùng ký giao dịch và gửi lên Solana**
const confirmClaimTransaction = async (req, res) => {
    const { publicKey, tokenIds, txHash, referral } = req.body;

    try {
        //console.log(`🔄 Confirming transaction: ${txHash}`);
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
                console.log(`✅ First Burn! Updated Burn Referrals for ${referrer.publicKey}: ${referrer.claimedReferrals}`);

                // 🔥 **Kiểm tra nếu đủ điều kiện để lên cấp VIP**
                const currentVip = referrer.vipLevel || "vip0";
                const requiredForNextVip = VIP_REQUIREMENTS[currentVip];

                if (requiredForNextVip !== undefined && referrer.claimedReferrals >= requiredForNextVip) {
                    // ✅ Tự động nâng cấp VIP nếu đủ điều kiện
                    const nextVipLevel = `vip${parseInt(currentVip.replace("vip", "")) + 1}`;
                    if (VIP_REQUIREMENTS.hasOwnProperty(nextVipLevel)) {
                        referrer.vipLevel = nextVipLevel;
                        //console.log(`🚀 ${referrer.publicKey} đã lên cấp ${nextVipLevel}`);
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


module.exports = { 
  burnAndClaimTokens, 
  confirmClaimTransaction
};
*/


const {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
} = require("@solana/web3.js");
const {
  getAssociatedTokenAddress,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  TOKEN_PROGRAM_ID,
} = require("@solana/spl-token");

const User = require("../models/user");
const Referral = require("../models/referral");
const Ledger = require("../models/ledger");
const { VIP_REQUIREMENTS, getNextVipLevel } = require("../utils/vipUtils");
const { saveLedgerEntry } = require("../controllers/ledgerController");

const SOLANA_RPC_URL =
  "https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// ADMIN_WALLET được load từ biến môi trường
const ADMIN_WALLET = new PublicKey(process.env.ADMIN_WALLET);
const CLAIM_REWARD_SOL = 0.00203;
const FEE_PERCENT = 0.20;

const burnAndClaimTokens = async (req, res) => {
  try {
    const { wallet, tokens, vipLevel, referral, selectedCount, mode } = req.body;
    if (!wallet || !tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        error: "🚨 Cần cung cấp wallet và danh sách token để burn!",
      });
    }

    let userPubKey;
    try {
      userPubKey = new PublicKey(wallet);
    } catch (e) {
      return res.status(400).json({ error: "🚨 Ví không hợp lệ." });
    }

    // Xác định batch size dựa trên mode: fast = 10, slow = 1
    const BATCH_SIZE = mode === "slow" ? 1 : 10;
    const batches = [];
    for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
      batches.push(tokens.slice(i, i + BATCH_SIZE));
    }
    if (batches.length > 1) {
      console.warn(`⚠️ Số token vượt quá giới hạn, tạo ${batches.length} transaction(s).`);
    }

    const txs = [];
    // Lấy thông tin user từ DB để xử lý referral
    const userDoc = await User.findOne({ publicKey: wallet });
    const referralCode = referral || (userDoc && userDoc.referredBy ? userDoc.referredBy : null);

    // Tính phí cho mỗi token: feeSOL = CLAIM_REWARD_SOL * FEE_PERCENT
    const feeSOL = CLAIM_REWARD_SOL * FEE_PERCENT;
    const feePerTokenLamports = Math.floor(feeSOL * 1e9);

    // Nếu có referral, tính tỷ lệ referral fee dựa trên cấp VIP của referrer.
    let perReferralFee = 0;
    let referralWallet = null;
    if (referralCode) {
      const refRecord = await Referral.findOne({ referralCode });
      if (refRecord && refRecord.fullPublicKey) {
        try {
          referralWallet = new PublicKey(refRecord.fullPublicKey);
          const referrer = await User.findOne({ publicKey: refRecord.fullPublicKey });
          if (referrer) {
            const VIP_REFERRAL_REWARD = {
              vip0: 0.20,
              vip1: 0.25,
              vip2: 0.30,
              vip3: 0.35,
              vip4: 0.40,
              vip5: 0.45,
            };
            const referrerVipLevel = referrer.vipLevel || "vip0";
            const referralRewardRate = VIP_REFERRAL_REWARD[referrerVipLevel] || 0.20;
            perReferralFee = Math.floor(feePerTokenLamports * referralRewardRate);
          }
        } catch (error) {
          console.error("❌ Lỗi khi xử lý referral:", error);
        }
      } else {
        console.error("❌ Referral không tồn tại hoặc thiếu fullPublicKey");
      }
    } else {
      console.log("Không có referral code được cung cấp.");
    }

    // Xử lý từng batch
    for (const batch of batches) {
      const transaction = new Transaction();

      // PHẦN A: Thêm instruction burn & close cho từng token trong batch
      for (const token of batch) {
        let mintPubKey;
        try {
          mintPubKey = new PublicKey(token.mint);
        } catch (e) {
          return res.status(400).json({ error: `🚨 Invalid mint token: ${token.mint}` });
        }
        const userTokenAccount = await getAssociatedTokenAddress(mintPubKey, userPubKey);
        const tokenAccountInfo = await connection.getParsedAccountInfo(userTokenAccount);
        if (!tokenAccountInfo.value) {
          return res.status(400).json({
            error: `🚨 No token account found for mint: ${token.mint}`,
          });
        }
        const parsedInfo = tokenAccountInfo.value.data.parsed.info;
        const amount = BigInt(parsedInfo.tokenAmount.amount);
        const burnIx = createBurnCheckedInstruction(
          userTokenAccount,
          mintPubKey,
          userPubKey,
          amount,
          token.decimals,
          undefined,
          TOKEN_PROGRAM_ID
        );
        transaction.add(burnIx);
        const closeIx = createCloseAccountInstruction(
          userTokenAccount,
          userPubKey,
          userPubKey,
          [],
          TOKEN_PROGRAM_ID
        );
        transaction.add(closeIx);
      }

      // PHẦN B: Tính toán phí cho batch
      const count = batch.length;
      const totalFeeLamports = feePerTokenLamports * count;
      let totalReferralFee = perReferralFee * count;
      const adminFeeLamports = totalFeeLamports - totalReferralFee;

      // PHẦN C: Thêm instruction chuyển phí từ ví người dùng
      if (totalReferralFee > 0 && referralWallet) {
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: userPubKey,
            toPubkey: referralWallet,
            lamports: totalReferralFee,
          })
        );
      }
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPubKey,
          toPubkey: ADMIN_WALLET,
          lamports: adminFeeLamports,
        })
      );

      // PHẦN D: Thiết lập blockhash và feePayer
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userPubKey;

      // Serialize transaction và thêm vào mảng kết quả
      const serializedTx = transaction.serialize({ requireAllSignatures: false });
      const txBase64 = serializedTx.toString("base64");
      txs.push(txBase64);
    }

    // Nếu cần, bạn có thể lưu giao dịch vào DB (ledger) ở đây

    return res.json({ success: true, txs ,referralCode  });
  } catch (error) {
    console.error("❌ Error in burnAndClaimTokens:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const confirmClaimTransaction = async (req, res) => {
  const { publicKey, tokenIds, txHash, referral } = req.body;
  try {
    const userPubKey = publicKey.toString();
    const existingClaim = await Ledger.findOne({ publicKey: userPubKey });
    await saveLedgerEntry(userPubKey, tokenIds.join(","), txHash, tokenIds.length * 1630000, referral);
    if (referral && !existingClaim) {
      const referrer = await User.findOne({ referralCode: referral });
      if (referrer) {
        referrer.claimedReferrals = (referrer.claimedReferrals || 0) + 1;
        const currentVip = referrer.vipLevel || "vip0";
        const requiredForNextVip = VIP_REQUIREMENTS[currentVip];
        if (requiredForNextVip !== undefined && referrer.claimedReferrals >= requiredForNextVip) {
          const nextVipLevel = `vip${parseInt(currentVip.replace("vip", "")) + 1}`;
          if (VIP_REQUIREMENTS.hasOwnProperty(nextVipLevel)) {
            referrer.vipLevel = nextVipLevel;
          }
        }
        await referrer.save();
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error in confirmClaimTransaction:", error);
    res.status(500).json({ error: error.toString() });
  }
};

module.exports = {
  burnAndClaimTokens,
  confirmClaimTransaction,
};
