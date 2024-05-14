import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { auth, db } from './firebase.js';
import { initializeChat } from './chat.js';
import { doc, setDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, getDocs, where, writeBatch } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { sendVerificationEmail } from './utils.js';

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
const sendButton = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

function showPopup(message) {
  const popup = document.createElement('div');
  popup.classList.add('popup');
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close-button">&times;</span>
      <p>${message}</p>
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

joinButton.addEventListener('click', async () => {
  const specifiedUsername = nameInput.value.trim();
  if (specifiedUsername) {
    try {
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name: specifiedUsername,
        email: user.email || null,
      });
      initializeChat(specifiedUsername, true);
      showChatInterface();
    } catch (error) {
      console.error('Error signing in:', error);
      showPopup('Failed to sign in. Please try again.');
    }
  } else {
    showPopup('Please enter a username to join the chat.');
    initializeChat(null, false);
  }
});

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
      showPopup('Failed to send message. Please try again.');
    }
  }
});

signInButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (user.emailVerified) {
        initializeChat(user.displayName || 'Anonymous', true);
        showChatInterface();
      } else {
        showPopup('Please verify your email before joining the chat.');
        initializeChat(null, false);
      }
    })
    .catch((error) => {
      console.error('Sign-in failed:', error.message);
      showPopup(`Sign-in failed. ${error.message}`);
    });
});

signUpButton.addEventListener('click', () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showPopup('Please enter a valid email address.');
    return;
  }
  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\/?]).{8,}$/;
  if (!passwordRegex.test(password)) {
    showPopup('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.');
    return;
  }
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      console.log('User created:', user);
      await updateProfile(user, { displayName: 'Anonymous' });
      console.log('Display name set:', user.displayName);
      await setDoc(doc(db, "users", user.uid), {
        name: 'Anonymous',
        email: user.email,
      });
      console.log('User document created in Firestore');
      try {
        await sendVerificationEmail(user);
        console.log('Email verification sent');
        showPopup('Please verify your email before continuing.');
        initializeChat(null, false);
      } catch (error) {
        console.error('Error sending email verification:', error.message);
        showPopup(`Sign-up failed. ${error.message}`);
      }
    })
    .catch((error) => {
      console.error('Sign-up failed:', error.message);
      showPopup(`Sign-up failed. ${error.message}`);
    });
});

resetPasswordButton.addEventListener('click', () => {
  const email = emailInput.value;
  if (email) {
    sendPasswordResetEmail(email)
      .then(() => {
        showPopup('Password reset email sent. Please check your inbox.');
      })
      .catch((error) => {
        console.error('Error sending password reset email:', error.message);
        showPopup(`Failed to send password reset email. ${error.message}`);
      });
  } else {
    showPopup('Please enter your email address.');
  }
});

signOutButton.addEventListener('click', () => {
  signOut(auth)
    .then(() => {
      hideChatInterface();
    })
    .catch((error) => {
      console.error('Sign-out failed:', error.message);
      showPopup(`Sign-out failed. ${error.message}`);
    });
});

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
      await updateProfile(auth.currentUser, { displayName: newName });
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { name: newName });
      const messagesCollection = collection(db, 'messages');
      const oldName = auth.currentUser.displayName;
      const batch = writeBatch(db);
      const querySnapshot = await getDocs(query(messagesCollection, where('user', '==', oldName)));
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { user: newName });
      });
      await batch.commit();
      initializeChat(newName, true);
      showPopup('Name updated successfully');
      document.querySelector('.profile-menu').style.display = 'none';
      newNameInput.value = '';
    } catch (error) {
      console.error('Error updating name:', error.message);
      showPopup(`Failed to update name. ${error.message}`);
    }
  } else {
    showPopup('Please enter a new name.');
  }
}

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    initializeChat(user.displayName || 'Anonymous', true);
  } else {
    hideChatInterface();
  }
});

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
        await setDoc(doc(db, "users", user.uid), {
          name: 'Anonymous',
          email: user.email,
        });
        showChatInterface();
        initializeChat('Anonymous', true);
      })
      .catch((error) => {
        console.error('Sign-in failed:', error.message);
        showPopup(`Sign-in failed. ${error.message}`);
      });
  } else {
    showPopup('Please enter an email and password.');
  }
});
