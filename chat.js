import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { auth, db } from './firebase.js';

export function initializeChat(username, showChat = true) {
  const messagesCollection = collection(db, 'messages');
  const messagesQuery = query(messagesCollection, orderBy('created', 'asc'));
  const chatMessagesContainer = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  // Check if the user is verified
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    alert('Please verify your email before joining the chat.');
    return;
  }

  // Show or hide the chat interface
  if (showChat) {
    document.querySelector('.chat-container').style.display = 'block';
  } else {
    document.querySelector('.chat-container').style.display = 'none';
  }

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

  // Send message
  sendButton.addEventListener('click', sendMessage);
  messageInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  });

  async function sendMessage() {
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
  }
}
