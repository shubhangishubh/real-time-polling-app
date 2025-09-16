import * as voteController from './controllers/voteController.js';

/**
 * Initialize socket.io handlers.
 * - clients should emit { action: 'join', pollId } (or we expose a 'joinPoll' event)
 * - server will put them in room 'poll_<id>'
 */
function initSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('joinPoll', (payload) => {
      const pollId = payload && payload.pollId;
      if (!pollId) return;
      const room = getPollRoomName(pollId);
      socket.join(room);
      console.log(`Socket ${socket.id} joined ${room}`);
    });

    socket.on('leavePoll', (payload) => {
      const pollId = payload && payload.pollId;
      if (!pollId) return;
      socket.leave(getPollRoomName(pollId));
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  voteController.setSocketIo(io);
}

function getPollRoomName(pollId) {
  return `poll_${pollId}`;
}

export { initSocket, getPollRoomName };
