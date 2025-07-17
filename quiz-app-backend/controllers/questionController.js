const db = require("../config/db");

exports.getQuestionsByQuizId = (req, res) => {
  const { quizId } = req.params;
  db.query(
    "SELECT * FROM questions WHERE quiz_id = ?",
    [quizId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.addQuestion = (req, res) => {
  const data = req.body;
  db.query("INSERT INTO questions SET ?", data, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Question added" });
  });
};

exports.updateQuestion = (req, res) => {
  const { id } = req.params;
  const data = req.body;
  db.query("UPDATE questions SET ? WHERE id = ?", [data, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Question updated" });
  });
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
