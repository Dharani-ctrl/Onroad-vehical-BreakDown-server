const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Socket.io Setup
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
});
require('./socket/socketHandler')(io);

// Pass io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Mount Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/workshop', require('./routes/workshop.routes'));
app.use('/api/request', require('./routes/request.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/payment', require('./routes/payment.routes'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
