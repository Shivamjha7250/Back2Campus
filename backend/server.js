import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import os from 'os';
import helmet from 'helmet';
import morgan from 'morgan';
import initSocket from './socket.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Get local IPv4 address for LAN access
const getLocalIP = () => {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
};

const localIP = getLocalIP();
const localIPUrl = `http://${localIP}:5173`;

// Prepare allowed origins for CORS
let allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map((url) => url.trim())
  : [];
allowedOrigins.push('http://localhost:5173', 'http://127.0.0.1:5173', localIPUrl);
allowedOrigins = [...new Set(allowedOrigins)];

console.log(' Allowed Origins:', allowedOrigins);

// Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(' MongoDB connected'))
  .catch((err) => console.error(' MongoDB connection error:', err));

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//  Static file serving with proper CORS headers for images
app.use('/uploads', express.static(join(process.cwd(), 'uploads'), {
  setHeaders: (res, path, stat) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin'); 
  }
}));

// Attach Socket.IO instance to each request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import userRoutes from './routes/user.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notification.js';
import connectionRoutes from './routes/connection.js';
import contributionRoutes from './routes/contribution.js';

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/contributions', contributionRoutes);

// Basic root route
app.get('/', (req, res) => res.send(' API is running'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(' Express error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Initialize Socket.IO event handlers
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(` Server running at:`);
  console.log(`   Local:     http://localhost:${PORT}`);
  console.log(`   Network:   http://${localIP}:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n💤 Shutting down gracefully...');
  mongoose.connection.close(false, () => {
    console.log('MongoDB connection closed');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
