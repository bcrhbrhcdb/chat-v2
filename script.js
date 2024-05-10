const supabaseUrl = 'https://bnutqttgqvrclfxyuulf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJudXRxdHRncXZyY2xmeHl1dWxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUzNjc5NzEsImV4cCI6MjAzMDk0Mzk3MX0.8H5iT0NXOLjOgqHZlhn-2rAmwaxCCdx-1b2_e8VM2Hg';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signInButton = document.getElementById('sign-in-button');
const signUpButton = document.getElementById('sign-up-button');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

const Filter = new Filter({ placeHolder: '*' });
Filter.addWords(...badwords);

signInButton.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) {
    console.error(error);
    alert('Sign-in failed. Please check your email and password.');
  } else {
    // Redirect to the chat or update the UI
  }
});

signUpButton.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.error(error);
    alert('Sign-up failed. Please try again.');
  } else {
    alert('Sign-up successful! You can now join the chat.');
    document.querySelector('.sign-in-container').style.display = 'none';
    document.querySelector('.chat-input').style.display = 'block';
  }
});

sendButton.addEventListener('click', async () => {
  const message = messageInput.value.trim();
  if (message === '') return;
  const filteredMessage = Filter.clean(message);
  const { user, error } = await supabase.auth.user();
  const { data, error: insertError } = await supabase.from('messages').insert({ user_id: user.id, message: filteredMessage });
  if (insertError) {
    console.error(insertError);
    alert('Failed to send message. Please try again.');
  } else {
    messageInput.value = '';
    // Fetch and display the updated messages
  }
});

// Fetch and display messages on page load
const { data: messages, error: messagesError } = await supabase
  .from('messages')
  .select('*')
  .order('created_at', { ascending: true });
messages.forEach(message => {
  const messageElement = document.createElement('div');
  messageElement.textContent = `${message.message}`;
  chatMessages.appendChild(messageElement);
});

// Listen for real-time updates
supabase
  .from('messages')
  .on('INSERT', payload => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${payload.new.message}`;
    chatMessages.appendChild(messageElement);
  })
  .subscribe();
