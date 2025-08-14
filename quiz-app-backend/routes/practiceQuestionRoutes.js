const express = require("express");
const router = express.Router();
const {
  getPracticeQuestionsByTopicId,
  addPracticeQuestionsToTopic,
  updatePracticeQuestions,
  deletePracticeQuestions,
} = require("../controllers/practiceQuestionController");
const { authMiddleware } = require("../middleware/authMiddleware");

// For topic-based questions
router.get(
  "/topics/:topicId/practicequestions",
  authMiddleware,
  getPracticeQuestionsByTopicId
);
router.post(
  "/topics/:topicId/practicequestions",
  authMiddleware,
  addPracticeQuestionsToTopic
);

// You can keep or remove this if not needed
router.put("/:id", authMiddleware, updatePracticeQuestions);
router.delete("/:id", authMiddleware, deletePracticeQuestions);

module.exports = router;
