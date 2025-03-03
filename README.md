# CleanYourSol

CleanYourSol is a decentralized application built on the Solana blockchain that helps users reclaim SOL by burning unused or empty token accounts. In addition to reclaiming funds, the platform rewards users through a referral and VIP system.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

CleanYourSol provides a simple interface for users to clean up their Solana wallets by burning tokens from empty accounts and reclaiming locked SOL. The application also integrates a referral system and VIP rewards:
- **Token Burn & Claim:** Users can select tokens with non-zero balances to burn. For each burned token, a refund is credited to the wallet.
- **Referral Rewards:** A percentage of the fee (20% of a fixed claim reward) is transferred to the referrer.
- **VIP System:** Referrers are upgraded to higher VIP levels based on their number of claimed referrals, which in turn increases their referral reward percentage.
- **Ledger Logging:** Every transaction is recorded in a ledger for auditing and transparency.
- **Top VIP Leaderboard:** A dedicated page lists the top 50 users with the highest claimed referrals.

## Features

- **Burn Tokens & Close Accounts:** Execute token burns and close associated token accounts in a single transaction.
- **Claim SOL Refunds:** Automatically claim SOL refunds per token burned.
- **Referral & VIP Rewards:** Distribute fees between admin and referrers based on referral rates and VIP levels.
- **Batch Processing Modes:** Users can choose between Fast mode (process up to 10 tokens per transaction) or Slow mode (process 1 token per transaction) with one-time signing.
- **Responsive UI:** Built with React and styled using Tailwind CSS.
- **Wallet Integration:** Supports Solana wallets such as Phantom through the wallet adapter.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Axios
- **Backend:** Node.js, Express, Mongoose (MongoDB)
- **Blockchain:** Solana, @solana/web3.js, @solana/spl-token
- **Wallet Integration:** @solana/wallet-adapter-react

## Project Structure

/src ├── components │ ├── TokenBurnList.jsx // UI component for token burning │ └── ... // Other UI components ├── pages │ ├── topvipApp.jsx // Independent page for Top VIP leaderboard │ └── ... // Other pages ├── context │ └── WalletContext.jsx // Wallet context provider ├── utils │ ├── balanceUtils.js // Helper for SOL balance checking │ └── vipUtils.js // Helper for VIP logic ├── App.jsx // Main application component ├── main.jsx // Main entry point for the main app └── index.css // Global CSS (including Tailwind CSS)

/server ├── controllers │ ├── burnController.js // Backend endpoint for burn & claim tokens │ ├── ledgerController.js // Controller to save ledger entries │ └── ...
├── models │ ├── user.js // User schema │ ├── referral.js // Referral schema │ └── ledger.js // Ledger schema ├── routes │ ├── tokenRoutes.js // Token-related endpoints │ └── topVipRoutes.js // Endpoint for top VIP leaderboard └── server.js // Express server entry point


## Setup & Installation

1. **Clone the Repository:**  
   ```bash
   git clone https://github.com/yourusername/CleanYourSol.git
   cd CleanYourSol
   2 Install Frontend Dependencies:
   cd src
   3 Install Backend Dependencies:
   npm install
   cd ../server
   **Create a .env file in the server directory with the following variables:
   ADMIN_WALLET=<your-admin-wallet-public-key>
   MONGO_URI=<your-mongodb-connection-string>
   PORT=3000
   - **For the frontend, create a .env file (or configure via Vite) with:
   VITE_API_URL=https://cleanyoursol.com/api
   ## Running the Project
   # Frontend
   - **Start the development server using Vite:
   npm run dev
   - **Access the main app at http://localhost:5173 and the standalone Top VIP page at http://localhost:5173/topvip.html.
   # Backend
   - **Start the Express server:
   cd server
   npm start
   - ** Or use a process manager like PM2 in production.




##Deployment
#Frontend:
- **Build your frontend assets using npm run build and deploy the output to your preferred static hosting provider.
#Backend:
- **Deploy your Node.js Express server (e.g., on Heroku, DigitalOcean, or another VPS) and ensure your MongoDB connection is properly configured.

##Usage
1. Connect Wallet:
- **Users connect their Solana wallet (e.g., Phantom) via the wallet adapter.

2. Burn Tokens:

- **Users can select tokens (only those with a positive balance are shown).
- **A "Select all" button will only select visible tokens.
- **Users can switch between Fast mode (processing up to 10 tokens per transaction) and Slow mode (processing one token per transaction) using a toggle.
- **After confirmation, the selected tokens are burned, their accounts are closed, and the user receives a SOL refund.
- **Referral fees are deducted and transferred according to the configured percentages and the referrer's VIP level.
3. Referral & VIP Rewards:

- **If a referral code is provided (either from localStorage or returned by the backend), referral fees are processed.
- **Ledger entries are saved for each burn/claim transaction, and referral counts update the VIP levels accordingly.
4.Top VIP Leaderboard:

- **A dedicated Top VIP page displays the top 50 users with the highest number of claimed referrals, including their wallet address, VIP level, and total referrals.
## Contributing
   This project is licensed under the MIT License. See the LICENSE file for details.
