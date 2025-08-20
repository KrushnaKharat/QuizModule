const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  deleteUser,
  getMe,
  getUserCourses,
  updateUser,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers); // <-- Add this line
router.get("/users/:id/courses", authMiddleware, getUserCourses);
router.put("/users/:id", authMiddleware, updateUser);

router.delete("/users/:id", deleteUser);
router.get("/me", authMiddleware, getMe);

module.exports = router;
