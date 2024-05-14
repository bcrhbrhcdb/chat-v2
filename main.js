import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { auth, db } from './firebase.js';
import { initializeChat } from './chat.js';
import { doc, setDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, getDocs, where, writeBatch } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { sendVerificationEmail } from './utils.js';


// Ensure DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Get references to DOM elements
  const emailInput = document.getElementById('email-input');
  const passwordInput = document.getElementById('password-input');
  const signInButton = document.getElementById('sign-in-button');
  const signUpButton = document.getElementById('sign-up-button');
  const resetPasswordButton = document.getElementById('reset-password-button');
  const joinButton = document.getElementById('join-button');
  const chatMessagesContainer = document.getElementById('chat-messages');
  const changeNameButton = document.getElementById('change-name-button');
  const newNameInput = document.getElementById('new-name-input');
  const saveNameButton = document.getElementById('save-name-button');
  const signOutButton = document.getElementById('sign-out-button');
  const sendButton = document.getElementById('send-button');
  const messageInput = document.getElementById('message-input');

  // Override console.error to show errors as popups
  const originalConsoleError = console.error;
  console.error = function () {
    const errorMessage = Array.prototype.slice.call(arguments).join(' ');
    showErrorPopup(errorMessage);
    originalConsoleError.apply(console, arguments);
  };

  // Function to show error popup
  function showErrorPopup(errorMessage) {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close-button">&times;</span>
        <p>${errorMessage}</p>
      </div>
    `;

    document.body.appendChild(popup);

    const closeButton = popup.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
      popup.remove();
    });

    window.addEventListener('click', (event) => {
      if (event.target === popup) {
        popup.remove();
      }
    });
  }

  // Handle join button click
  joinButton.addEventListener('click', async () => {
    const specifiedUsername = prompt('Please enter a username:');
    if (specifiedUsername) {
      try {
        // Sign in anonymously
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        // Create a new user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: specifiedUsername,
          email: user.email || null,
        });

        // Initialize chat functionality
        initializeChat(specifiedUsername, true);
      } catch (error) {
        console.error('Error signing in:', error);
      }
    } else {
      alert('Please enter a username to join the chat.');
      initializeChat(null, false); // Hide the chat container
    }
  });

  // Handle send button click
  sendButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
      try {
        await addDoc(collection(db, 'messages'), {
          user: auth.currentUser.displayName,
          message,
          created: new Date(),
        });
        messageInput.value = '';
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });

  // Sign-in functionality
  signInButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user.emailVerified) {
          initializeChat(user.displayName || 'Anonymous', true);
        } else {
          alert('Please verify your email before joining the chat.');
          initializeChat(null, false); // Hide the chat container
        }
      })
      .catch((error) => {
        console.error('Sign-in failed:', error.message);
        alert(`Sign-in failed. ${error.message}`);
      });
  });

  // Sign-up functionality
  signUpButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    // Check if the email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Check if the password meets the minimum requirements
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const user = userCredential.user;
        console.log('User created:', user);

        // Set the user's display name
        await updateProfile(user, { displayName: 'Anonymous' });
        console.log('Display name set:', user.displayName);

        // Create a new user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          name: 'Anonymous',
          email: user.email,
        });
        console.log('User document created in Firestore');

        // Send email verification
        try {
          await sendVerificationEmail(user);
          console.log('Email verification sent');
          alert('Please verify your email before continuing.');
          initializeChat(null, false); // Hide the chat container
        } catch (error) {
          console.error('Error sending email verification:', error.message);
          alert(`Sign-up failed. ${error.message}`);
        }
      })
      .catch((error) => {
        console.error('Sign-up failed:', error.message);
        alert(`Sign-up failed. ${error.message}`);
      });
  });

  // Reset password functionality
  resetPasswordButton.addEventListener('click', () => {
    const email = emailInput.value;
    if (email) {
      sendPasswordResetEmail(auth, email)
        .then(() => {
          alert('Password reset email sent. Please check your inbox.');
        })
        .catch((error) => {
          console.error('Error sending password reset email:', error.message);
          alert(`Failed to send password reset email. ${error.message}`);
        });
    } else {
      alert('Please enter your email address.');
    }
  });

  // Sign-out functionality
  signOutButton.addEventListener('click', () => {
    signOut(auth)
      .then(() => {
        hideChatInterface();
      })
      .catch((error) => {
        console.error('Sign-out failed:', error.message);
        alert(`Sign-out failed. ${error.message}`);
      });
  });

  // Change name functionality
  changeNameButton.addEventListener('click', () => {
    document.querySelector('.profile-menu').style.display = 'block';
  });

  saveNameButton.addEventListener('click', updateName);
  newNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      updateName();
    }
  });

  async function updateName() {
    const newName = newNameInput.value.trim();
    if (newName) {
      try {
        // Update display name in Firebase Authentication
        await updateProfile(auth.currentUser, { displayName: newName });

        // Update name in Firestore
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { name: newName });

        // Update chat messages with the new name
        const messagesCollection = collection(db, 'messages');
        const oldName = auth.currentUser.displayName;
        const batch = writeBatch(db);

        const querySnapshot = await getDocs(query(messagesCollection, where('user', '==', oldName)));
        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, { user: newName });
        });

        await batch.commit();

        // Refresh the chat interface with the new name
        initializeChat(newName, true);

        alert('Name updated successfully');
        document.querySelector('.profile-menu').style.display = 'none';
        newNameInput.value = '';
      } catch (error) {
        console.error('Error updating name:', error.message);
        alert(`Failed to update name. ${error.message}`);
      }
    } else {
      alert('Please enter a new name.');
    }
  }

  // Detect sign-in state
  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      initializeChat(user.displayName || 'Anonymous', true);
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

  const signInAnonymouslyButton = document.getElementById('sign-in-anonymously-button');
  signInAnonymouslyButton.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (email && password) {
      createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
          const user = userCredential.user;

          // Create a new user document in Firestore
          await setDoc(doc(db, "users", user.uid), {
            name: 'Anonymous',
            email: user.email,
          });

          // Show chat interface
          showChatInterface();
          // Initialize chat functionality
          initializeChat('Anonymous', true);
        })
        .catch((error) => {
          console.error('Sign-in failed:', error.message);
          alert(`Sign-in failed. ${error.message}`);
        });
    } else {
      alert('Please enter an email and password.');
    }
  });
});
