// Where you create and configure the Express app: middleware setup (cors, express.json(), cookieParser), and mounting your routes. It only configures the app and does not start the server.
import { env } from './config/env.js';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ApiError } from './utils/ApiError.js';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import  notificationRouter  from './routes/notification.routes.js'

const app = express();
app.set('trust proxy', 1);

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
})

app.use(helmet());
app.use(
  morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    skip: (req) => req.path === '/health' || req.path === '/ready',
  }),
);

// bro! the below health check section is for CI that we need to implement later on

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

app.get('/ready', (_req, res) => {
  // this is for readiness : for checks the MongoDB connection
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    status: dbUp ? 'ready' : 'not_ready',
    db: dbUp ? 'up' : 'down',
  });
});

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: '16kb',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '16kb',
  }),
);

app.use(cookieParser());
app.use('/api', apiLimiter);
// Routes
import userRouter from './routes/user.routes.js';

// Routes declarations
app.use('/api/v1/users', userRouter);
// Will pass to the users route https://localhost:8000/api/v1/users/login

import resourceRouter from './routes/resource.routes.js';

// Mount under your API version prefix
app.use('/api/v1/resources', resourceRouter);

import habitRouter from './routes/habit.routes.js';

app.use('/api/v1/habits', habitRouter);
app.use('/api/v1/notifications', notificationRouter);
import noteRouter from './routes/note.routes.js';

app.use('/api/v1/notes', noteRouter);

import journalRouter from './routes/journal.routes.js';

app.use('/api/v1/journals', journalRouter);

import pinnedRouter from './routes/pinned.routes.js';

app.use('/api/v1/pinned', pinnedRouter);

// pdf routes
import { pdfRouter, resourcePdfRouter } from './routes/pdf.routes.js';

app.use('/api/pdfs', pdfRouter);
app.use('/api/resources/:resourceId/pdf', resourcePdfRouter);
import dashboardRouter from './routes/dashboard.routes.js';

app.use('/api/v1/dashboard', dashboardRouter);

app.use((req, _res, next) => {
  next(new ApiError(404, `Path not found: ${req.method} ${req.originalUrl}`));
});

app.use((err, _req, res, _next) => {
  let error = err;

  if (err.code === 11000) {
    error = new ApiError(409, 'Duplicate value: already exists');
  } else if (err.name === 'ValidationError') {
    // Mongoose schema validation failed (e.g. a value not in an enum)
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = new ApiError(
      400,
      errors[0]?.message || 'Validation failed',
      errors,
    );
  } else if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid value for ' + err.path);
  }

  const statusCode = error.statusCode || error.status || 500;
  const isProd = env.NODE_ENV === 'production';

  if (statusCode >= 500) console.error(err); // unexpected errors always get logged

  res.status(statusCode).json({
    statusCode,
    success: false,
    message:
      statusCode === 500 && isProd ? 'Internal Server Error' : error.message,
    errors: error.errors || [],
    ...(isProd ? {} : { stack: err.stack }),
  });
});

export { app };
