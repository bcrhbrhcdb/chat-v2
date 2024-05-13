import { auth, db } from './firebase.js';
import { initializeChat } from './chat.js';
import { sendVerificationEmail } from './utils.js';

// Get references to DOM elements
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signInButton = document.getElementById('sign-in-button');
const signUpButton = document.getElementById('sign-up-button');
const resetPasswordButton = document.getElementById('reset-password-button');
const nameInput = document.getElementById('name-input');
const joinButton = document.getElementById('join-button');
const chatMessagesContainer = document.getElementById('chat-messages');
const changeNameButton = document.getElementById('change-name-button');
const newNameInput = document.getElementById('new-name-input');
const saveNameButton = document.getElementById('save-name-button');
const signOutButton = document.getElementById('sign-out-button');

// Handle join button click
joinButton.addEventListener('click', async () => {
  const specifiedUsername = nameInput.value.trim();
  if (specifiedUsername) {
    try {
      // Sign in anonymously
      const userCredential = await firebase.auth().signInAnonymously();
      const user = userCredential.user;

      // Create a new user document in Firestore
      await firebase.firestore().collection("users").doc(user.uid).set({
        name: specifiedUsername,
        email: user.email || null,
      });

      // Show chat interface
      showChatInterface();
      // Initialize chat functionality
      initializeChat(specifiedUsername);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  } else {
    alert('Please enter a username.');
  }
});

// Sign-in functionality
signInButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // Check if the user's email is verified
      if (!user.emailVerified) {
        await sendVerificationEmail(user); // Send email verification
        alert('Please verify your email before continuing.');
      } else {
        showChatInterface();
        initializeChat(user.displayName || 'Anonymous');
      }
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
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;

      // Create a new user document in Firestore
      await firebase.firestore().collection("users").doc(user.uid).set({
        name: user.displayName || 'Anonymous',
        email: user.email,
      });

      // Send email verification
      await sendVerificationEmail(user);
      alert('Please verify your email before continuing.');
    })
    .catch((error) => {
      console.error(error);
      alert('Sign-up failed. Please try again.');
    });
});

// Reset password functionality
resetPasswordButton.addEventListener('click', () => {
  const email = emailInput.value;
  firebase.auth().sendPasswordResetEmail(email)
    .then(() => {
      alert('Password reset email sent. Please check your inbox.');
    })
    .catch((error) => {
      console.error(error);
      alert('Failed to send password reset email.');
    });
});

// Sign-out functionality
signOutButton.addEventListener('click', () => {
  firebase.auth().signOut()
    .then(() => {
      hideChatInterface();
    })
    .catch((error) => {
      console.error(error);
      alert('Sign-out failed. Please try again.');
    });
});

// Change name functionality
changeNameButton.addEventListener('click', () => {
  document.querySelector('.profile-menu').style.display = 'block';
});

saveNameButton.addEventListener('click', async () => {
  const newName = newNameInput.value.trim();
  if (newName) {
    try {
      // Update display name in Firebase Authentication
      await firebase.auth().currentUser.updateProfile({ displayName: newName });

      // Update name in Firestore
      const userDocRef = firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid);
      await userDocRef.update({ name: newName });

      alert('Name updated successfully');
      document.querySelector('.profile-menu').style.display = 'none';
      newNameInput.value = '';
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Failed to update name. Please try again.');
    }
  } else {
    alert('Please enter a new name.');
  }
});

// Detect sign-in state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    showChatInterface();
    initializeChat(user.displayName || 'Anonymous');
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
