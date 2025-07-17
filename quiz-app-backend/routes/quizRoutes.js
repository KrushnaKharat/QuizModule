const express = require('express');
const router = express.Router();
const { getAllQuizzes, createQuiz } = require('../controllers/quizController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllQuizzes);
router.post('/', authMiddleware, createQuiz);

module.exports = router;
