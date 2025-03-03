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

