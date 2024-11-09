// Firebase Configuration (Replace with your Firebase config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);

// Solana connection setup
const { Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection, clusterApiUrl } = window.solanaWeb3;

// Global variables
let userWallet = null;
let connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Button to connect wallet
document.getElementById('connectButton').onclick = async () => {
  if (window.solana && window.solana.isPhantom) {
    try {
      // Requesting the user to connect Phantom wallet
      userWallet = await window.solana.connect();
      document.getElementById('walletStatus').textContent = `Wallet connected: ${userWallet.publicKey.toString()}`;

      // Show game interface
      document.getElementById('flipGame').style.display = 'block';
    } catch (err) {
      document.getElementById('walletStatus').textContent = 'Failed to connect wallet';
    }
  } else {
    alert('Please install Phantom wallet to continue.');
  }
};

// Coin flip game logic
document.getElementById('flipButton').onclick = async () => {
  const flipChoice = document.getElementById('flipChoice').value;
  const betAmount = parseFloat(document.getElementById('betAmount').value);
  
  if (!betAmount || betAmount <= 0) {
    document.getElementById('flipResult').textContent = 'Please enter a valid bet amount.';
    return;
  }

  if (userWallet) {
    // Check user's balance
    const balance = await connection.getBalance(userWallet.publicKey);
    const userSOL = balance / LAMPORTS_PER_SOL;
    
    if (userSOL < betAmount) {
      document.getElementById('flipResult').textContent = 'Insufficient balance to play!';
      return;
    }

    // Simulate coin flip
    const flipOutcome = Math.random() < 0.5 ? 'heads' : 'tails';

    // Send transaction (charge the user for betting)
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: userWallet.publicKey,
        toPubkey: userWallet.publicKey, // You can update this to send to a winner address
        lamports: betAmount * LAMPORTS_PER_SOL,
      })
    );

    try {
      // Send the transaction to Solana
      const signature = await connection.sendTransaction(transaction, [Keypair.fromSecretKey(new Uint8Array(userWallet.secretKey))]);

      // Confirm transaction
      await connection.confirmTransaction(signature);

      // Log the outcome of the coin flip
      if (flipChoice === flipOutcome) {
        document.getElementById('flipResult').textContent = `You win! The coin landed on ${flipOutcome}.`;
      } else {
        document.getElementById('flipResult').textContent = `You lose! The coin landed on ${flipOutcome}.`;
      }

      // Log result to Firebase (for records)
      db.collection('gameResults').add({
        publicKey: userWallet.publicKey.toString(),
        flipChoice: flipChoice,
        flipOutcome: flipOutcome,
        betAmount: betAmount,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });

    } catch (error) {
      document.getElementById('flipResult').textContent = 'Transaction failed: ' + error.message;
    }
  }
};
