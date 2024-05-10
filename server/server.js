const http = require('http');
const { Server } = require("socket.io");

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://chat-v2-nine.vercel.app",
    methods: ["GET", "POST"]
  }
});

let messages = [];

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send existing messages to the new user
  socket.emit('chat history', messages);

  socket.on('join', (name) => {
    socket.name = name;
    io.emit('chat message', `${name} has joined the chat.`);
  });

  socket.on('chat message', (msg) => {
    const message = `${socket.name}: ${msg}`;
    messages.push(message);
    io.emit('chat message', message);
  });

  socket.on('disconnect', () => {
    if (socket.name) {
      io.emit('chat message', `${socket.name} has left the chat.`);
    }
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server is running on port ${PORT}`);
});