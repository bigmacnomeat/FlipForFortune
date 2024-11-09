import { Connection, PublicKey, Transaction, SystemProgram } from 'https://unpkg.com/@solana/web3.js@1.73.0/lib/index.iife.min.js';

const connectButton = document.getElementById("connectButton");
const betButton = document.getElementById("betButton");
const statusElement = document.getElementById("status");

let walletPublicKey = null;
let connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

const winningWallet = new PublicKey("BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr");  // Predefined wallet for winnings

// Connect wallet button click handler
connectButton.addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();  // Connect the wallet
            walletPublicKey = window.solana.publicKey;
            connectButton.innerText = "Wallet Connected";
            statusElement.innerText = `Wallet Address: ${walletPublicKey.toString()}`;
            betButton.disabled = false;  // Enable the bet button
        } catch (err) {
            console.error(err);
            statusElement.innerText = "Failed to connect wallet.";
        }
    } else {
        statusElement.innerText = "Please install Phantom wallet.";
    }
});

// Bet button click handler
betButton.addEventListener("click", async () => {
    if (!walletPublicKey) {
        statusElement.innerText = "Please connect your wallet first.";
        return;
    }

    const betAmount = 0.01;  // Bet amount in SOL
    const prizeAmount = 0.02;  // Prize amount in SOL

    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: walletPublicKey,
                toPubkey: winningWallet,
                lamports: betAmount * 1e9,  // Convert SOL to lamports
            })
        );

        const signature = await window.solana.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);

        const win = Math.random() < 0.5;  // Random coin flip (50% chance)
        const resultMessage = win ? "You win!" : "You lose.";

        // Send prize or deduct bet based on the result
        if (win) {
            const prizeTransaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: winningWallet,
                    toPubkey: walletPublicKey,
                    lamports: prizeAmount * 1e9,  // Convert SOL to lamports
                })
            );

            const prizeSignature = await window.solana.signAndSendTransaction(prizeTransaction);
            await connection.confirmTransaction(prizeSignature);
            statusElement.innerText = `${resultMessage} You received 0.02 SOL from the wallet!`;
        } else {
            statusElement.innerText = `${resultMessage} Your 0.01 SOL has been sent to the wallet.`;
        }
    } catch (err) {
        console.error(err);
        statusElement.innerText = "Transaction failed.";
    }
});
