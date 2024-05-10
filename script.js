// Import the necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, get, child, update, remove, onValue } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDisnhcjYmvZc2y9-toeWWKHq9nHYb8Fn4",
  authDomain: "chatroom-50dfb.firebaseapp.com",
  projectId: "chatroom-50dfb",
  storageBucket: "chatroom-50dfb.appspot.com",
  messagingSenderId: "533310796123",
  appId: "1:533310796123:web:1f9cb3326563d3dee72a7e",
  measurementId: "G-GTXX84ZBPD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Sign-up function
async function signUpWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed up:", user);
    // Display success message or redirect to chat page
  } catch (error) {
    console.error("Error signing up:", error);
    // Handle sign-up error
  }
}

// Sign-in function
async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User signed in:", user);
    // Display success message or redirect to chat page
  } catch (error) {
    console.error("Error signing in:", error);
    // Handle sign-in error
  }
}

// Event listener for sign-in button
const signInButton = document.getElementById('sign-in-button');
signInButton.addEventListener('click', () => {
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  signInWithEmail(emailInput.value, passwordInput.value);
});

// Event listener for sign-up button
const signUpButton = document.getElementById('sign-up-button');
signUpButton.addEventListener('click', () => {
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  signUpWithEmail(emailInput.value, passwordInput.value);
});

const nameInput = document.getElementById('name-input');
const joinButton = document.getElementById('join-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.querySelector('.chat-messages');
const profileMenu = document.querySelector('.profile-menu');
const newNameInput = document.getElementById('new-name-input');
const saveNameButton = document.getElementById('save-name-button');
const signInContainer = document.querySelector('.sign-in-container');
const nameInputContainer = document.querySelector('.name-input');
const chatInputContainer = document.querySelector('.chat-input');

let name = '';

// Function to add a message to the chat
function addMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send a message
function sendMessage() {
  const message = messageInput.value.trim();
  if (message !== '') {
    addMessage(`${name}: ${message}`);
    messageInput.value = '';

    // Save message to Firebase
    const messagesRef = ref(database, 'messages');
    push(messagesRef, {
      name,
      message
    });
  }
}

// Function to join the chat
function joinChat() {
  name = nameInput.value.trim();
  if (name !== '') {
    addMessage(`${name} has joined the chat.`);
    nameInput.disabled = true;
    joinButton.disabled = true;
    messageInput.disabled = false;
    sendButton.disabled = false;
    signInContainer.style.display = 'none';
    nameInputContainer.style.display = 'none';
    chatInputContainer.style.display = 'flex';

    // Fetch and display existing messages
    const messagesRef = ref(database, 'messages');
    onValue(messagesRef, (snapshot) => {
      chatMessages.innerHTML = '';
      snapshot.forEach((childSnapshot) => {
        const { name, message } = childSnapshot.val();
        addMessage(`${name}: ${message}`);
      });
    });
  }
}

// Function to open the profile menu
function openProfileMenu() {
  profileMenu.style.display = 'block';
}

// Function to save the new name
function saveName() {
  const newName = newNameInput.value.trim();
  if (newName !== '') {
    addMessage(`${name} changed their name to ${newName}.`);
    name = newName;
    profileMenu.style.display = 'none';

    // Update name in Firebase
    const userRef = ref(database, 'users/' + name);
    set(userRef, {
      name: newName
    });
  }
}

// Event listener for the join button
joinButton.addEventListener('click', joinChat);

// Event listener for pressing Enter key on name input
nameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    joinChat();
  }
});

// Event listener for the send button
sendButton.addEventListener('click', sendMessage);

// Event listener for pressing Enter key on message input
messageInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// Event listener for opening the profile menu
nameInput.addEventListener('click', openProfileMenu);

// Event listener for saving the new name
saveNameButton.addEventListener('click', saveName);

// Event listener for pressing Enter key on new name input
newNameInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    saveName();
  }
});
