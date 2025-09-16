import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

import app from './app.js';
import { initSocket } from './sockets.js';

dotenv.config();

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: '*' } 
});

initSocket(io);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
