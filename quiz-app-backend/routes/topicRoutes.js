// In your routes file
const express = require("express");
const router = express.Router();

const topicController = require("../controllers/topicController");
const { authMiddleware } = require("../middleware/authMiddleware");
router.get(
  "/course/:courseId/topics",
  authMiddleware,
  topicController.getAllTopics
);
router.post(
  "/course/:courseId/topics",
  authMiddleware,
  topicController.addTopicToCourse
);

module.exports = router;
