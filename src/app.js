// Import necessary modules
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Create an Express app instance
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // Allow requests from this origin (configured through environment variable)
  credentials: true  // Include credentials in CORS requests (e.g., cookies)
}));

// Parse incoming JSON requests with a limit of 16kb
app.use(express.json({ limit: "16kb" }));

// Parse incoming URL-encoded requests with extended options
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "Public" directory
app.use(express.static("Public"));

// Parse cookies using cookie-parser middleware
app.use(cookieParser());

// routes import 

import {userRoutes} from './routes/user.routes.js';
import { videoRoutes } from './routes/video.routes.js';
import { subscribeRoutes } from './routes/subscription.routes.js';
import { playlistRoutes } from './routes/playlist.routes.js';
import { commentRouter } from './routes/comments.routes.js';
import { likesRouter } from './routes/likes.routes.js';
import { tweetsRouter } from './routes/tweets.routes.js';
import { desktopRoutes } from './routes/desktop.routes.js';
// routes declaration

app.use("/api/v1/users",userRoutes);
// http://localhost:8000/api/v1/users/register

app.use("/api/v1/videos",videoRoutes);

app.use("/api/v1/subscriptions",subscribeRoutes);

app.use("/api/v1/playlists",playlistRoutes);

app.use("/api/v1/comments",commentRouter);

app.use("/api/v1/likes",likesRouter);

app.use("/api/v1/tweets",tweetsRouter);

app.use("/api/v1/channel",desktopRoutes)

export { app };
