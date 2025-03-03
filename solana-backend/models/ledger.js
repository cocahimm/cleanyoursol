// claim-solana/models/ledger.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ledgerSchema = new Schema({
  publicKey: { type: String, required: true },
  tokenId: { type: String, required: true },
  txHash: { type: String, required: true },
  amount: { type: Number, required: true },
  referral: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ledger', ledgerSchema);

exports.saveLedgerEntry = async (publicKey, tokenId, txHash, amount, referral = null) => {
    try {
        console.log("📥 Saving Ledger Entry:", { publicKey, tokenId, txHash, amount, referral });

        const newEntry = new Ledger({
            publicKey,
            tokenId,
            txHash,
            amount,
            referral,
            timestamp: new Date(),
        });

        await newEntry.save();
        //console.log("✅ Ledger entry saved successfully:", newEntry);
    } catch (error) {
        console.error("❌ Error saving ledger entry:", error);
    }
};