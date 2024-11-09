window.onload = () => {
  const { Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection, clusterApiUrl } = window.solanaWeb3;

  let userKeypair = null;

  // Button to connect wallet
  document.getElementById("connectButton").onclick = () => {
    const secretKeyInput = document.getElementById("secretKeyInput").value;
    
    if (secretKeyInput) {
      try {
        // Decode the secret key and generate the Keypair
        const secretKeyBytes = Uint8Array.from(atob(secretKeyInput), c => c.charCodeAt(0));
        userKeypair = Keypair.fromSecretKey(secretKeyBytes);

        // Display wallet public key
        document.getElementById("status").textContent = `Wallet connected: ${userKeypair.publicKey.toBase58()}`;

        // Show transaction button and Flip Game section
        document.getElementById("sendTransactionButton").style.display = "inline-block";
        document.getElementById("flipGameSection").style.display = "block";
      } catch (error) {
        document.getElementById("status").textContent = "Error: Invalid Secret Key!";
      }
    }
  };

  // Button to send a transaction (optional, part of wallet functionality)
  document.getElementById("sendTransactionButton").onclick = async () => {
    if (userKeypair) {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

      // Generate a new recipient Keypair for demonstration
      const recipientKeypair = Keypair.generate();

      // Create a new transaction with transfer instruction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userKeypair.publicKey,
          toPubkey: recipientKeypair.publicKey,
          lamports: LAMPORTS_PER_SOL, // 1 SOL
        })
      );

      // Send the transaction
      try {
        const signature = await connection.sendTransaction(transaction, [userKeypair]);
        document.getElementById("transactionStatus").textContent = `Transaction sent! Signature: ${signature}`;
      } catch (error) {
        document.getElementById("transactionStatus").textContent = `Transaction failed: ${error.message}`;
      }
    }
  };

  // Flip Game logic
  document.getElementById("flipButton").onclick = async () => {
    const flipChoice = document.getElementById("flipChoice").value;
    const flipBetAmount = parseFloat(document.getElementById("flipBetAmount").value);

    if (!flipBetAmount || flipBetAmount <= 0) {
      document.getElementById("flipGameResult").textContent = "Please enter a valid bet amount!";
      return;
    }

    if (userKeypair) {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const flipOutcome = Math.random() < 0.5 ? "heads" : "tails"; // Randomly choose heads or tails

      // Check if the user has enough SOL to play
      const userBalance = await connection.getBalance(userKeypair.publicKey);
      const userSOLBalance = userBalance / LAMPORTS_PER_SOL;

      if (userSOLBalance < flipBetAmount) {
        document.getElementById("flipGameResult").textContent = "Insufficient balance for the bet!";
        return;
      }

      // Create a transaction to send the bet amount
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userKeypair.publicKey,
          toPubkey: userKeypair.publicKey, // You can replace this with a winner's address if you like
          lamports: flipBetAmount * LAMPORTS_PER_SOL,
        })
      );

      try {
        // Send the transaction
        const signature = await connection.sendTransaction(transaction, [userKeypair]);
        await connection.confirmTransaction(signature);

        // Determine the result
        if (flipChoice === flipOutcome) {
          document.getElementById("flipGameResult").textContent = `You win! The coin landed on ${flipOutcome}.`;
        } else {
          document.getElementById("flipGameResult").textContent = `You lose! The coin landed on ${flipOutcome}.`;
        }
      } catch (error) {
        document.getElementById("flipGameResult").textContent = `Transaction failed: ${error.message}`;
      }
    }
  };
};
