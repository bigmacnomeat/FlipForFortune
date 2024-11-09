// Import Firebase SDKs using modular imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics.js";

// Solana Web3.js for wallet interaction
import { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl } from 'https://cdn.jsdelivr.net/npm/@solana/web3.js@1.38.0/dist/solana-web3.js';

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA3WrlDgDgyIwDF-vHexWlqxs1IwVuEu9E",
  authDomain: "flipforfortune-4ab65.firebaseapp.com",
  projectId: "flipforfortune-4ab65",
  storageBucket: "flipforfortune-4ab65.firebasestorage.app",
  messagingSenderId: "959758907497",
  appId: "1:959758907497:web:39e430a44ffe6f26114af8",
  measurementId: "G-MMMB13NNQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);  // Correct method for modular Firebase SDK
const analytics = getAnalytics(app);

// Set up Solana connection
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Connect wallet button and event listener
const connectWalletButton = document.getElementById('connectWalletButton');
const walletInfoDiv = document.getElementById('walletInfo');
const flipButton = document.getElementById('flipButton');
const resultDiv = document.getElementById('result');
const transactionStatusDiv = document.getElementById('transactionStatus');

let walletPublicKey = null;

connectWalletButton.addEventListener('click', () => {
  if (window.solana && window.solana.isPhantom) {
    window.solana.connect().then((response) => {
      walletPublicKey = response.publicKey;
      walletInfoDiv.textContent = `Connected: ${walletPublicKey.toString()}`;
      connectWalletButton.disabled = true;
      flipButton.disabled = false;
    }).catch((err) => {
      walletInfoDiv.textContent = 'Error connecting wallet';
    });
  } else {
    walletInfoDiv.textContent = 'Please install Phantom Wallet';
  }
});

// Flip Coin game logic
flipButton.addEventListener('click', async () => {
  if (!walletPublicKey) {
    resultDiv.textContent = 'Please connect your wallet first';
    return;
  }

  const flipResult = Math.random() < 0.5 ? 'Heads' : 'Tails';
  resultDiv.textContent = `Result: ${flipResult}`;

  // Create a transaction and send some lamports
  try {
    // Set up the "from" and "to" wallet addresses for the transaction
    const recipientWallet = flipResult === 'Heads' ? walletPublicKey : "BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr"; // Loss wallet

    // Create a transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletPublicKey,  // This is the connected wallet's public key
        toPubkey: recipientWallet,    // The recipient wallet (either the player's wallet or the loss wallet)
        lamports: LAMPORTS_PER_SOL / 100, // Small transaction for demonstration
      })
    );

    // Sign the transaction
    const signedTransaction = await window.solana.signTransaction(transaction);
    const txId = await connection.sendRawTransaction(signedTransaction.serialize());
    
    transactionStatusDiv.textContent = `Transaction Sent: ${txId}`;
  } catch (error) {
    transactionStatusDiv.textContent = 'Transaction failed';
  }
});
