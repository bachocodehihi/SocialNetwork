const tictactoeRooms = new Map();
const playerRoom = new Map();
const matchmakingQueue = [];

function generateRoomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(c => c !== '')) return 'draw';
  return null;
}

function safeRoom(room) {
  return {
    roomId: room.roomId,
    board: room.board,
    currentTurn: room.currentTurn,
    xPlayer: room.xPlayer,
    oPlayer: room.oPlayer,
    status: room.status,
    scores: room.scores,
  };
}

function _createGameBetween(io, onlineUsers, p1Id, p2Id, s1 = null, s2 = null) {
  const roomId = generateRoomId();
  const room = {
    roomId, hostId: p1Id, guestId: p2Id,
    board: Array(9).fill(''), currentTurn: p1Id,
    xPlayer: p1Id, oPlayer: p2Id,
    status: 'playing', scores: { [p1Id]: 0, [p2Id]: 0 },
  };
  
  tictactoeRooms.set(roomId, room);
  playerRoom.set(p1Id, roomId);
  playerRoom.set(p2Id, roomId);

  const s1Id = s1?.id || onlineUsers.get(p1Id);
  const s2Id = s2?.id || onlineUsers.get(p2Id);

  const socket1 = s1 || (s1Id ? io.sockets.sockets.get(s1Id) : null);
  const socket2 = s2 || (s2Id ? io.sockets.sockets.get(s2Id) : null);

  if (socket1) socket1.join(roomId);
  if (socket2) socket2.join(roomId);

  io.to(roomId).emit('ttt_game_start', safeRoom(room));
  return true;
}

function registerTictactoeEvents(io, socket, onlineUsers) {
  const userId = socket.userId;

  socket.on('ttt_join_matchmaking', () => {
    _leave(io, socket, onlineUsers);

    while (matchmakingQueue.length > 0) {
        const opponentId = matchmakingQueue.shift();
        
        if (opponentId === userId) continue;

        if (onlineUsers.has(opponentId) && !playerRoom.has(opponentId)) {
            _createGameBetween(io, onlineUsers, opponentId, userId, null, socket);
            return;
        }
    }

    matchmakingQueue.push(userId);
    socket.emit('ttt_matchmaking_status', { status: 'searching' });
  });

  socket.on('ttt_leave_matchmaking', () => {
    const index = matchmakingQueue.indexOf(userId);
    if (index > -1) matchmakingQueue.splice(index, 1);
    socket.emit('ttt_matchmaking_status', { status: 'idle' });
  });

  socket.on('ttt_create_room', () => {
    _leave(io, socket, onlineUsers);
    const roomId = generateRoomId();
    const room = {
      roomId, hostId: userId, guestId: null,
      board: Array(9).fill(''), currentTurn: userId,
      xPlayer: userId, oPlayer: null,
      status: 'waiting', scores: { [userId]: 0 },
    };
    tictactoeRooms.set(roomId, room);
    playerRoom.set(userId, roomId);
    socket.join(roomId);
    socket.emit('ttt_room_created', safeRoom(room));
  });

  socket.on('ttt_join_room', ({ roomId }) => {
    const room = tictactoeRooms.get(roomId);
    if (!room) return socket.emit('ttt_error', { success: false, code: 'ROOM_NOT_FOUND' });
    if (room.status !== 'waiting') return socket.emit('ttt_error', { success: false, code: 'ROOM_ALREADY_STARTED' });
    if (room.guestId) return socket.emit('ttt_error', { success: false, code: 'ROOM_FULL' });
    if (room.hostId === userId) return socket.emit('ttt_error', { success: false, code: 'ALREADY_IN_ROOM' });

    _leave(io, socket, onlineUsers);
    room.guestId = userId; room.oPlayer = userId;
    room.status = 'playing'; room.scores[userId] = 0;
    playerRoom.set(userId, roomId);
    socket.join(roomId);
    io.to(roomId).emit('ttt_game_start', safeRoom(room));
  });

  socket.on('ttt_move', ({ roomId, index }) => {
    const room = tictactoeRooms.get(roomId);
    if (!room || room.status !== 'playing') return socket.emit('ttt_error', { success: false, code: 'GAME_NOT_STARTED' });
    if (room.currentTurn !== userId) return socket.emit('ttt_error', { success: false, code: 'NOT_YOUR_TURN' });
    if (index < 0 || index > 8 || room.board[index] !== '') return socket.emit('ttt_error', { success: false, code: 'INVALID_MOVE' });

    const symbol = room.xPlayer === userId ? 'X' : 'O';
    room.board[index] = symbol;
    const result = checkWinner(room.board);

    if (result) {
      room.status = 'ended';
      if (result === 'draw') {
        io.to(roomId).emit('ttt_game_over', { ...safeRoom(room), result: 'draw', winner: null });
      } else {
        const winnerId = result === 'X' ? room.xPlayer : room.oPlayer;
        room.scores[winnerId] = (room.scores[winnerId] || 0) + 1;
        io.to(roomId).emit('ttt_game_over', { ...safeRoom(room), result: 'win', winner: winnerId });
      }
    } else {
      room.currentTurn = userId === room.xPlayer ? room.oPlayer : room.xPlayer;
      io.to(roomId).emit('ttt_board_update', safeRoom(room));
    }
  });

  socket.on('ttt_rematch', ({ roomId }) => {
    const room = tictactoeRooms.get(roomId);
    if (!room || room.status !== 'ended') return;
    
    const otherId = room.hostId === userId ? room.guestId : room.hostId;
    const otherSocketId = onlineUsers.get(otherId);
    if (otherSocketId) {
      io.to(otherSocketId).emit('ttt_rematch_request', { fromId: userId });
    }
  });

  socket.on('ttt_rematch_response', ({ roomId, accept }) => {
    const room = tictactoeRooms.get(roomId);
    if (!room || room.status !== 'ended') return;

    if (accept) {
      [room.xPlayer, room.oPlayer] = [room.oPlayer, room.xPlayer];
      room.board = Array(9).fill('');
      room.currentTurn = room.xPlayer;
      room.status = 'playing';
      io.to(roomId).emit('ttt_game_start', safeRoom(room));
    } else {
      io.to(roomId).emit('ttt_rematch_declined', { byId: userId });
      _leave(io, socket, onlineUsers, roomId);
    }
  });

  socket.on('ttt_leave_room', ({ roomId }) => _leave(io, socket, onlineUsers, roomId));
  socket.on('disconnect', () => {
    const qIndex = matchmakingQueue.indexOf(userId);
    if (qIndex > -1) matchmakingQueue.splice(qIndex, 1);
    _leave(io, socket, onlineUsers);
  });
}

function _leave(io, socket, onlineUsers, forcedRoomId = null) {
  const userId = socket.userId;
  const roomId = forcedRoomId || playerRoom.get(userId);
  
  const qIndex = matchmakingQueue.indexOf(userId);
  if (qIndex > -1) matchmakingQueue.splice(qIndex, 1);

  if (!roomId) return;

  const room = tictactoeRooms.get(roomId);
  playerRoom.delete(userId);
  socket.leave(roomId);
  if (!room) return;

  const otherId = room.hostId === userId ? room.guestId : room.hostId;
  if (!otherId) { tictactoeRooms.delete(roomId); return; }

  const otherSocketId = onlineUsers.get(otherId);
  if (otherSocketId) io.to(otherSocketId).emit('ttt_opponent_left', { roomId });

  if (room.status === 'playing') {
    room.scores[otherId] = (room.scores[otherId] || 0) + 1;
    room.status = 'ended';
    io.to(roomId).emit('ttt_game_over', { ...safeRoom(room), result: 'win', winner: otherId, reason: 'opponent_left' });
  }

  tictactoeRooms.delete(roomId);
  playerRoom.delete(otherId);
}

module.exports = { registerTictactoeEvents };
