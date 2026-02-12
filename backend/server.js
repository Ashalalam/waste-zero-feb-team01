const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");  // 👈 must be here

const app = express();

app.use(cors());
app.use(express.json());

connectDB();  // 👈 must be called

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
