const nameInput = document.getElementById('name-input');
const joinButton = document.getElementById('join-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.querySelector('.chat-messages');
const profileMenu = document.querySelector('.profile-menu');
const newNameInput = document.getElementById('new-name-input');
const saveNameButton = document.getElementById('save-name-button');

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
