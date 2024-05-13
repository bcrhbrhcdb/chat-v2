// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };