const pool = require("../config/db");

exports.getAllTopics = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM topics WHERE course_id = $1",
      [courseId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getTopicById = async (req, res) => {
  const { topicId } = req.params;
  try {
    const result = await pool.query("SELECT * FROM topics WHERE id = $1", [
      topicId,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.addTopic = async (req, res) => {
  const { courseId } = req.params;
  const { title, level, timer, max_attempts } = req.body;
  if (!title || !courseId) {
    return res.status(400).json({ error: "Title and courseId required" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO topics (title, course_id, level, timer, max_attempts) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [title, courseId, level, timer, max_attempts]
    );
    res.json({ msg: "Topic added", topicId: result.rows[0].id });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateTopic = async (req, res) => {
  const { topicId } = req.params;
  const { title, level, timer } = req.body;
  try {
    await pool.query(
      "UPDATE topics SET title=$1, level=$2, timer=$3 WHERE id = $4",
      [title, level, timer, topicId]
    );
    res.json({ msg: "Topic updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteTopic = async (req, res) => {
  const { topicId } = req.params;
  try {
    await pool.query("DELETE FROM topics WHERE id = $1", [topicId]);
    res.json({ msg: "Topic deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};
