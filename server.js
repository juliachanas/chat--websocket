const express = require('express');
const path = require('path');
const socket = require('socket.io');

const app = express();

const messages = [];
const users = [];

app.use(express.static(path.join(__dirname, '/client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/index.html'));
});

const server = app.listen(8000, () => {
  console.log('Server is running on port: 8000');
});

const io = socket(server);

io.on('connection', (socket) => {
  socket.on('join', (userName) => {
    const user = { userName: userName, id: socket.id };
    users.push(user);

    socket.broadcast.emit('message', {
      author: 'Chat-Bot',
      content: `${userName} has joined the conversation!`,
    });
  });

  socket.on('message', (message) => {
    messages.push(message);
    socket.broadcast.emit('message', message);
  });

  socket.on('disconnect', () => {
    const disconectedUserId = users.findIndex((user) => user.id === socket.id);
    if (disconectedUserId !== -1) {
      socket.broadcast.emit('message', {
        author: 'Chat-Bot',
        content: `${users[disconectedUserId].userName} has left the conversation... :(`,
      });
      users.splice(disconectedUserId, 1);
    }
  });
});
