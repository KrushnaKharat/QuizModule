const express = require("express");
const router = express.Router();
const {
  getAllTopics,
  addTopic,
  updateTopic,
  deleteTopic,
} = require("../controllers/topicController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/:courseId/topics", authMiddleware, getAllTopics);
router.post("/:courseId/topics", authMiddleware, addTopic);
router.put("/:courseId/topics/:topicId", authMiddleware, updateTopic);
router.delete("/:courseId/topics/:topicId", authMiddleware, deleteTopic);

module.exports = router;
