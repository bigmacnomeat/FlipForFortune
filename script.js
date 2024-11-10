// Import Solana Web3.js library from CDN
const { Connection, PublicKey, Transaction, SystemProgram } = window.solanaWeb3;

// Solana RPC URL (Mainnet Beta)
const rpcUrl = "https://api.mainnet-beta.solana.com";
const connection = new Connection(rpcUrl, "confirmed");

// House wallet address (the wallet that will receive the SOL based on the game result)
const houseWallet = new PublicKey("BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr");

// DOM elements
const connectWalletButton = document.getElementById('connectWalletButton');
const betButton = document.getElementById('betButton');
const walletAddressDisplay = document.getElementById('walletAddress');
const statusDisplay = document.getElementById('status');

let userWalletPublicKey = null; // Will store the user's wallet public key after connection

// Connect Wallet Function
async function connectWallet() {
    try {
        const provider = window.solana;
        if (!provider) {
            alert("Please install a Solana wallet like Phantom to connect.");
            return;
        }

        // Connect to the wallet
        const response = await provider.connect();
        userWalletPublicKey = response.publicKey;
        
        // Display wallet address
        walletAddressDisplay.textContent = `Connected Wallet: ${userWalletPublicKey.toString()}`;

        // Show the Bet button
        betButton.style.display = 'inline-block';
    } catch (error) {
        console.error('Error connecting to wallet:', error);
        alert('Failed to connect wallet.');
    }
}

// Bet Function - 0.01 SOL bet
async function placeBet() {
    try {
        if (!userWalletPublicKey) {
            alert("Please connect your wallet first.");
            return;
        }

        // Define the transaction
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: userWalletPublicKey,
                toPubkey: houseWallet,
                lamports: 0.01 * 1e9, // 0.01 SOL in lamports
            })
        );

        // Send the transaction
        const provider = window.solana;
        const { signature } = await provider.sendTransaction(transaction, [provider.publicKey]);

        // Confirm the transaction
        await connection.confirmTransaction(signature);
        
        // Call the flipCoin function to determine win/loss
        flipCoin();
    } catch (error) {
        console.error("Error placing bet:", error);
        alert("Transaction failed.");
    }
}

// Coin Flip Logic
async function flipCoin() {
    try {
        // Simulate a random coin flip (50/50 chance)
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const resultMessage = `The coin landed on ${result}.`;

        // Log the result
        console.log(resultMessage);
        statusDisplay.textContent = resultMessage;

        // Send winnings or loss to the appropriate wallet
        if (result === 'heads') {
            await sendSolToHouseWallet(0.02); // If user wins, they get 0.02 SOL from the house wallet
            statusDisplay.textContent += "\nYou win! 0.02 SOL was sent to your wallet.";
        } else {
            statusDisplay.textContent += "\nYou lose! 0.01 SOL was sent to the house wallet.";
        }
    } catch (error) {
        console.error("Error in coin flip:", error);
        statusDisplay.textContent = "Error during coin flip.";
    }
}

// Send SOL to the house wallet or user based on result
async function sendSolToHouseWallet(amount) {
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: houseWallet, // House wallet will send SOL
            toPubkey: userWalletPublicKey, // User's wallet will receive SOL
            lamports: amount * 1e9, // Convert SOL to lamports
        })
    );

    try {
        const provider = window.solana;
        const { signature } = await provider.sendTransaction(transaction, [provider.publicKey]);
        await connection.confirmTransaction(signature);
        console.log("Transaction successful:", signature);
    } catch (error) {
        console.error("Error sending transaction:", error);
        alert("Transaction failed.");
    }
}

// Event Listeners
connectWalletButton.addEventListener('click', connectWallet);
betButton.addEventListener('click', placeBet);
