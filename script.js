document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const walletAddressDisplay = document.getElementById('walletAddress');
    const statusDisplay = document.getElementById('status');
    const betButton = document.getElementById('betButton');
    const gameStatusDisplay = document.getElementById('gameStatus');

    let userWalletPublicKey = null;

    // Replace with the recipient wallet address where the bets go
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

            const { signature } = await window.solana.signAndSendTransaction(transaction);
            console.log(`Transaction successful with signature: ${signature}`);
            gameStatusDisplay.textContent = "Bet placed! Flipping coin...";

            const result = flipCoin();
            setTimeout(() => {
                gameStatusDisplay.textContent = result === 'heads' ? "You won!" : "You lost. Better luck next time!";
            }, 2000);
        } catch (error) {
            console.error('Error placing the bet:', error);
            alert('Bet failed. Please try again.');
        }
    });
});
