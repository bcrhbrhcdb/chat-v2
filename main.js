import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, updateProfile } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, collection, addDoc, query, orderBy, onSnapshot, getDocs, where, writeBatch } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { initializeChat } from './chat.js';
import { sendVerificationEmail } from './utils.js';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

joinButton.addEventListener('click', async () => {
  const specifiedUsername = nameInput.value.trim();
  if (specifiedUsername) {
    try {
      // Sign in anonymously
      const userCredential = await auth.signInAnonymously();
      const user = userCredential.user;

      // Create a new user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: specifiedUsername,
        email: user.email || null,
      });

      // Show chat interface
      showChatInterface();
      // Initialize chat functionality
      initializeChat(specifiedUsername, true); // Pass true to show the chat interface
    } catch (error) {
      console.error('Error signing in:', error);
    }
  } else {
    alert('Please enter a username.');
  }
});
