const { Connection, PublicKey } = require("@solana/web3.js");
const { getParsedTokenAccountsByOwner, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const fetch = require("node-fetch"); // Nếu dùng Node.js, cần cài node-fetch (npm install node-fetch)
const borsh = require("borsh");

// Kết nối với Solana mainnet (có thể thay bằng devnet/testnet)
const connection = new Connection("https://dry-proportionate-forest.solana-mainnet.quiknode.pro/1498825df452809193385294a8b7aa31da700a02", "confirmed");


// Địa chỉ chương trình metadata của Metaplex
const METAPLEX_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

/* ===== Định nghĩa schema cho Metadata theo chuẩn Metaplex (phiên bản đơn giản) ===== */

class MetadataData {
  constructor(args) {
    this.name = args.name;
    this.symbol = args.symbol;
    this.uri = args.uri;
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints;
  }
}

class Metadata {
  constructor(args) {
    this.key = args.key;
    this.updateAuthority = args.updateAuthority;
    this.mint = args.mint;
    this.data = new MetadataData(args.data);
    this.primarySaleHappened = args.primarySaleHappened;
    this.isMutable = args.isMutable;
  }
}

// Schema định nghĩa (lưu ý: các trường string trên chain thường được lưu dưới dạng fixed-length byte array)
const METADATA_SCHEMA = new Map([
  [MetadataData, {
    kind: 'struct',
    fields: [
      ['name', 'string'],
      ['symbol', 'string'],
      ['uri', 'string'],
      ['sellerFeeBasisPoints', 'u16'],
    ]
  }],
  [Metadata, {
    kind: 'struct',
    fields: [
      ['key', 'u8'],
      // Dưới đây, updateAuthority và mint được lưu dưới dạng 32-byte arrays.
      ['updateAuthority', [32]],
      ['mint', [32]],
      ['data', MetadataData],
      ['primarySaleHappened', 'u8'],
      ['isMutable', 'u8']
    ]
  }]
]);

// Hàm loại bỏ ký tự null từ các chuỗi (nếu có)
function cleanString(str) {
  return str.replace(/\0/g, '').trim();
}

// Hàm giải mã metadata từ buffer bằng borsh
function decodeMetadata(buffer) {
  // Thay vì deserializeUnchecked, sử dụng deserialize
  const metadata = borsh.deserialize(METADATA_SCHEMA, Metadata, buffer);
  metadata.data.name = cleanString(metadata.data.name);
  metadata.data.symbol = cleanString(metadata.data.symbol);
  metadata.data.uri = cleanString(metadata.data.uri);
  return metadata;
}


/* ===== Hàm tìm PDA của Metadata ===== */
async function findMetadataPda(mint) {
  const [metadataPDA] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata"),
      METAPLEX_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    METAPLEX_PROGRAM_ID
  );
  return metadataPDA;
}

/* ===== Hàm chính: listTokensInWallet ===== */
async function listTokensInWallet(walletAddress) {
  try {
    // Chuyển địa chỉ ví thành PublicKey
    const publicKey = new PublicKey(walletAddress);
    
    // Lấy tất cả token accounts của ví
    const tokenAccounts = await getParsedTokenAccountsByOwner(
      connection,
      publicKey,
      { programId: TOKEN_PROGRAM_ID }
    );
    
    const tokenList = [];
    
    // Duyệt qua từng token account
    for (const account of tokenAccounts.value) {
      const tokenInfo = account.account.data.parsed.info;
      
      // Lấy thông tin cơ bản của token
      const tokenDetails = {
        mint: tokenInfo.mint, // Địa chỉ mint của token
        amount: tokenInfo.tokenAmount.uiAmount, // Số lượng token (đã chuyển sang decimal)
        decimals: tokenInfo.tokenAmount.decimals,
        name: "Unknown",
        symbol: "Unknown",
        image: null
      };
      
      try {
        // Tìm PDA của metadata
        const metadataPDA = await findMetadataPda(new PublicKey(tokenInfo.mint));
        // Lấy account info của metadata PDA
        const metadataAccount = await connection.getAccountInfo(metadataPDA);
        
        if (metadataAccount) {
          // Giải mã metadata
          const metadata = decodeMetadata(metadataAccount.data);
          tokenDetails.name = metadata.data.name;
          tokenDetails.symbol = metadata.data.symbol;
          
          // Nếu metadata chứa URI, lấy file JSON để lấy hình ảnh
          if (metadata.data.uri) {
            const response = await fetch(metadata.data.uri);
            const jsonMetadata = await response.json();
            tokenDetails.image = jsonMetadata.image || null;
          }
        }
      } catch (metadataError) {
        console.log(`Không thể lấy metadata cho token ${tokenInfo.mint}`);
      }
      
      tokenList.push(tokenDetails);
    }
    
    return tokenList;
    
  } catch (error) {
    console.error("Lỗi khi lấy danh sách token:", error);
    throw error;
  }
}

// Export hàm listTokensInWallet để sử dụng trong dự án của bạn
module.exports = { listTokensInWallet };

// --- Để test chức năng, bạn có thể gọi hàm listTokensInWallet với một wallet cụ thể ---
// (Ví dụ, uncomment đoạn dưới và chạy file này trực tiếp)
// (async () => {
//   const tokens = await listTokensInWallet("DP1pwhXjHnJZjqmHKKkgnGWEDETuQtRrhaXfm9zum8aJ");
//   console.log("Danh sách token:", tokens);
// })();

