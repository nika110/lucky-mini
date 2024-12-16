// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import * as dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Route Imports
import userRoutes from "./src/routes/userRoutes";
import genRoutes from "./src/routes/generalRoutes";
// import authRoutes from './routes/authRoutes';
// import raffleRoutes from './routes/raffleRoutes';
// import ticketRoutes from './routes/ticketRoutes';
// import transactionRoutes from './routes/transactionRoutes';

// Error Handler Import
// import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true,
// }));

app.use(
  cors({
    origin: true, // Allows all origins
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);

app.use(express.json({ limit: "10kb" })); // Body limit is 10kb
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// // Logging in development
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }

// Apply rate limiting to all routes
app.use(limiter);
app.set("trust proxy", 1);

// Health Check Route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
const API_PREFIX = "/api/v1";

app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}`, genRoutes);
// app.use(`${API_PREFIX}/raffles`, raffleRoutes);
// app.use(`${API_PREFIX}/tickets`, ticketRoutes);
// app.use(`${API_PREFIX}/transactions`, transactionRoutes);

// 404 Handler
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    status: "error",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//   errorHandler(err, req, res, next);
// });

// Uncaught Exception Handler
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  // process.exit(1);
});

// Unhandled Rejection Handler
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown on SIGTERM
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
  process.exit(0);
});

export default app;
