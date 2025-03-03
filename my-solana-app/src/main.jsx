/*import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WalletContext } from "./context/WalletContext.jsx";
import { BrowserRouter } from "react-router-dom"; // ✅ Import đúng Router

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
// Import ví bạn muốn sử dụng, ví dụ PhantomWalletAdapter
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
const SOLANA_RPC_ENDPOINT = "https://divine-old-bridge.solana-mainnet.quiknode.pro/e6cba5f73fa09260f937f65f73bbe8fa7fa0dd24";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <WalletContext>
            <BrowserRouter> 
                <App />
            </BrowserRouter>
        </WalletContext>
    </React.StrictMode>
);
*/
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { WalletContext } from "./context/WalletContext.jsx";
import { BrowserRouter } from "react-router-dom";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import "./index.css";

// Định nghĩa endpoint RPC của bạn
const SOLANA_RPC_ENDPOINT = "https://divine-old-bridge.solana-mainnet.quiknode.pro/e6cba5f73fa09260f937f65f73bbe8fa7fa0dd24";

// Khởi tạo danh sách ví (ở đây chỉ sử dụng Phantom)
const wallets = [new PhantomWalletAdapter()];

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WalletContext>
      <ConnectionProvider endpoint={SOLANA_RPC_ENDPOINT}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WalletContext>
  </React.StrictMode>
);
