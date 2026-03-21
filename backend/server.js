  const express = require("express");
  const cors = require("cors");
  require("dotenv").config();
  const passport = require("passport");

  const connectDB = require("./config/db");
  const errorHandler = require("./middleware/errorHandler");

  const helmet = require("helmet");
  const rateLimit = require("express-rate-limit");

  // ✅ NEW: required for socket
  const http = require("http");
  const { Server } = require("socket.io");

  require("./config/passport");

  const matchRoutes = require("./routes/matchRoutes");
  const messageRoutes = require("./routes/messageRoutes");

  const app = express();

  // 🔥 DEBUG: check if env is loading
  console.log("MONGO_URI:", process.env.MONGO_URI);

  // ✅ CREATE HTTP SERVER
  const server = http.createServer(app);

  // ✅ CONNECT DATABASE (MOVE UP)
  connectDB();

  // ✅ INITIALIZE SOCKET.IO
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

  // ✅ STORE CONNECTED USERS
  const users = {};

  // ✅ SOCKET CONNECTION
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    setTimeout(() => {
      socket.emit("new_message", {
        sender_id: "Server",
        content: "Hello Asha 🔥 Real-time working!",
      });
    }, 2000);

    socket.on("register", (userId) => {
      users[userId] = socket.id;
      console.log("User registered:", userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      for (let userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId];
        }
      }
    });
  });

  // ✅ MAKE io AVAILABLE IN ROUTES
  app.set("io", io);
  app.set("users", users);

  // Security headers
  app.use(helmet());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  });
  app.use(limiter);

  // CORS


app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

  // Body parser
  app.use(express.json());

  // Passport
  app.use(passport.initialize());

  // Routes
  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/users", require("./routes/userRoutes"));
  app.use("/api/opportunities", require("./routes/opportunityRoutes"));
  app.use("/api/matches", matchRoutes);
  app.use("/api/messages", messageRoutes);

  // Root route
  app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
  });

  // Error handler
  app.use(errorHandler);

  // Start server
  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
