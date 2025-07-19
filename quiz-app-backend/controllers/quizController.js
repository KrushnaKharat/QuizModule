const db = require("../config/db");

exports.getAllQuizzes = (req, res) => {
  db.query("SELECT * FROM quizzes", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.createQuiz = (req, res) => {
  const { title, description, time_limit } = req.body;
  db.query(
    "INSERT INTO quizzes SET ?",
    { title, description, time_limit },
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Quiz created" });
    }
  );
};
exports.deleteTopic = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM questions WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Topic deleted" });
  });
};
