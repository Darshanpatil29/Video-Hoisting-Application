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

// routes declaration

app.use("/api/v1/users",userRoutes);

// http://localhost:8000/api/v1/users/register











// Export the configured Express app for use in other modules
export { app };
