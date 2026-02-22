const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword
} = require("../controllers/authController");



const authMiddleware = require("../middleware/authMiddleware");
router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", authMiddleware, getUserProfile);
router.put("/me", authMiddleware, updateUserProfile);


router.put("/change-password", authMiddleware, changePassword);




module.exports = router;
