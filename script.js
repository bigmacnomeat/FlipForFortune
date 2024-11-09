import { Connection, PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL } from 'https://unpkg.com/@solana/web3.js@1.73.0/lib/index.iife.min.js';

// Firebase setup (from earlier script)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";
const firebaseConfig = {
    apiKey: "AIzaSyA3WrlDgDgyIwDF-vHexWlqxs1IwVuEu9E",
    authDomain: "flipforfortune-4ab65.firebaseapp.com",
    projectId: "flipforfortune-4ab65",
    storageBucket: "flipforfortune-4ab65.firebasestorage.app",
    messagingSenderId: "959758907497",
    appId: "1:959758907497:web:39e430a44ffe6f26114af8",
    measurementId: "G-MMMB13NNQP"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Connect to Solana Wallet
let connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");
let walletPublicKey = null;

// UI Elements
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const walletAddressDiv = document.getElementById('wallet-address');
const gameContainer = document.getElementById('game-container');
const coinFlipResult = document.getElementById('coin-flip-result');
const headsBtn = document.getElementById('heads-btn');
const tailsBtn = document.getElementById('tails-btn');

// Function to connect the wallet
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            walletPublicKey = new PublicKey(response.publicKey.toString());
            walletAddressDiv.innerHTML = `Wallet Address: ${walletPublicKey.toString()}`;
            connectWalletBtn.style.display = 'none';
            gameContainer.style.display = 'block';
        } catch (err) {
            console.log('Connection failed', err);
        }
    } else {
        alert('Please install Phantom Wallet!');
    }
}

// Flip the Coin
async function flipCoin(choice) {
    if (!walletPublicKey) {
        alert('Please connect your wallet!');
        return;
    }

    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const isWinner = result === choice;
    coinFlipResult.innerHTML = `Result: ${result}. You ${isWinner ? 'Win' : 'Lose'}.`;

    // Handle winner and loser logic (transaction)
    if (isWinner) {
        // Here, add the logic to send the winnings to the winner's wallet
        alert('You won!');
        // You would add logic here to send SOL or whatever token to the winner's wallet
    } else {
        // Here, deduct from the player's wallet or send it to the "loss" wallet
        alert('You lost!');
        await sendSolanaTransaction(walletPublicKey, "BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr", 0.01);
    }
}

// Function to send Solana transaction (transfer SOL)
async function sendSolanaTransaction(fromWallet, toWalletAddress, amountInSOL) {
    const fromKeypair = Keypair.generate();
    const toPublicKey = new PublicKey(toWalletAddress);

    // Transaction setup
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: fromWallet,
            toPubkey: toPublicKey,
            lamports: amountInSOL * LAMPORTS_PER_SOL, // Convert SOL to lamports
        })
    );

    // Send transaction
    try {
        const signature = await connection.sendTransaction(transaction, [fromKeypair], { preflightCommitment: "processed" });
        await connection.confirmTransaction(signature, "processed");
        alert('Transaction successful!');
    } catch (error) {
        console.error('Transaction failed', error);
        alert('Transaction failed');
    }
}

// Event listeners for coin flip choices
headsBtn.addEventListener('click', () => flipCoin('Heads'));
tailsBtn.addEventListener('click', () => flipCoin('Tails'));

// Connect wallet on page load
connectWalletBtn.addEventListener('click', connectWallet);
