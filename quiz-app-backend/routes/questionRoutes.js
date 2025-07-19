const express = require("express");
const router = express.Router();
const {
  getQuestionsByQuizId,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/:quizId", authMiddleware, getQuestionsByQuizId);
router.post("/", authMiddleware, addQuestion);
router.put("/:id", authMiddleware, updateQuestion);
router.delete("/:id", authMiddleware, deleteQuestion);
router.put("/:id", updateQuestion);

module.exports = router;
