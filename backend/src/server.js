require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to database will happen before starting the server

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allows parsing JSON body data and large base64 images
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));

// Basic Test Route
app.get('/', (req, res) => {
  res.send('ConnectHub Backend is running');
});

// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
const http = require('http');
const server = http.createServer(app);
const socket = require('./socket');

// Initialize socket.io
socket.init(server);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
});
// Nodemon trigger
