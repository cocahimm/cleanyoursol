// src/components/BurnTokens.jsx
// Yêu cầu: npm install axios @solana/wallet-adapter-react
// Nếu cần Buffer polyfill, đảm bảo cấu hình Vite hỗ trợ (ví dụ: import { Buffer } from 'buffer')
/*
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

const API_URL = import.meta.env.VITE_API_URL || 'https://cleanyoursol.com/api';

const BurnTokens = () => {
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const navigate = useNavigate();

    const [tokens, setTokens] = useState([]);
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [burning, setBurning] = useState(false);

    // Load danh sách token từ API backend (endpoint /tokens)
    useEffect(() => {
        if (!publicKey) return;
        const fetchTokens = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${API_URL}/tokens`, {
                    params: { wallet: publicKey.toBase58() }
                });
                // Giả sử API trả về { tokens: [...] }
                setTokens(res.data.tokens);
            } catch (err) {
                console.error('Lỗi tải token:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTokens();
    }, [publicKey]);

    // Chọn hoặc bỏ chọn token (dựa theo mint address)
    const toggleSelect = (mint) => {
        setSelectedTokens((prev) => {
            if (prev.includes(mint)) {
                return prev.filter(item => item !== mint);
            } else {
                return [...prev, mint];
            }
        });
    };

    // Xử lý Burn: gọi API backend để tạo transaction, ký giao dịch và gửi lên mạng lưới
    const handleBurn = async () => {
        if (!publicKey || selectedTokens.length === 0) return;
        setBurning(true);
        try {
            // Lọc ra các token đã được chọn
            const tokensToBurn = tokens.filter(token => selectedTokens.includes(token.mint));
            // Chuẩn bị payload: bao gồm wallet và các token cần burn.
            // Chú ý: đảm bảo token object có các trường: mint, balance, decimals (với decimals có thể từ dữ liệu Solscan)
            const payload = {
                wallet: publicKey.toBase58(),
                tokens: tokensToBurn.map(token => ({
                    mint: token.mint,
                    balance: token.balance,
                    decimals: token.decimals || 0
                }))
            };

            // Gọi backend API tạo transaction burn
            const { data } = await axios.post(`${API_URL}/burn`, payload);
            if (!data.tx) throw new Error('Did not receive transaction from server');

            // Chuyển transaction từ base64 về đối tượng Transaction
            const txBuffer = Buffer.from(data.tx, 'base64');
            const transaction = Transaction.from(txBuffer);

            // Sử dụng wallet adapter để ký transaction
            const signedTx = await signTransaction(transaction);

            // Gửi transaction đã ký lên mạng lưới Solana
            const txid = await connection.sendRawTransaction(signedTx.serialize());
            console.log('Transaction sent:', txid);

            // Đợi xác nhận transaction
            await connection.confirmTransaction(txid, 'confirmed');
            console.log('Transaction confirmed');

            // Sau khi burn thành công, tự động chuyển sang chức năng claim (hoặc trang Claim)
            navigate('/claim'); // Đảm bảo bạn có định nghĩa route /claim
        } catch (error) {
            console.error('Lỗi trong quá trình burn:', error);
            alert('Error burn token.');
        } finally {
            setBurning(false);
        }
    };

    if (!publicKey) {
        return <div>Please connect your Solana wallet.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-xl font-bold mb-4">Token list</h2>
            {loading ? (
                <p>Loading token...</p>
            ) : (
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="p-2 border">Select</th>
                            <th className="p-2 border">Icon</th>
                            <th className="p-2 border">Name Token</th>
                            <th className="p-2 border">address</th>
                            <th className="p-2 border">Quantity</th>
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
                    {burning ? "Burning..." : "🔥 Burn Selected Tokens"}
                </button>
            </div>
        </div>
    );
};

export default BurnTokens;
*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@solana/web3.js';
import { Buffer } from 'buffer';

const API_URL = import.meta.env.VITE_API_URL || 'https://cleanyoursol.com/api';

const BurnTokens = () => {
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const navigate = useNavigate();

    const [tokens, setTokens] = useState([]);
    const [selectedTokens, setSelectedTokens] = useState([]);
    const [loading, setLoading] = useState(false);
    const [burning, setBurning] = useState(false);

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
                console.error('Lỗi tải token:', err);
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
            console.log("Response from burn-claim:", data);
            // Kiểm tra xem backend trả về trường "tx" hay không
            if (!data.tx) throw new Error('Không nhận được giao dịch từ server');

            // Chuyển từ base64 về đối tượng Transaction
            const txBuffer = Buffer.from(data.tx, 'base64');
            const transaction = Transaction.from(txBuffer);

            // Yêu cầu người dùng ký giao dịch (1 lần duy nhất)
            const signedTx = await signTransaction(transaction);

            // Gửi giao dịch đã ký lên mạng lưới Solana
            const txid = await connection.sendRawTransaction(signedTx.serialize());
            console.log('Giao dịch đã gửi:', txid);

            // Đợi xác nhận giao dịch
            await connection.confirmTransaction(txid, 'confirmed');
            console.log('Giao dịch đã xác nhận');

            // Sau khi burn thành công, chuyển hướng sang trang Claim
            navigate('/claim');
        } catch (error) {
            console.error('Lỗi khi burn token:', error);
            alert('Có lỗi xảy ra trong quá trình burn token.');
        } finally {
            setBurning(false);
        }
    };

    if (!publicKey) {
        return <div>Vui lòng kết nối ví Solana của bạn.</div>;
    }

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

export default BurnTokens;
