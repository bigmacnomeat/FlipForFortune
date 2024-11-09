// Assuming you have already connected to Solana Wallet and obtained the user's public key
let walletPublicKey = null;  // Replace with the actual wallet's public key

// Function to handle the connection and wallet initialization
const connectButton = document.getElementById('connectButton');
const betButton = document.getElementById('betButton');
const walletAddressText = document.getElementById('walletAddress');

connectButton.addEventListener('click', async () => {
    try {
        // Connect to the wallet (e.g., Phantom Wallet)
        const { publicKey } = await window.solana.connect();
        walletPublicKey = publicKey;
        walletAddressText.textContent = `Wallet: ${walletPublicKey.toString()}`;
        betButton.disabled = false; // Enable betting after connection
    } catch (err) {
        console.error('Failed to connect wallet:', err);
    }
});

// Function to handle the betting logic
betButton.addEventListener('click', async () => {
    try {
        if (!walletPublicKey) {
            alert('Connect a wallet first!');
            return;
        }

        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
        const fromWallet = walletPublicKey;  // Connected wallet
        const toWallet = new solanaWeb3.PublicKey('BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr');  // Recipient wallet

        // Transfer 0.01 SOL
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromWallet,
                toPubkey: toWallet,
                lamports: 1000000000,  // 0.01 SOL (in lamports)
            })
        );

        // Send the transaction
        const { signature } = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [walletPublicKey]);
        console.log('Transaction confirmed with signature:', signature);

        // Check if the transaction was successful (you can add additional logic here)
        const isWinner = Math.random() < 0.5;  // Random winner for demo (50% chance)
        if (isWinner) {
            // If the user wins, send 0.02 SOL to the connected wallet
            const winTransaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: toWallet,  // BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr wallet
                    toPubkey: fromWallet,  // User's wallet
                    lamports: 2000000000,  // 0.02 SOL
                })
            );
            await solanaWeb3.sendAndConfirmTransaction(connection, winTransaction, [walletPublicKey]);
            alert('You win! 0.02 SOL sent to your wallet.');
        } else {
            // If the user loses, nothing more happens (since the bet is lost)
            alert('You lose! 0.01 SOL has been sent to the house.');
        }

    } catch (err) {
        console.error('Transaction failed:', err);
        alert('Transaction failed. Please try again.');
    }
});
