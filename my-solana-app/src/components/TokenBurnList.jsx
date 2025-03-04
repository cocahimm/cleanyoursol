/* import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import axios from "axios";
import { Buffer } from "buffer";
if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

const API_URL = import.meta.env.VITE_API_URL || "https://cleanyoursol.com/api";

const TokenBurnList = ({ claimAllTokens, vipLevel }) => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [tokens, setTokens] = useState([]);
  const [selected, setSelected] = useState([]);
  const [burning, setBurning] = useState(false);

  // Hàm load token từ API
  useEffect(() => {
    if (!publicKey) return;
    axios
      .get(`${API_URL}/tokens`, { params: { wallet: publicKey.toBase58() } })
      .then((res) => setTokens(res.data.tokens || []))
      .catch((err) => console.error("Error fetching tokens:", err));
  }, [publicKey]);

  const handleBurnClaim = async () => {
    if (!publicKey || selected.length === 0) return;
    if (!window.confirm("Bạn có chắc muốn burn và claim token?")) return;

    setBurning(true);
    try {
      // Build payload với danh sách token được chọn
      const tokensToBurn = tokens.filter((token) =>
        selected.includes(token.mint)
      );
      const payload = {
        wallet: publicKey.toBase58(),
        tokens: tokensToBurn.map((token) => ({
          mint: token.mint,
          balance: token.amount,
          decimals: token.decimals,
        })),
        vipLevel, // cấp VIP, ví dụ "vip0"
      };

      // Gọi API /burn-claim lần đầu (chưa có txHash) để nhận giao dịch burn cần ký
      let response = await axios.post(`${API_URL}/burn-claim`, payload);
      if (response.data.burnTransaction) {
        console.log("Received burn transaction:", response.data.burnTransaction);
        // Chuyển giao dịch từ base64 thành transaction object
        const txBuffer = Buffer.from(response.data.burnTransaction, "base64");
        const { Transaction } = await import("@solana/web3.js");
        let burnTx = Transaction.from(txBuffer);

        // Yêu cầu người dùng ký giao dịch burn
        const signedBurnTx = await signTransaction(burnTx);
        const rawBurnTx = signedBurnTx.serialize();
        // Gửi giao dịch burn lên mạng lưới
        const burnTxid = await connection.sendRawTransaction(rawBurnTx);
        await connection.confirmTransaction(burnTxid, "confirmed");
        console.log("Burn transaction confirmed, txid:", burnTxid);

        // Cập nhật payload với txHash để thực hiện bước claim
        payload.txHash = burnTxid;

        // Gọi API /burn-claim lần 2, bây giờ payload đã có txHash
        response = await axios.post(`${API_URL}/burn-claim`, payload);
        console.log("Claim response:", response.data);

        alert(
          `Burn & Claim thành công! Số SOL nhận được: ${response.data.claimAmount} SOL`
        );
      } else {
        throw new Error("Không nhận được giao dịch burn từ server");
      }
    } catch (error) {
      console.error("Error during burn & claim process:", error);
      alert("Có lỗi xảy ra trong quá trình burn & claim token");
    } finally {
      setBurning(false);
      // Refresh danh sách token nếu cần
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🔥 Burn Tokens</h2>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => {
            // Chọn tất cả
            const all = tokens.map((token) => token.mint);
            setSelected(all);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Chọn tất cả
        </button>
        <button
          onClick={handleBurnClaim}
          disabled={burning || selected.length === 0}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          {burning ? "Đang xử lý..." : `Burn & Claim (${selected.length} token)`}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {tokens.map((token) => (
          <div key={token.mint} className="flex items-center bg-gray-700 p-4 rounded-lg">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(token.mint)}
              onChange={() =>
                setSelected((prev) =>
                  prev.includes(token.mint)
                    ? prev.filter((m) => m !== token.mint)
                    : [...prev, token.mint]
                )
              }
            />
            <img
              src={token.image || "https://dummyimage.com/40x40/cccccc/000000.png&text=No+Image"}
              alt={token.name}
              className="w-10 h-10 rounded-full mr-2"
            />
            <div className="flex-1">
              <p className="text-lg font-semibold">
                {token.name} ({token.symbol})
              </p>
              <p className="text-sm text-gray-400">{token.mint.slice(0,12)}...{token.mint.slice(-12)}</p>
              <p className="mt-1">Amount: {token.amount}</p>
              <p className="text-sm text-gray-400">Thu về: {Number(0.001624).toFixed(6)} SOL mỗi token</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenBurnList;

*/
/*
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

const API_URL = import.meta.env.VITE_API_URL || 'https://cleanyoursol.com/api';
 // Hàm chọn/bỏ chọn token


const TokenBurnList = () => {
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const navigate = useNavigate();

    const [tokens, setTokens] = useState([]);
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [burning, setBurning] = useState(false);
	const [selected, setSelected] = useState([]);
    // Load danh sách token từ backend (endpoint /tokens)
    useEffect(() => {
        if (!publicKey) return;
        const fetchTokens = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/tokens`, {
                    params: { wallet: publicKey.toBase58() }
                });
                setTokens(res.data.tokens);
            } catch (err) {
                //console.error('Lỗi tải token:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTokens();
    }, [publicKey]);

    // Chọn hoặc bỏ chọn token dựa theo mint
    const toggleSelect = (mint) => {
        setSelectedTokens((prev) => {
            if (prev.includes(mint)) {
                return prev.filter(item => item !== mint);
            } else {
                return [...prev, mint];
            }
        });
    };

    // Xử lý Burn: gửi payload đến backend /burn-claim để tạo giao dịch burn & chuyển phí
    const handleBurn = async () => {
        if (!publicKey || selectedTokens.length === 0) return;
        setBurning(true);
        try {
            // Lọc ra các token đã được chọn
            const tokensToBurn = tokens.filter(token => selectedTokens.includes(token.mint));
            const payload = {
                wallet: publicKey.toBase58(),
                tokens: tokensToBurn.map(token => ({
                    mint: token.mint,
                    balance: token.balance,
                    decimals: token.decimals || 0
                })),
                vipLevel: "vip0" // hoặc thay đổi theo trạng thái của người dùng
            };

            // Gọi API backend tạo giao dịch burn-claim
            const { data } = await axios.post(`${API_URL}/burn-claim`, payload);
            //console.log("Response from burn-claim:", data);
            // Kiểm tra xem backend trả về trường "tx" hay không
            if (!data.tx) throw new Error('Không nhận được giao dịch từ server');

            // Chuyển từ base64 về đối tượng Transaction
            const txBuffer = Buffer.from(data.tx, 'base64');
            const transaction = Transaction.from(txBuffer);

            // Yêu cầu người dùng ký giao dịch (1 lần duy nhất)
            const signedTx = await signTransaction(transaction);

            // Gửi giao dịch đã ký lên mạng lưới Solana
            const txid = await connection.sendRawTransaction(signedTx.serialize());
            //console.log('Giao dịch đã gửi:', txid);

            // Đợi xác nhận giao dịch
            await connection.confirmTransaction(txid, 'confirmed');
            //console.log('Giao dịch đã xác nhận');
			const confirmPayload = {
                publicKey: publicKey.toBase58(),
                tokenIds: tokensToBurn.map(token => token.mint), // gửi danh sách token mint
                txHash: txid,
                // referral: "mã referral" (nếu có)
            };

            const confirmResponse = await axios.post(`${API_URL}/confirm-claim`, confirmPayload);
            //console.log("Response from confirm-claim:", confirmResponse.data);

            // Reload lại trang sau khi hoàn thành
            window.location.reload();
            // Sau khi burn thành công, chuyển hướng sang trang Claim
           // navigate('/claim');
        } catch (error) {
            //console.error('Lỗi khi burn token:', error);
            alert('An error occurred while writing the token.');
        } finally {
            setBurning(false);
        }
    };

    if (!publicKey) {
        return <div>Please connect your Solana wallet.</div>;
    }
/*
    return (
        <div className="container mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Token list</h2>
            {loading ? (
                <p>Đang tải token...</p>
            ) : (
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="p-2 border">Chọn</th>
                            <th className="p-2 border">Icon</th>
                            <th className="p-2 border">Tên Token</th>
                            <th className="p-2 border">Địa chỉ</th>
                            <th className="p-2 border">Số lượng</th>
                            <th className="p-2 border">USD</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tokens.map(token => (
                            <tr key={token.mint}>
                                <td className="p-2 border text-center">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedTokens.includes(token.mint)}
                                        onChange={() => toggleSelect(token.mint)}
                                    />
                                </td>
                                <td className="p-2 border text-center">
                                    <img src={token.avatar} alt={token.name} className="w-8 h-8 inline" />
                                </td>
                                <td className="p-2 border">{token.name}</td>
                                <td className="p-2 border">{token.mint.substring(0, 4)}...{token.mint.slice(-4)}</td>
                                <td className="p-2 border">{token.balance}</td>
                                <td className="p-2 border">${(token.balance * token.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div className="mt-4">
                <button 
                    onClick={handleBurn}
                    disabled={burning || selectedTokens.length === 0}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                    {burning ? "Đang xử lý..." : "🔥 Burn & Claim Token"}
                </button>
            </div>
        </div>
    );
};
*/
/*
 return (
   <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">🔥 Burn Tokens</h2>
      <div className="flex justify-between mb-4">
        <button
          onClick={() => {
            // Chọn tất cả
            const all = tokens.map((token) => token.mint);
            setSelected(all);
          }}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Select all
        </button>
        <button
          onClick={handleBurn}
          disabled={burning || selected.length === 0}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          {burning ? "Processing..." : `Burn & Claim (${selected.length} token)`}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {tokens.map((token) => (
          <div key={token.mint} className="flex items-center bg-gray-700 p-4 rounded-lg">
            <input
              type="checkbox"
              className="mr-2"
              checked={selected.includes(token.mint)}
              onChange={() =>
                setSelected((prev) =>
                  prev.includes(token.mint)
                    ? prev.filter((m) => m !== token.mint)
                    : [...prev, token.mint]
                )
              }
            />
            <img
              src={token.image || "https://dummyimage.com/40x40/cccccc/000000.png&text=No+Image"}
              alt={token.name}
              className="w-10 h-10 rounded-full mr-2"
            />
            <div className="flex-1">
              <p className="text-lg font-semibold">
                {token.name} ({token.symbol})
              </p>
              <p className="text-sm text-gray-400">{token.mint.slice(0,12)}...{token.mint.slice(-12)}</p>
              <p className="mt-1">Amount: {token.amount}</p>
              <p className="text-sm text-gray-400">Returns:~ {Number(0.001624).toFixed(6)} SOL</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TokenBurnList;
*/
/* bản cũ chưa sửa nhanh chậm
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@solana/web3.js';

import { Buffer } from 'buffer';
import Swal from 'sweetalert2';
const API_URL = import.meta.env.VITE_API_URL || 'https://cleanyoursol.com/api';

const [mode, setMode] = useState("fast"); // "fast" hoặc "slow"
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
// Hàm chuyển đổi mode
  const toggleMode = () => {
    setMode((prev) => (prev === "fast" ? "slow" : "fast"));
  };


const TokenBurnList = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  const [tokens, setTokens] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [burning, setBurning] = useState(false);

  // Load danh sách token từ backend
  useEffect(() => {
    if (!publicKey) return;
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/tokens`, {
          params: { wallet: publicKey.toBase58() },
        });
        setTokens(res.data.tokens);
      } catch (err) {
        //console.error('Error loading token:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, [publicKey]);
  
// Lọc những token có amount > 0
  const filteredTokens = tokens.filter(token => Number(token.amount) > 0);
  // Hàm chọn/bỏ chọn token
  const toggleSelect = (mint) => {
    setSelected((prev) =>
      prev.includes(mint) ? prev.filter((m) => m !== mint) : [...prev, mint]
    );
  };
   // Hàm toggle: nếu tất cả token đã được chọn -> bỏ chọn, ngược lại chọn tất cả
 const toggleSelectAll = () => {
    if (selected.length === filteredTokens.length) {
      setSelected([]);
    } else {
      const all = filteredTokens.map((token) => token.mint);
      setSelected(all);
    }
  };
  // Hàm xử lý Burn (bạn tích hợp logic gửi giao dịch vào đây)
  const handleBurn = async () => {
    if (!publicKey || selected.length === 0) return;
	let referralCode = localStorage.getItem("referralCode") || null;
	 // Hiển thị modal confirm tùy chỉnh
  const result = await Swal.fire({
    title: 'Are you sure you want to burn and claim tokens?',
    html: '<b>* Note! We are not responsible for any mistakes you make</b>',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Agree',
    cancelButtonText: 'Cancel',
	  customClass: {
      popup: 'bg-gray-800 text-white rounded-lg p-6',
      title: 'text-2xl font-bold mb-4',
      confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded',
      cancelButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded'
    },
    buttonsStyling: false, // tắt styling mặc định của SweetAlert2 để dùng lớp của bạn
  });

  if (!result.isConfirmed) {
    return;
  }

    try {
      // Ví dụ: Lọc ra các token được chọn từ mảng tokens
      const tokensToBurn = filteredTokens.filter((token) => selected.includes(token.mint));
      const payload = {
        wallet: publicKey.toBase58(),
        tokens: tokensToBurn.map((token) => ({
          mint: token.mint,
          balance: token.balance,
          decimals: token.decimals || 0,
        })),
        //vipLevel: "vip0", // hoặc tùy theo logic		
		selectedCount: selected.length, // Thêm trường này để backend tính phí dựa trên số token được chọn
      };

      // Gọi API tạo giao dịch burn-claim
      const { data } = await axios.post(`${API_URL}/burn-claim`, payload);
      //console.log("Response from burn-claim:", data);
      if (!data.tx) throw new Error('No transaction received from server');

      // Chuyển từ base64 về đối tượng Transaction
      const txBuffer = Buffer.from(data.tx, 'base64');
      const transaction = Transaction.from(txBuffer);

      // Yêu cầu người dùng ký giao dịch
      const signedTx = await signTransaction(transaction);

      // Gửi giao dịch đã ký lên mạng Solana
      const txid = await connection.sendRawTransaction(signedTx.serialize());
      //console.log('Giao dịch đã gửi:', txid);

      // Đợi xác nhận giao dịch
      await connection.confirmTransaction(txid, 'confirmed');
      //console.log('Giao dịch đã xác nhận');

      const confirmPayload = {
                publicKey: publicKey.toBase58(),
                tokenIds: tokensToBurn.map(token => token.mint), // gửi danh sách token mint
                txHash: txid,
                referral: referralCode
            };

            const confirmResponse = await axios.post(`${API_URL}/confirm-claim`, confirmPayload);
            console.log("Response from confirm-claim:", confirmResponse.data);

            // Reload lại trang sau khi hoàn thành
            window.location.reload();
            // Sau khi burn thành công, chuyển hướng sang trang Claim
      
    } catch (error) {
      //console.error('Lỗi khi burn token:', error);
      alert('An error occurred while burning the token.');
    } finally {
      setBurning(false);
    }
  };

  if (!publicKey) {
    return <div>Please connect your Solana wallet.</div>;
  }



  return (
<div className="  rounded-lg ">
      <h2 className="text-2xl font-bold mb-4">🔥 Burn Tokens</h2>
      
     {loading ? (
  <p className="text-green-400 mt-4">Loading tokens...</p>
) : filteredTokens.length === 0 ? (
  <p className="text-green-400 mt-4">No tokens available.</p>
) : (
  <>
    <div className="flex justify-between mb-4">
      <button
        onClick={toggleSelectAll}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded"
      >
        {selected.length === filteredTokens.length ? "Deselect all" : "Select all"}
      </button>
      <button
        onClick={handleBurn}
        disabled={burning || selected.length === 0}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded"
      >
        {burning ? "Processing..." : `Burn & Claim (${selected.length} token${selected.length > 1 ? 's' : ''})`}
      </button>
    </div>


    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      {filteredTokens.map((token) => (
        <div key={token.mint} className="flex items-center border p-2 rounded-lg">
          <input
            type="checkbox"
            className="mr-2"
            checked={selected.includes(token.mint)}
            onChange={() => toggleSelect(token.mint)}
          />
          <img
            src={token.image || "https://dummyimage.com/40x40/cccccc/000000.png&text=No+Image"}
            alt={token.name}
            className="w-10 h-10 rounded-full mr-2"
          />
          <div className="flex-1">
            <p className="text-lg font-semibold">
              {token.name} ({token.symbol})
            </p>
            <p className="text-sm text-gray-400">
              {token.mint.slice(0, 12)}...{token.mint.slice(-12)}
            </p>
            <p className="mt-1">Amount: {token.amount}</p>
            <p className="text-sm text-gray-400">
              Returns: ~{Number(0.001624).toFixed(6)} SOL per token
            </p>
          </div>
        </div>
      ))}
    </div>
	<div className="text-center mt-4">
        <button
          onClick={handleBurn}
          disabled={burning || selected.length === 0}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          {burning ? "Processing..." : `Burn & Claim (${selected.length} token${selected.length > 1 ? 's' : ''})`}
        </button>
      </div>
  </>
)}

      
    </div>
  );
};
export default TokenBurnList;

het ban cu chua sua nhanh cham*/

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'https://cleanyoursol.com/api';

const TokenBurnList = () => {
  const { publicKey, signTransaction,signAndSendTransaction  } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  const [tokens, setTokens] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [burning, setBurning] = useState(false);
  const [mode, setMode] = useState("fast");
const txs = [];

  // Load token từ backend
  useEffect(() => {
    if (!publicKey) return;
    const fetchTokens = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/tokens`, {
          params: { wallet: publicKey.toBase58() },
        });
        setTokens(res.data.tokens);
      } catch (err) {
        console.error('Error loading tokens:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, [publicKey]);

  // Lọc token có amount > 0
  const filteredTokens = tokens.filter(token => Number(token.amount) > 0);

  // Hàm chọn/bỏ chọn token (chỉ dùng cho filteredTokens)
  const toggleSelect = (mint) => {
    setSelected((prev) =>
      prev.includes(mint) ? prev.filter((m) => m !== mint) : [...prev, mint]
    );
  };

  // Chỉ chọn những token đã hiển thị (filteredTokens)
  const toggleSelectAll = () => {
    if (selected.length === filteredTokens.length) {
      setSelected([]);
    } else {
      setSelected(filteredTokens.map((token) => token.mint));
    }
  };

  // Hàm chuyển đổi mode
  const toggleMode = () => {
    setMode((prev) => (prev === "fast" ? "slow" : "fast"));
  };

  // Hàm xử lý Burn & Claim
  const handleBurn = async () => {
    if (!publicKey || selected.length === 0) return;
    let referralCode = localStorage.getItem("referralCode") || null;
    const result = await Swal.fire({
      title: 'Are you sure you want to burn and claim tokens?',
      html: '<b>* Note: We are not responsible for any mistakes you make.</b>',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Agree',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-gray-800 text-white rounded-lg p-6',
        title: 'text-2xl font-bold mb-4',
        confirmButton: 'bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded',
        cancelButton: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded'
      },
      buttonsStyling: false,
    });
    if (!result.isConfirmed) {
      return;
    }
    setBurning(true);
    try {
      const tokensToBurn = filteredTokens.filter(token => selected.includes(token.mint));
      const payload = {
        wallet: publicKey.toBase58(),
        tokens: tokensToBurn.map((token) => ({
          mint: token.mint,
          balance: token.amount,
          decimals: token.decimals || 0,
        })),
        vipLevel: "vip0", // hoặc thay đổi theo logic của bạn
        selectedCount: selected.length,
        mode, // "fast" hoặc "slow"
      };

      const { data } = await axios.post(`${API_URL}/burn-claim`, payload);
	 if (data.referralCode != null) {
		  console.log("Referral Code from backend:", data.referralCode);
		  referralCode = data.referralCode;
		  // Nếu muốn, lưu lại vào localStorage:
		  localStorage.setItem("referralCode", data.referralCode);
		}
      if (!data.txs || data.txs.length === 0) throw new Error('No transaction received from server');
/*
    for (let txBase64 of data.txs) {
		  // Chuyển đổi base64 sang Buffer và tạo Transaction object
		  const txBuffer = Buffer.from(txBase64, "base64");
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

		  // Xác nhận giao dịch
		  /*
		  const latestBlockhash = await connection.getLatestBlockhash();
		  await connection.confirmTransaction({
			signature: txid,
			blockhash: latestBlockhash.blockhash,
			lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
		  }, { commitment: "confirmed" });

async function sendTransactionWithRetry(transaction) {
  let txid;
  try {
    // Cố gắng gửi giao dịch
    txid = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction({
      signature: txid,
      blockhash: transaction.recentBlockhash,
      lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
    }, { commitment: "confirmed" });
  } catch (error) {
    if (error.name === "TransactionExpiredBlockheightExceededError") {
      console.warn("Transaction expired, retrying with a new blockhash...");
      // Lấy blockhash mới, thiết lập lại transaction và ký lại
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      // Bạn cần yêu cầu người dùng ký lại hoặc tự động re-sign nếu có thể
      const signedTx = await signTransaction(transaction);
      txid = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction({
        signature: txid,
        blockhash,
        lastValidBlockHeight,
      }, { commitment: "confirmed" });
    } else {
      throw error;
    }
  }
  return txid;
}

		  console.log("Transaction confirmed, txid:", txid);
		}
		
		// Giả sử txs là mảng các txid mà bạn đã xử lý trong vòng lặp
const firstTxid = txs[0];

const confirmPayload = {
  publicKey: publicKey.toBase58(),
  tokenIds: tokensToBurn.map(token => token.mint),
  txHash: firstTxid,
  referral: referralCode
};
      //const confirmPayload = {
        //publicKey: publicKey.toBase58(),
       // tokenIds: tokensToBurn.map(token => token.mint),
       // txHash: "multiple",
       // referral: referralCode
     // };
*/
/* test
const txids = [];
for (let txBase64 of data.txs) {
  const txBuffer = Buffer.from(txBase64, "base64");
  let transaction = Transaction.from(txBuffer);
  let txid;
  try {
    if (signAndSendTransaction) {
      try {
        const result = await signAndSendTransaction(transaction);
        console.log("Result from signAndSendTransaction:", result);
        if (result && result.txid) {
          txid = result.txid;
        } else {
          console.warn("signAndSendTransaction did not return a valid txid, falling back to signTransaction.");
        }
      } catch (err) {
        // Nếu lỗi do transaction hết hạn, thử re-sign giao dịch với blockhash mới.
        if (err.name === "TransactionExpiredBlockheightExceededError") {
          console.warn("Transaction expired, retrying with a new blockhash...");
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          const signedTx = await signTransaction(transaction);
          txid = await connection.sendRawTransaction(signedTx.serialize());
        } else {
          console.error("Error in signAndSendTransaction:", err);
        }
      }
    }
  } catch (err) {
    console.error("Error during signing process:", err);
  }
  
  if (!txid && signTransaction) {
    const signedTx = await signTransaction(transaction);
    console.log("Signed transaction:", signedTx);
    txid = await connection.sendRawTransaction(signedTx.serialize());
  }
  if (!txid) {
    throw new Error("No valid transaction signature received.");
  }

  // Xác nhận giao dịch với blockhash mới nếu cần
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature: txid,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }, { commitment: "confirmed" });

  console.log("Transaction confirmed, txid:", txid);
  txids.push(txid);
}

const firstTxid = txids[0]; // Lấy txid đầu tiên
const confirmPayload = {
  publicKey: publicKey.toBase58(),
  tokenIds: tokensToBurn.map(token => token.mint),
  txHash: firstTxid,
  referral: referralCode
};

*/
const txids = [];

for (let txBase64 of data.txs) {
  const txBuffer = Buffer.from(txBase64, "base64");
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

  if (txid) {
    console.log("✅ Transaction submitted, txid:", txid);

    // ✅ Xác nhận giao dịch trên blockchain
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
    txids.push(txid);
  } else {
    console.error("❌ Failed to get txid for transaction.");
  }
}

// ✅ Tạo payload xác nhận giao dịch
const firstTxid = txids[0]; // Lấy txid đầu tiên
const confirmPayload = {
  publicKey: window.solana.publicKey.toBase58(),
  tokenIds: tokensToBurn.map((token) => token.mint),
  txHash: firstTxid,
  referral: referralCode,
};

console.log("🔥 Confirm Payload:", confirmPayload);





      const confirmResponse = await axios.post(`${API_URL}/confirm-claim`, confirmPayload);
	
      console.log("Response from confirm-claim:", confirmResponse.data);
      /*Swal.fire({
        title: "Success",
        text: `Burn & Claim succeeded!`,
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-800 text-white rounded-lg p-6",
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
        },
      });
	  */
      //window.location.reload();
    } catch (error) {
      console.error('Error during burn & claim process:', error);
      Swal.fire({
        title: "Error",
        text: "An error occurred while burning and claiming tokens.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "bg-gray-800 text-white rounded-lg p-6",
          confirmButton: "bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded",
        },
      });
    } finally {
      setBurning(false);
    }
  };

  if (!publicKey) {
    return <div>Please connect your Solana wallet.</div>;
  }

  return (
    <div className="rounded-lg p-4">
      <h2 className="text-2xl font-bold mb-4">🔥 Burn Tokens</h2>
	  <p className="text-green-400 mt-4">To keep this tool up and running, a 20% donation is included for the recovered SOL.</p>
      {loading ? (
        <p className="text-green-400 mt-4">Loading tokens...</p>
      ) : filteredTokens.length === 0 ? (
        <p className="text-green-400 mt-4">No tokens available.</p>
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-center justify-between mb-4">
            <button
              onClick={toggleSelectAll}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded mb-2 md:mb-0"
            >
              {selected.length === filteredTokens.length ? "Deselect all" : "Select all"}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">⚡ Mode:</span>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => setMode("fast")}
                  className={`px-4 py-1 text-xs rounded-l border border-r ${mode === "fast" ? "bg-blue-700 text-white" : "bg-gray-300"}`}
                >
                  Fast
                </button>
                <button
                  onClick={() => setMode("slow")}
                  className={`px-4 py-1 text-xs rounded-r border border-l ${mode === "slow" ? "bg-blue-700 text-white" : "bg-gray-300"}`}
                >
                  Slow
                </button>
              </div>
              <button
                onClick={handleBurn}
                disabled={burning || selected.length === 0}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                {burning ? "Processing..." : `Burn & Claim (${selected.length} token${selected.length > 1 ? 's' : ''})`}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredTokens.map((token) => (
              <div key={token.mint} className="flex items-center border p-2 rounded-lg">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={selected.includes(token.mint)}
                  onChange={() => toggleSelect(token.mint)}
                />
                <img
                  src={
                    token.image ||
                    "https://dummyimage.com/40x40/cccccc/000000.png&text=No+Image"
                  }
                  alt={token.name}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    {token.name} ({token.symbol})
                  </p>
                  <p className="text-sm text-gray-400">
                    {token.mint.slice(0, 12)}...{token.mint.slice(-12)}
                  </p>
                  <p className="mt-1">Amount: {token.amount}</p>
                  <p className="text-sm text-gray-400">
                    Returns: ~{Number(0.001624).toFixed(6)} SOL per token
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <button
              onClick={handleBurn}
              disabled={burning || selected.length === 0}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              {burning
                ? "Processing..."
                : `Burn & Claim (${selected.length} token${selected.length > 1 ? 's' : ''})`}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TokenBurnList;
