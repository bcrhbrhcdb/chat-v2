import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { auth, db } from './firebase.js';

export function initializeChat(username) {
  const messagesCollection = collection(db, 'messages');
  const messagesQuery = query(messagesCollection, orderBy('created', 'asc'));
  const chatMessagesContainer = document.getElementById('chat-messages');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  // Listen for new messages
  onSnapshot(messagesQuery, (snapshot) => {
    chatMessagesContainer.innerHTML = '';
    snapshot.forEach((doc) => {
      const message = doc.data();
      const messageElement = document.createElement('div');
      messageElement.textContent = `${message.user}: ${message.message}`;
      chatMessagesContainer.appendChild(messageElement);
    });
  });

  // Listen for user changes
  const usersCollection = collection(db, 'users');
  const usersQuery = query(usersCollection);
  onSnapshot(usersQuery, (snapshot) => {
    const users = snapshot.docs.map((doc) => doc.data().name);
    const userList = document.createElement('div');
    userList.textContent = `Users online: ${users.join(', ')}`;
    chatMessagesContainer.appendChild(userList);
  });

  // Send message
  sendButton.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
      try {
        await addDoc(messagesCollection, {
          user: username,
          message,
          created: new Date(),
        });
        messageInput.value = '';
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
}
