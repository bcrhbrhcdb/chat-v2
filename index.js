const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

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

server.listen(process.env.PORT || 3000, () => {
  console.log('listening on *:3000');
});