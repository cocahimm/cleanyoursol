import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import CSS của wallet adapter
import "@solana/wallet-adapter-react-ui/styles.css";

export const WalletContext = ({ children }) => {
    // Chọn mạng Solana (mainnet-beta / devnet / testnet)
    const network = WalletAdapterNetwork.Mainnet;

    // Tạo kết nối với blockchain Solana
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // Khởi tạo danh sách ví
    const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
