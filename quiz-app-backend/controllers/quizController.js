const db = require("../config/db");

exports.getAllQuizzes = (req, res) => {
  db.query("SELECT * FROM courses", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.createCourse = (req, res) => {
  const { title } = req.body;
  db.query("INSERT INTO courses SET ?", { title }, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Course created" });
  });
};
exports.deleteTopic = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM courses WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Topic deleted" });
  });
};
