const express = require("express");
const router = express.Router();
const {
  getAllTopics,
  addTopic,
  updateTopic,
  deleteTopic,
  getTopicById,
  getAllAndEachTopics,
} = require("../controllers/topicController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/:courseId/topics", authMiddleware, getAllTopics);
router.get("/topics", authMiddleware, getAllAndEachTopics);

router.post("/:courseId/topics", authMiddleware, addTopic);
router.put("/:courseId/topics/:topicId", authMiddleware, updateTopic);
router.delete("/:courseId/topics/:topicId", authMiddleware, deleteTopic);
router.get("/topic/:topicId", authMiddleware, getTopicById);

module.exports = router;
