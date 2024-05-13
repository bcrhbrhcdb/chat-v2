// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDisnhcjYmvZc2y9-toeWWKHq9nHYb8Fn4",
  authDomain: "chatroom-50dfb.firebaseapp.com",
  databaseURL: "https://chatroom-50dfb-default-rtdb.firebaseio.com",
  projectId: "chatroom-50dfb",
  storageBucket: "chatroom-50dfb.appspot.com",
  messagingSenderId: "533310796123",
  appId: "1:533310796123:web:1f9cb3326563d3dee72a7e",
  measurementId: "G-GTXX84ZBPD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Get references to DOM elements
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signInButton = document.getElementById('sign-in-button');
const signUpButton = document.getElementById('sign-up-button');
const nameInput = document.getElementById('name-input');
const joinButton = document.getElementById('join-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const changeNameButton = document.getElementById('change-name-button');
const signOutButton = document.getElementById('sign-out-button');
const newNameInput = document.getElementById('new-name-input');
const saveNameButton = document.getElementById('save-name-button');

// Sign-in functionality
signInButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      showChatInterface();
    })
    .catch((error) => {
      console.error(error);
      alert('Sign-in failed. Please check your credentials.');
    });
});

// Sign-up functionality
signUpButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      showChatInterface();
    })
    .catch((error) => {
      console.error(error);
      alert('Sign-up failed. Please try again.');
    });
});

// Sign-out functionality
signOutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      hideChatInterface();
    })
    .catch((error) => {
      console.error(error);
      alert('Sign-out failed. Please try again.');
    });
});

// Detect sign-in state
onAuthStateChanged(auth, (user) => {
  if (user) {
    showChatInterface();
  } else {
    hideChatInterface();
  }
});

// Show/hide chat interface
function showChatInterface() {
  document.querySelector('.sign-in-container').style.display = 'none';
  document.querySelector('.name-input').style.display = 'block';
  document.querySelector('.chat-input').style.display = 'flex';
}

function hideChatInterface() {
  document.querySelector('.sign-in-container').style.display = 'block';
  document.querySelector('.name-input').style.display = 'none';
  document.querySelector('.chat-input').style.display = 'none';
}
