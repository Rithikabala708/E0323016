import { Log } from "../utils/logger.js";
import { getToken } from "../services/auth.js";

export const loggingMiddleware = async (
  req,
  res,
  next
) => {
  try {
    const token = getToken();
    console.log("Middleware: Token available:", token ? "Yes" : "No");

    // Create message and ensure it's under 48 chars
    let message = `${req.method} ${req.originalUrl}`;
    if (message.length > 48) {
      message = message.substring(0, 45) + "...";
    }

    await Log(
      "backend",
      "info",
      "middleware",
      message,
      token
    );

    const start = Date.now();

    res.on("finish", async () => {
      try {
        const duration = Date.now() - start;
        
        let finishMsg = `${req.method} ${req.originalUrl} ${res.statusCode}`;
        if (finishMsg.length > 48) {
          finishMsg = finishMsg.substring(0, 45) + "...";
        }

        await Log(
          "backend",
          "info",
          "middleware",
          finishMsg,
          token
        );
      } catch (error) {
        console.error("Error in finish event:", error.message);
      }
    });

    next();
  } catch (error) {
    console.error("Middleware Error:", error.message);
    next(); // Continue even if logging fails
  }
};