const express = require("express");
const router = express.Router();
const {
  getAllQuizzes,
  createQuiz,
  deleteTopic,
} = require("../controllers/quizController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAllQuizzes);
router.post("/", authMiddleware, createQuiz);
router.post("/:id", authMiddleware, deleteTopic);

module.exports = router;
