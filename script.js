import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase configuration for Web (replace with your config)
const firebaseConfig = {
    apiKey: "AIzaSyA3WrlDgDgyIwDF-vHexWlqxs1IwVuEu9E",
    authDomain: "flipforfortune-4ab65.firebaseapp.com",
    projectId: "flipforfortune-4ab65",
    storageBucket: "flipforfortune-4ab65.firebasestorage.app",
    messagingSenderId: "959758907497",
    appId: "1:959758907497:web:39e430a44ffe6f26114af8",
    measurementId: "G-MMMB13NNQP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Variables for tracking game state
let clickCount = 0;
let userChoice = null;
let userAddress = null;

// Function to connect Phantom wallet
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            await window.solana.connect();
            userAddress = window.solana.publicKey.toString(); // Store wallet address
            console.log("Connected with public key:", userAddress);
            document.getElementById("message").innerText = `Connected with Phantom wallet: ${userAddress}`;
            document.getElementById("login-button").style.display = "none"; // Hide login button

            // Enable game buttons
            document.getElementById("heads-button").disabled = false;
            document.getElementById("tails-button").disabled = false;
            document.getElementById("spin-button").disabled = false;

            // Fetch click count from Firestore (if exists)
            const userDoc = await getDoc(doc(db, "leaderboard", userAddress));
            if (userDoc.exists()) {
                clickCount = userDoc.data().clicks;
            } else {
                // If no user document exists, initialize it
                clickCount = 0;
                await setDoc(doc(db, "leaderboard", userAddress), {
                    walletAddress: userAddress,
                    clicks: clickCount
                });
            }
            document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;

            // Fetch and display leaderboard
            fetchLeaderboard();
        } catch (err) {
            console.error("Failed to connect:", err);
        }
    } else {
        alert("Phantom wallet not found. Please install Phantom to connect.");
    }
}

// Function to handle heads or tails choice
function handleChoice(choice) {
    userChoice = choice;
    console.log(`User chose: ${choice}`);
}

// Function to handle the coin flip (spin)
async function flipCoin() {
    if (!userChoice) {
        alert("Please select Heads or Tails first!");
        return;
    }

    // Simulate coin flip
    const flipResult = Math.random() < 0.5 ? "Heads" : "Tails";
    const resultMessage = `The coin landed on ${flipResult}!`;

    // Check if user won
    if (userChoice === flipResult) {
        resultMessage += " You win!";
        clickCount++;
    } else {
        resultMessage += " You lose!";
    }

    // Update the click count in Firestore
    await updateDoc(doc(db, "leaderboard", userAddress), {
        clicks: clickCount
    });

    document.getElementById("clicks").innerText = `Clicks: ${clickCount}`;
    alert(resultMessage);

    // Reset user choice after flip
    userChoice = null;
}

// Function to fetch and display the leaderboard from Firestore
async function fetchLeaderboard() {
    try {
        const querySnapshot = await getDocs(collection(db, "leaderboard"));
        const leaderboard = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            leaderboard.push({
                walletAddress: data.walletAddress,
                clicks: data.clicks
            });
        });

        // Sort leaderboard by clicks (highest first)
        leaderboard.sort((a, b) => b.clicks - a.clicks);

        // Display leaderboard on the page
        const leaderboardElement = document.getElementById("leaderboard");
        leaderboardElement.innerHTML = ''; // Clear previous data
        leaderboard.forEach((user, index) => {
            const listItem = document.createElement("li");
            listItem.innerText = `${index + 1}. Wallet: ${user.walletAddress} - Clicks: ${user.clicks}`;
            leaderboardElement.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

// Event listeners
document.getElementById("login-button").addEventListener("click", connectPhantom);
document.getElementById("heads-button").addEventListener("click", () => handleChoice("Heads"));
document.getElementById("tails-button").addEventListener("click", () => handleChoice("Tails"));
document.getElementById("spin-button").addEventListener("click", flipCoin);

// Fetch and display leaderboard on page load
window.onload = fetchLeaderboard;
