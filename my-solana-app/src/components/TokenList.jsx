import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const TokenList = ({ wallet }) => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
const shortenAddresstow = (address) => {
    return address.slice(0, 12) + "..." + address.slice(-12);
};
  useEffect(() => {
    if (!wallet) return;
    const fetchTokens = async () => {
      setLoading(true);
      try {
        // Giả sử API của bạn chạy trên cleanyoursol.com/api
        const response = await axios.get(`https://cleanyoursol.com/api/tokens?wallet=${wallet}`);
        setTokens(response.data.tokens);
      } catch (err) {
        console.error("Error fetching tokens:", err);
        setError("Unable to load token list");
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [wallet]);

  if (loading) return <div>Loading token list...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Danh sách token</h2>
      {tokens.length === 0 && <p>Không có token nào</p>}
      {tokens.map((token) => (
        <div
          key={token.mint}
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {token.image ? (
            <img
              src={token.image}
              alt={token.name}
              style={{ width: "80px", height: "80px", marginRight: "10px", objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "80px",
                height: "80px",
                backgroundColor: "#eee",
                marginRight: "10px",
              }}
            >
              No Image
            </div>
          )}
          <div>
            <h3 style={{ margin: 0 }}>
              {token.name} ({token.symbol})
            </h3>
            <p style={{ margin: "4px 0" }}>Số lượng: {token.amount}</p>
            <p style={{ margin: 0, fontSize: "0.9em", color: "#666" }}>Mint: {token.mint}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TokenList;
