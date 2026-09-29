const { Server } = require('socket.io');

let io = null;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    socket.on('joinOrder', (orderId) => {
      if (orderId) socket.join(`order_${orderId}`);
    });
    socket.on('joinAdmin', () => {
      socket.join('admins');
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized yet');
  return io;
}

function emitOrderUpdate(orderId, event, payload) {
  if (!io) return;
  io.to(`order_${orderId}`).emit(event, payload);
}

function emitAdminEvent(event, payload) {
  if (!io) return;
  io.to('admins').emit(event, payload);
}

module.exports = { initSocket, getIO, emitOrderUpdate, emitAdminEvent };
