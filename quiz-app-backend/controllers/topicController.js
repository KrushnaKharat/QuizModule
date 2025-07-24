const db = require("../config/db");

exports.getAllTopics = (req, res) => {
  const { courseId } = req.params;
  db.query(
    "SELECT * FROM topics WHERE course_id = ?",
    [courseId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.addTopic = (req, res) => {
  const { courseId } = req.params;
  const { title } = req.body;

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

exports.updateTopic = (req, res) => {
  const { topicId } = req.params;
  const { title } = req.body;
  db.query(
    "UPDATE topics SET title = ? WHERE id = ?",
    [title, topicId],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ msg: "Topic updated" });
    }
  );
};

exports.deleteTopic = (req, res) => {
  const { topicId } = req.params;
  db.query("DELETE FROM topics WHERE id = ?", [topicId], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "Topic deleted" });
  });
};
