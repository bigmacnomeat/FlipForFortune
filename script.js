document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const walletAddressDisplay = document.getElementById('walletAddress');
    const statusDisplay = document.getElementById('status');
    const betButton = document.getElementById('betButton');
    const gameStatusDisplay = document.getElementById('gameStatus');

    let userWalletPublicKey = null;

    const recipientPublicKey = new solanaWeb3.PublicKey('BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr');

    connectButton.addEventListener('click', async () => {
        try {
            const provider = window.solana;
            if (!provider) {
                alert("Please install a Solana wallet like Phantom to connect.");
                return;
            }

            const response = await provider.connect();
            userWalletPublicKey = response.publicKey;
            walletAddressDisplay.textContent = `Connected Wallet: ${userWalletPublicKey.toString()}`;
            betButton.disabled = false;
            statusDisplay.textContent = "Wallet successfully connected!";
            connectButton.textContent = "Disconnect Wallet";
        } catch (error) {
            console.error('Error connecting to wallet:', error);
            alert('Failed to connect wallet.');
        }
    });

    function flipCoin() {
        return Math.random() < 0.5 ? 'heads' : 'tails';
    }

    betButton.addEventListener('click', async () => {
        if (!userWalletPublicKey) {
            alert("Please connect your wallet first.");
            return;
        }

        try {
            const betAmount = 0.01;
            const betInLamports = solanaWeb3.LAMPORTS_PER_SOL * betAmount;

            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');

            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: userWalletPublicKey,
                    toPubkey: recipientPublicKey,
                    lamports: betInLamports,
                })
            );

            const { signature } = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [window.solana]);
            gameStatusDisplay.textContent = "Bet placed! Flipping coin...";

            const result = flipCoin();
            setTimeout(async () => {
                if (result === 'heads') {
                    gameStatusDisplay.textContent = "You won! Sending 0.02 SOL...";
                    await sendSolToWallet(0.02);
                } else {
                    gameStatusDisplay.textContent = "You lost. Sending your bet to the wallet...";
                    await sendSolToWallet(0.01);
                }
            }, 2000);
        } catch (error) {
            console.error('Error placing the bet:', error);
            alert('Bet failed. Please try again.');
        }
    });

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
            alert('Error during transaction. Please try again.");
        }
    }
});
