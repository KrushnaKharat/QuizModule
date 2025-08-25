const pool = require("../config/db");

exports.getAllQuizzes = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.createCourse = async (req, res) => {
  const { title } = req.body;
  try {
    await pool.query("INSERT INTO courses (title) VALUES ($1)", [title]);
    res.json({ msg: "Course created" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteTopic = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ msg: "Topic deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};