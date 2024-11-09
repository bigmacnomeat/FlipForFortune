// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const walletAddressDiv = document.getElementById('wallet-address');
const gameContainer = document.getElementById('game-container');
const headsBtn = document.getElementById('heads-btn');
const tailsBtn = document.getElementById('tails-btn');
const resultDiv = document.getElementById('result');

// Variables
let walletPublicKey = null;
const LOSS_WALLET = new solanaWeb3.PublicKey("BvKeWCU3nsfW5VpzKhMd7atD5i5qeEQ2ga2t5coDagNr"); // Wallet for losing players

// Connect to the Phantom wallet
async function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        try {
            // Request connection to the wallet
            const response = await window.solana.connect();
            walletPublicKey = new solanaWeb3.PublicKey(response.publicKey.toString());
            walletAddressDiv.innerHTML = `Wallet Address: ${walletPublicKey.toString()}`;
            walletAddressDiv.style.display = 'block';
            connectWalletBtn.style.display = 'none'; // Hide connect button
            gameContainer.style.display = 'block'; // Show game container
        } catch (err) {
            console.error('Failed to connect wallet', err);
            alert('Failed to connect wallet. Please try again.');
        }
    } else {
        alert('Please install Phantom Wallet!');
    }
}

// Coin flip game functionality
async function flipCoin(choice) {
    const coinSide = Math.random() < 0.5 ? 'Heads' : 'Tails';
    resultDiv.innerHTML = `You chose: ${choice}<br>The coin landed on: ${coinSide}`;

    // Determine if the player won or lost
    const isWinner = choice === coinSide;
    if (isWinner) {
        resultDiv.innerHTML += '<br>You win!';
        await transferSOL(walletPublicKey); // Transfer SOL to the player
    } else {
        resultDiv.innerHTML += '<br>You lose.';
        await transferSOL(LOSS_WALLET); // Transfer SOL to the loss wallet
    }
}

// Transfer SOL to a specified wallet
async function transferSOL(toPublicKey) {
    if (!walletPublicKey) {
        alert("Connect your wallet first.");
        return;
    }

    try {
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'), 'confirmed');
        const fromWallet = await window.solana.request({ method: "solana_requestAccounts" });
        const fromKeypair = await solanaWeb3.Keypair.fromSecretKey(new Uint8Array(fromWallet[0]));
        
        // Create a transaction
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: fromKeypair.publicKey,
                toPubkey: toPublicKey,
                lamports: solanaWeb3.LAMPORTS_PER_SOL * 0.001, // Transfer 0.001 SOL
            })
        );

        // Sign the transaction
        const signedTransaction = await window.solana.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());

        await connection.confirmTransaction(txid, 'confirmed');
        console.log(`Transaction successful: ${txid}`);
    } catch (err) {
        console.error("Transaction failed", err);
    }
}

// Event listener for wallet connection
connectWalletBtn.addEventListener('click', connectWallet);

// Event listeners for coin flip buttons
headsBtn.addEventListener('click', () => flipCoin('Heads'));
tailsBtn.addEventListener('click', () => flipCoin('Tails'));
