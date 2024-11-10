const connectButton = document.getElementById('connectButton');
const walletAddressDisplay = document.getElementById('walletAddress');
const statusDisplay = document.getElementById('status');
const betButton = document.getElementById('betButton');
const gameStatusDisplay = document.getElementById('gameStatus');

let userWalletPublicKey = null; // Store user's wallet public key

const recipientPublicKey = new solanaWeb3.PublicKey('BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr'); // This is the wallet to receive or send funds

// Connect wallet
connectButton.addEventListener('click', async () => {
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

        // Enable the bet button
        betButton.disabled = false;
        statusDisplay.textContent = "Wallet successfully connected!";
        connectButton.textContent = "Disconnect Wallet";
    } catch (error) {
        console.error('Error connecting to wallet:', error);
        alert('Failed to connect wallet.');
    }
});

// Function to flip the coin (randomly returns heads or tails)
function flipCoin() {
    return Math.random() < 0.5 ? 'heads' : 'tails';
}

// Bet button click event
betButton.addEventListener('click', async () => {
    if (!userWalletPublicKey) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        // Set the bet amount
        const betAmount = 0.01; // 0.01 SOL
        const betInLamports = solanaWeb3.LAMPORTS_PER_SOL * betAmount; // Convert SOL to lamports

        // Create a connection to the Solana network
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

        // Create a transaction to send the bet amount to the recipient
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: userWalletPublicKey,
                toPubkey: recipientPublicKey,
                lamports: betInLamports,
            })
        );

        // Send the transaction
        const { signature } = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [window.solana]);

        gameStatusDisplay.textContent = "Bet placed! Flipping coin...";

        // Simulate coin flip
        const result = flipCoin();
        setTimeout(async () => {
            if (result === 'heads') {
                gameStatusDisplay.textContent = "You won! Sending 0.02 SOL...";
                // Transfer 0.02 SOL if the player wins
                await sendSolToWallet(0.02);
            } else {
                gameStatusDisplay.textContent = "You lost. Sending your bet to the wallet...";
                // Transfer the 0.01 SOL bet to the recipient if the player loses
                await sendSolToWallet(0.01);
            }
        }, 2000); // Simulate a 2-second delay for coin flip
    } catch (error) {
        console.error('Error placing the bet:', error);
        alert('Bet failed. Please try again.');
    }
});

// Send SOL to the recipient wallet
async function sendSolToWallet(amountInSol) {
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: userWalletPublicKey,
            toPubkey: recipientPublicKey,
            lamports: solanaWeb3.LAMPORTS_PER_SOL * amountInSol,
        })
    );
    try {
        const { signature } = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [window.solana]);
        console.log(`Transaction successful with signature: ${signature}`);
    } catch (error) {
        console.error('Error sending SOL:', error);
        alert('Error during transaction. Please try again.');
    }
}
