const validator = require("validator");
const jwt = require("jsonwebtoken");

// In-memory storage for demo mode
const users = [];

// 🔥 Generate JWT token (NOW INCLUDES ROLE)
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET || "demo-secret-key",
    { expiresIn: "7d" }
  );
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Required field validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Role validation
    if (!["volunteer", "NGO"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be volunteer or NGO",
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    const user = {
      id: Date.now().toString(),
      name,
      email,
      password, // demo only
      role,
      skills: [],
      location: "",
      bio: "",
    };

    users.push(user);

    // 🔥 Generate token with role included
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        location: user.location,
        bio: user.bio,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 🔥 Generate token with role included
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        location: user.location,
        bio: user.bio,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};