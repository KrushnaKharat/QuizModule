const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const router = express.Router();
const {
  getQuestionsByTopicId,
  addQuestionToTopic,
  updateQuestion,
  deleteQuestion,
  importQuestionsFromFile,
} = require("../controllers/questionController");
const { authMiddleware } = require("../middleware/authMiddleware");

// For topic-based questions
router.get("/topics/:topicId/questions", authMiddleware, getQuestionsByTopicId);
router.post("/topics/:topicId/questions", authMiddleware, addQuestionToTopic);

// You can keep or remove this if not needed
router.put("/:id", authMiddleware, updateQuestion);
router.delete("/:id", authMiddleware, deleteQuestion);

router.post(
  "/topics/:topicId/import",
  authMiddleware,
  upload.single("file"),
  importQuestionsFromFile
);

module.exports = router;
