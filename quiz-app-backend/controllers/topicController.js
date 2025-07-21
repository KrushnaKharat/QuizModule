const db = require("../config/db");

exports.getAllTopics = (req, res) => {
  db.query("SELECT * FROM topics", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.addTopic = (req, res) => {
  const { title } = req.body;
  const { courseId } = req.params;

  if (!title || !courseId) {
    return res.status(400).json({ error: "Title and courseId required" });
  }

  db.query(
    "INSERT INTO topics (title, course_id) VALUES (?, ?)",
    [title, courseId],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Topic added", topicId: result.insertId });
    }
  );
};
