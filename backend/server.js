import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import colors from 'colors';
import connectDatabase from './config/database.js';
import Router from './routers/index.js';
import errorHandler from './middleware/errorHandler.js';
import { UPLOADS_DIR } from './config/paths.js';
import rateLimit  from  "express-rate-limit"
// Load environment variables from .env file
dotenv.config();

// Establish MongoDB connection
connectDatabase();

// Safely parse allowed origins for CORS from environment, defaulting to standard dev ports
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];
console.log(allowedOrigins,"allowedOrigins")
const app = express();


// Set up rate limiter: maximum of 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Apply the rate limiter to all requests
app.use(limiter);
// HTTP request logger middleware for development
app.use(morgan('dev'));

// Parse incoming JSON payloads
app.use(express.json());

// Configure Cross-Origin Resource Sharing
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests) OR if origin is whitelisted
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent with requests
  })
);
// Serve uploaded files (path is anchored to backend/, not process.cwd())
app.use('/uploads', express.static(UPLOADS_DIR));
// Mount main application routes
app.use('/api/v1', Router);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Course API is running' });
});

// Fallback 404 handler for unrecognized endpoints
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler must be the very last middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgGreen.white);
});
