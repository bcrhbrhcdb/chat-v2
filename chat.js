import { auth, db, collection } from './firebase.js';
import { query, orderBy, onSnapshot, addDoc } from "firebase/firestore";

export function initializeChat(username, showChat = true) {
  const messagesCollection = collection(db, 'messages');
  const messagesQuery = query(messagesCollection, orderBy('created', 'asc'));
  const chatMessagesContainer = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');

  // Check if the user is verified
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    alert('Please verify your email before joining the chat.');
    showPopup(); // Show the verification popup
    return;
  }

  // Show or hide the chat interface
  if (showChat) {
    document.querySelector('.chat-container').style.display = 'block';
  } else {
    document.querySelector('.chat-container').style.display = 'none';
  }

  // Clear the chat container
  chatMessagesContainer.innerHTML = '';

  // Listen for new messages and filter out profanity
  const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const message = change.doc.data();
        const messageElement = document.createElement('div');

        // Create a span element for the username and date
        const userNameDateSpan = document.createElement('span');
        userNameDateSpan.textContent = `${message.user} (${new Date(message.created.toDate()).toLocaleString()})`;

        // Create a span element for the message content
        const messageContentSpan = document.createElement('span');
        messageContentSpan.textContent = `: ${message.message}`;

        // Append the username/date and message content spans to the message element
        messageElement.appendChild(userNameDateSpan);
        messageElement.appendChild(messageContentSpan);

        // Only append the message element if it doesn't contain profanity
        const containsProfanity = message.message.toLowerCase().includes('profanity');
        if (!containsProfanity) {
          chatMessagesContainer.appendChild(messageElement);
        }
      }
    });
  });

  // Function to show the verification popup
  function showPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
      <div class="popup-content">
        <span class="close-button">&times;</span>
        <p>Please verify your email before joining the chat.</p>
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
}
