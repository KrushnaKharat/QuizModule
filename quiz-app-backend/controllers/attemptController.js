const db = require("../config/db");

exports.submitQuiz = (req, res) => {
  const userId = req.user.id;
  const { topicId, answers, score } = req.body;
  const startedAt = req.body.startedAt || new Date();
  const endedAt = new Date();

  // Check attempts
  db.query(
    "SELECT COUNT(*) AS cnt FROM quiz_attempts WHERE user_id=? AND topic_id=?",
    [userId, topicId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result[0].cnt >= 3) {
        return res.status(403).json({ msg: "Maximum attempts reached" });
      }

      // Insert attempt
      db.query(
        "INSERT INTO quiz_attempts (user_id, topic_id, score, started_at, ended_at) VALUES (?, ?, ?, ?, ?)",
        [userId, topicId, score, startedAt, endedAt],
        (err, attemptResult) => {
          if (err) return res.status(500).json(err);
          const attemptId = attemptResult.insertId;

          // If no answers, just return success
          if (!answers || answers.length === 0) {
            return res.json({ msg: "Quiz submitted", attemptId });
          }

          // Insert user answers
          // Build query and data for bulk insert
          let sql =
            "INSERT INTO user_answers ( user_id, attempt_id, question_id, selected_option, is_correct) VALUES ";
          const values = [];
          answers.forEach((ans, idx) => {
            sql += "(?, ?, ?, ?, ?)" + (idx < answers.length - 1 ? ", " : "");
            values.push(
              userId,
              attemptId,
              ans.question_id,
              ans.selected_option,
              ans.is_correct
            );
          });
          db.query(sql, values, (err2) => {
            if (err2) {
              console.error("Insert user_answers error:", err2);
              return res
                .status(500)
                .json({ msg: "Insert user_answers error", error: err2 });
            }
            res.json({ msg: "Quiz submitted", attemptId });
          });
        }
      );
    }
  );
};

// Get user attempts for admin
exports.getUserAttempts = (req, res) => {
  db.query(
    `SELECT qa.*, u.name as user_name, t.title as topic_title
     FROM quiz_attempts qa
     JOIN users u ON qa.user_id = u.id
     JOIN topics t ON qa.topic_id = t.id
     ORDER BY qa.started_at DESC`,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

// Get remaining attempts for a user/topic
exports.getRemainingAttempts = (req, res) => {
  const userId = req.params.userId;
  const topicId = req.params.topicId;
  db.query(
    "SELECT COUNT(*) AS cnt FROM quiz_attempts WHERE user_id=? AND topic_id=?",
    [userId, topicId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      db.query(
        "SELECT max_attempts FROM topics WHERE id=?",
        [topicId],
        (err2, result2) => {
          if (err2) return res.status(500).json(err2);
          const maxAttempts = result2[0]?.max_attempts || 3;
          res.json({ remaining: maxAttempts - result[0].cnt });
        }
      );
    }
  );
};
