module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // USER emits
    socket.on('user:join_request_room', ({ requestId }) => {
      socket.join(requestId);
      console.log(`User joined request room: ${requestId}`);
    });

    socket.on('user:cancel_request', ({ requestId }) => {
      socket.to(requestId).emit('request:cancelled_by_user', { requestId });
    });

    // WORKSHOP emits
    socket.on('workshop:join', ({ workshopId }) => {
      socket.join(workshopId);
      console.log(`Workshop joined room: ${workshopId}`);
    });

    socket.on('workshop:location_update', ({ workshopId, lat, lng }) => {
      // Typically, you might store this in Redis or memory
      // If there's an active request room, they can emit to it
      // socket.to(requestId).emit('workshop:location_tick', { lat, lng });
    });

    socket.on('workshop:availability_change', ({ workshopId, isAvailable }) => {
      console.log(`Workshop ${workshopId} availability: ${isAvailable}`);
    });

    socket.on('workshop:accept_request', ({ requestId, workshopId, eta }) => {
      socket.to(requestId).emit('request:workshop_assigned', { workshopId, eta });
    });

    socket.on('workshop:status_update', ({ requestId, status }) => {
      socket.to(requestId).emit('request:status_changed', { status });
    });

    // CHAT emits
    socket.on('chat:send_message', ({ requestId, message, senderRole }) => {
      socket.to(requestId).emit('chat:new_message', { message, senderRole, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};
