import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import { env, isDevelopment } from './config/env';
import { corsOptions } from './config/cors';
import { v1Routes } from './routes/v1.routes';
import { generalRateLimit } from './common/middlewares/rateLimit.middleware';
import { errorHandler, notFoundHandler } from './common/middlewares/error.middleware';
import cloudinary from 'cloudinary';
const app = express();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors(corsOptions));

// Rate limiting
app.use(generalRateLimit);

// Body parsing middleware - skip for multipart/form-data (handled by multer)
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    return next();
  }
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, next);
});
app.use(cookieParser(env.COOKIE_SECRET));

// Compression
app.use(compression());

// Logging
if (isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/v1', v1Routes);

// Static files
app.use('/uploads', express.static('uploads'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Ecommerce Backend API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;