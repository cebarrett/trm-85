import express from "express";
import { chatRoute } from "./routes/chat.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();
app.use(express.json());
app.use("/api", rateLimiter);
app.post("/api/chat", chatRoute);

// In production, serve the built client static files
app.use(express.static("../client/dist"));

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`TRM-85 server listening on port ${port}`);
});
