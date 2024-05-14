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
