// controllers/tokenController.js
const { Connection, PublicKey,LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { getParsedTokenAccountsByOwner } = require("@solana/web3.js"); // Sử dụng getParsedTokenAccountsByOwner từ web3.js
const { Metaplex } = require("@metaplex-foundation/js");
const fetch = require("node-fetch");

//const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
//const connection = new Connection(SOLANA_RPC_URL, "confirmed");
// Kết nối với Solana mainnet
const connection = new Connection("https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02", "confirmed");
const metaplex = Metaplex.make(connection);

// URL của Token Registry (Token List) làm fallback
const TOKEN_LIST_URL = "https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json";
let tokenRegistry = null;

// Hàm load token registry từ URL nếu chưa có
async function loadTokenRegistry() {
  if (!tokenRegistry) {
    const response = await fetch(TOKEN_LIST_URL);
    const data = await response.json();
    tokenRegistry = data.tokens.reduce((map, token) => {
      map[token.address] = {
        name: token.name,
        symbol: token.symbol,
        logoURI: token.logoURI,
      };
      return map;
    }, {});
  }
  return tokenRegistry;
}

// Hàm lấy danh sách token trong ví
async function listTokensInWallet(walletAddress) {
  try {
    const publicKey = new PublicKey(walletAddress);
    
    // Lấy tất cả token account của ví bằng phương thức getParsedTokenAccountsByOwner của connection
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );

    // Load token registry làm fallback
    const registry = await loadTokenRegistry();

    const tokenList = [];

    // Duyệt qua từng token account
    for (const account of tokenAccounts.value) {
      const tokenInfo = account.account.data.parsed.info;
      const mintAddress = tokenInfo.mint;

      // Khởi tạo thông tin cơ bản cho token
      const tokenDetails = {
        mint: mintAddress,
        amount: tokenInfo.tokenAmount.uiAmount,
        decimals: tokenInfo.tokenAmount.decimals,
        name: "Unknown",
        symbol: "Unknown",
        image: null,
      };

      try {
        // 1. Thử lấy metadata từ Metaplex (đối với NFT hoặc token có metadata)
        const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mintAddress) });
		 // console.log("NFT metadata:", nft);
        if (nft && nft.json) {
          tokenDetails.name = nft.name || "Unknown";
          tokenDetails.symbol = nft.symbol || "Unknown";
          tokenDetails.image = nft.json.image || nft.json.logoURI || null;
        }
      } catch (metaplexError) {
        // 2. Nếu không lấy được metadata từ Metaplex, dùng thông tin từ Token Registry
        const registryData = registry[mintAddress];
        if (registryData) {
          tokenDetails.name = registryData.name;
          tokenDetails.symbol = registryData.symbol;
          tokenDetails.image = registryData.logoURI || null;
        } else {
          // 3. Fallback cuối: Sử dụng một tên tạm dựa trên mint address
          tokenDetails.name = `Unknown Token (${mintAddress.slice(0, 8)}...)`;
        }
      }

      tokenList.push(tokenDetails);
    }

    return tokenList;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách token:", error);
    throw error;
  }
}

/* ===== Controller getTokens ===== */
exports.getTokens = async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!wallet) {
      return res.status(400).json({ error: "Thiếu wallet address trong query" });
    }
    console.log(`Yêu cầu getTokens với wallet: ${wallet}`);
    
    const tokens = await listTokensInWallet(wallet);
    return res.json({ tokens });
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
