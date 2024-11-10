<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Solana Coin Flip Game</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            text-align: center;
            padding: 20px;
        }

        .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        button {
            padding: 10px 20px;
            background-color: #0078d4;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 0;
        }

        button:hover {
            background-color: #005bb5;
        }

        #status {
            margin-top: 20px;
            font-size: 18px;
            font-weight: bold;
        }

        .game-section {
            margin-top: 30px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Connect Your Wallet</h1>
        <button id="connectButton">Connect Wallet</button>
        <p id="walletAddress"></p>
        <p id="status"></p>

        <div class="game-section">
            <h2>Coin Flip Game</h2>
            <button id="betButton" disabled>Place Bet (0.01 SOL)</button>
            <p id="gameStatus"></p>
        </div>
    </div>

    <!-- Include the Buffer polyfill -->
    <script src="https://cdn.jsdelivr.net/npm/buffer@5.7.1/index.min.js"></script>

    <!-- Include Solana Web3.js -->
    <script src="https://unpkg.com/@solana/web3.js@1.73.0/lib/index.iife.min.js"></script>

    <!-- Include the main JavaScript file -->
    <script src="script.js"></script> <!-- Link to the external JavaScript -->
</body>
</html>
