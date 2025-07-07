const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIO = require('socket.io');
const Note = require('./models/Note');
const noteRoutes = require('./routes/notes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: 'https://sahilmahajan12.netlify.app',
  credentials: true,
}));

app.use(express.json()); 

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log(' MongoDB connected'))
  .catch(err => console.error(' MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send(' Real-time Collaborative Notes Backend is Live');
});

app.use('/notes', noteRoutes);

const io = socketIO(server, {
  cors: {
    origin: 'https://sahilmahajan12.netlify.app',
    methods: ['GET', 'POST'],
  },
});

const activeUsers = {};

io.on('connection', (socket) => {
  console.log(' A user connected');

  socket.on('join_note', (noteId) => {
    socket.join(noteId);

    activeUsers[noteId] = (activeUsers[noteId] || 0) + 1;
    io.to(noteId).emit('active_users', activeUsers[noteId]);

    
    socket.on('disconnect', () => {
      activeUsers[noteId] = Math.max((activeUsers[noteId] || 1) - 1, 0);
      io.to(noteId).emit('active_users', activeUsers[noteId]);
    });
  });

  socket.on('note_update', ({ noteId, content }) => {
    socket.to(noteId).emit('note_update', content);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
