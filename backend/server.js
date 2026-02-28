const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

const startServer = async () => {
  try {
    await connectDB();

    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/users", require("./routes/userRoutes"));
    app.use("/api/opportunities", require("./routes/opportunityRoutes"));

    app.get("/", (req, res) => {
      res.send("Backend is running");
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log("Server running on port " + PORT);
    });

  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error.message);
    process.exit(1);
  }
};

startServer();