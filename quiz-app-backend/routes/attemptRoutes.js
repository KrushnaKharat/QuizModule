const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  submitQuiz,
  getUserAttempts,
  getRemainingAttempts,
  getAllRemainingAttemptsForUser,
} = require("../controllers/attemptController");

// Submit quiz
router.post("/submit", authMiddleware, submitQuiz);

// Admin: get all attempts
router.get("/admin/attempts", authMiddleware, getUserAttempts);

// Get remaining attempts for user/topic
router.get("/remaining/:userId/:topicId", authMiddleware, getRemainingAttempts);
router.get(
  "/remaining/all/:userId",
  authMiddleware,
  getAllRemainingAttemptsForUser
);

module.exports = router;
