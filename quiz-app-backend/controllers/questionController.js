const db = require("../config/db");

exports.getQuestionsByTopicId = (req, res) => {
  const { topicId } = req.params;
  db.query(
    "SELECT * FROM questions WHERE topic_id = ?",
    [topicId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.addQuestionToTopic = (req, res) => {
  const { topicId } = req.params;
  const {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body;

  db.query(
    "INSERT INTO questions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      topicId,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_option,
    ],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Question added" });
    }
  );
};

exports.deleteQuestion = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM questions WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Question deleted" });
  });
};
exports.updateQuestion = (req, res) => {
  const id = req.params.id;
  const {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body;
  db.query(
    `UPDATE questions SET question_text=?, option_a=?, option_b=?, option_c=?, option_d=?, correct_option=? WHERE id=?`,
    [question_text, option_a, option_b, option_c, option_d, correct_option, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Question updated" });
    }
  );
};
