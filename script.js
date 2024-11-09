// Import the necessary libraries for Solana connection and Firestore
import { Connection, PublicKey } from '@solana/web3.js';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Initialize Firestore
const db = getFirestore();

// Connect to Solana wallet using Phantom
let solanaProvider;
if (window.solana && window.solana.isPhantom) {
    solanaProvider = window.solana;
} else {
    alert("Phantom Wallet is required to play the coin flip game.");
}

// Set up the Solana connection
const solanaConnection = new Connection('https://api.mainnet-beta.solana.com');

// Initialize Firestore collection for game data
const gameCollection = collection(db, "coinFlipGames");

// Handle the connection status of Phantom wallet
const connectWallet = async () => {
    if (solanaProvider) {
        try {
            const response = await solanaProvider.connect();
            console.log('Connected to Solana wallet:', response.publicKey.toString());
            return response.publicKey;
        } catch (err) {
            console.error('Failed to connect:', err);
        }
    } else {
        console.error('No Phantom wallet found.');
    }
};

// Function to start the coin flip game
const flipCoin = async () => {
    const userPublicKey = await connectWallet();
    if (!userPublicKey) return;

    const betAmount = parseFloat(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Please enter a valid bet amount.");
        return;
    }

    // Simulate a coin flip (heads or tails)
    const flipResult = Math.random() > 0.5 ? 'Heads' : 'Tails';
    const resultMessage = `You flipped: ${flipResult}`;

    // Log the game result to Firestore
    try {
        await setDoc(doc(gameCollection, userPublicKey.toString()), {
            betAmount: betAmount,
            flipResult: flipResult,
            timestamp: new Date()
        });
        alert(resultMessage);
    } catch (err) {
        console.error("Error saving game data:", err);
    }
};

// Event listener for the "Flip" button
document.getElementById('flip-btn').addEventListener('click', flipCoin);
