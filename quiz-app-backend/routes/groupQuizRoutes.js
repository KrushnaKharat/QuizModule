const express = require("express");
const router = express.Router();
const groupQuiz = require("../controllers/groupQuizController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/session", authMiddleware, groupQuiz.createSession);
router.post("/invite", authMiddleware, groupQuiz.inviteUsers);
router.put(
  "/invitation/:invitation_id",
  authMiddleware,
  groupQuiz.respondInvitation
);
router.get(
  "/invitations/:user_id",
  authMiddleware,
  groupQuiz.getUserInvitations
);
router.get("/lobby/:session_id", authMiddleware, groupQuiz.getLobby);
router.put("/start/:session_id", authMiddleware, groupQuiz.startSession);
router.get(
  "/questions/:session_id",
  authMiddleware,
  groupQuiz.getSessionQuestions
);
router.post("/result", authMiddleware, groupQuiz.submitResult);
router.get("/sessions/:user_id", authMiddleware, groupQuiz.getUserSessions);
router.get(
  "/sessioninfo/:session_id",
  authMiddleware,
  groupQuiz.getSessionInfo
);

module.exports = router;
