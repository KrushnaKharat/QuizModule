const express = require("express");
const router = express.Router();
const {
  getAllQuizzes,
  createCourse,
  deleteTopic,
} = require("../controllers/quizController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getAllQuizzes);
router.post("/", authMiddleware, createCourse);
router.delete("/:id", authMiddleware, deleteTopic);

module.exports = router;
