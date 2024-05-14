import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onDisconnect, remove } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-database.js";

// Your web app's Firebase configuration
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// DOM elements
const signInContainer = document.querySelector('.sign-in-container');
const nameInput = document.querySelector('#name-input');
const joinButton = document.querySelector('#join-button');
const chatMessages = document.querySelector('#chat-messages');
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('#send-button');
const changeNameButton = document.querySelector('#change-name-button');
const signOutButton = document.querySelector('#sign-out-button');
const profileMenu = document.querySelector('.profile-menu');
const newNameInput = document.querySelector('#new-name-input');
const saveNameButton = document.querySelector('#save-name-button');

// Sign in/up event listeners
document.querySelector('#sign-in-button').addEventListener('click', signIn);
document.querySelector('#sign-up-button').addEventListener('click', signUp);
document.querySelector('#reset-password-button').addEventListener('click', resetPassword);

// Chat event listeners
joinButton.addEventListener('click', joinChat);
sendButton.addEventListener('click', sendMessage);
changeNameButton.addEventListener('click', showProfileMenu);
signOutButton.addEventListener('click', signOutUser);
saveNameButton.addEventListener('click', saveNewName);

// Firebase references
let currentUser;
let currentUserName;
let currentUserRef;

// Sign in function
function signIn() {
  const email = document.querySelector('#email-input').value;
  const password = document.querySelector('#password-input').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      showNameInput();
    })
    .catch((error) => {
      console.error(error);
    });
}

// Sign up function
function signUp() {
  const email = document.querySelector('#email-input').value;
  const password = document.querySelector('#password-input').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      currentUser = userCredential.user;
      showNameInput();
    })
    .catch((error) => {
      console.error(error);
    });
}

// Reset password function
function resetPassword() {
  const email = document.querySelector('#email-input').value;

  sendPasswordResetEmail(auth, email)
    .then(() => {
      alert('Password reset email sent!');
    })
    .catch((error) => {
      console.error(error);
    });
}

// Show name input
function showNameInput() {
  signInContainer.style.display = 'none';
  document.querySelector('.name-input').style.display = 'block';
}

// Join chat
function joinChat() {
  currentUserName = nameInput.value.trim();
  if (currentUserName) {
    document.querySelector('.name-input').style.display = 'none';
    document.querySelector('.chat-input').style.display = 'flex';
    currentUserRef = push(ref(database, 'users'), {
      name: currentUserName,
      userId: currentUser.uid
    });

    onDisconnect(currentUserRef).remove();

    listenForMessages();
  }
}

// Listen for new messages
function listenForMessages() {
  const messagesRef = ref(database, 'messages');
  onChildAdded(messagesRef, (data) => {
    const message = data.val();
    const messageElement = document.createElement('div');
    messageElement.textContent = `${message.name}: ${message.text}`;
    chatMessages.appendChild(messageElement);
  });
}

// Send message
function sendMessage() {
  const messageText = messageInput.value.trim();
  if (messageText) {
    const messagesRef = ref(database, 'messages');
    push(messagesRef, {
      name: currentUserName,
      text: messageText
    });
    messageInput.value = '';
  }
}

// Show profile menu
function showProfileMenu() {
  profileMenu.style.display = 'block';
}

// Sign out user
function signOutUser() {
  signOut(auth)
    .then(() => {
      currentUser = null;
      currentUserName = null;
      currentUserRef = null;
      chatMessages.innerHTML = '';
      signInContainer.style.display = 'block';
      document.querySelector('.chat-input').style.display = 'none';
      profileMenu.style.display = 'none';
    })
    .catch((error) => {
      console.error(error);
    });
}

// Save new name
function saveNewName() {
  const newName = newNameInput.value.trim();
  if (newName) {
    currentUserRef.update({ name: newName });
    currentUserName = newName;
    profileMenu.style.display = 'none';
  }
}
