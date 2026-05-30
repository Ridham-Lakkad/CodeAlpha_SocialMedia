import http from "http";
import dotenv from "dotenv";
import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://localhost:5173"].filter(Boolean),
    credentials: true
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("user:join", (userId) => {
    if (userId) socket.join(userId);
  });
  // forward messages between connected users (best-effort delivery)
  socket.on("message:send", (payload) => {
    try {
      if (payload && payload.to) {
        io.to(payload.to).emit("message:new", payload);
      }
    } catch (err) {
      // ignore
    }
  });
});

await connectDB();

server.listen(PORT, () => {
  console.log(`SocialConnect API listening on port ${PORT}`);
});
