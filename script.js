let connection;
let provider;
let wallet;

document.getElementById("connectButton").addEventListener("click", async () => {
    // Connect to Phantom Wallet (or other wallet that supports Solana)
    if (window.solana && window.solana.isPhantom) {
        try {
            // Connect to wallet
            await window.solana.connect();
            wallet = window.solana;
            connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
            
            document.getElementById("walletAddress").textContent = `Wallet: ${wallet.publicKey.toString()}`;
            document.getElementById("betButton").disabled = false;
        } catch (err) {
            console.error("Wallet connection failed:", err);
        }
    } else {
        alert("Please install Phantom Wallet!");
    }
});

document.getElementById("betButton").addEventListener("click", async () => {
    // Bet amount is 0.01 SOL
    const betAmount = 0.01 * solanaWeb3.LAMPORTS_PER_SOL;
    const fromWallet = wallet.publicKey;
    const toWallet = new solanaWeb3.PublicKey('BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr');
    
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: fromWallet,
            toPubkey: toWallet,
            lamports: betAmount
        })
    );

    const recentBlockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = fromWallet;

    try {
        // Sign the transaction
        const signature = await window.solana.signTransaction(transaction);

        // Send the transaction
        const txid = await connection.sendRawTransaction(signature.serialize());
        console.log("Transaction sent with ID:", txid);
        await connection.confirmTransaction(txid);
        
        // Randomly decide win or lose (for demonstration)
        const isWin = Math.random() < 0.5; // 50% chance

        if (isWin) {
            console.log("You win! 0.02 SOL will be sent back.");
            await sendSolToWallet(0.02, fromWallet);
        } else {
            console.log("You lose. Your 0.01 SOL is transferred.");
        }
    } catch (err) {
        console.error("Transaction failed:", err);
    }
});

async function sendSolToWallet(amount, toWallet) {
    const transaction = new solanaWeb3.Transaction().add(
        solanaWeb3.SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: toWallet,
            lamports: amount * solanaWeb3.LAMPORTS_PER_SOL
        })
    );

    const recentBlockhash = await connection.getRecentBlockhash();
    transaction.recentBlockhash = recentBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;

    try {
        // Sign the transaction
        const signature = await window.solana.signTransaction(transaction);

        // Send the transaction
        const txid = await connection.sendRawTransaction(signature.serialize());
        console.log("Transaction sent with ID:", txid);
        await connection.confirmTransaction(txid);
    } catch (err) {
        console.error("Transaction failed:", err);
    }
}
