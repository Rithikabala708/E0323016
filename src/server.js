import express from "express";
import dotenv from "dotenv";
import { loggingMiddleware } from "./middleware/loggingMiddleware.js";
import { authenticate } from "./services/auth.js";
import schedulerRoutes from "./routes/schedulerroutes.js";

// Load environment variables
dotenv.config();

const app = express();

app.use(express.json());

// Get access token first
await authenticate();

// Register logging middleware
app.use(loggingMiddleware);

// Register routes
app.use("/api", schedulerRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("Server Running");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});