const pool = require("../config/db");

exports.getPracticeQuestionsByTopicId = async (req, res) => {
  const { topicId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM practicequestions WHERE topic_id = $1",
      [topicId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.addPracticeQuestionsToTopic = async (req, res) => {
  const { topicId } = req.params;
  const {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body;

  try {
    await pool.query(
      "INSERT INTO practicequestions (topic_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [
        topicId,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
      ]
    );
    res.json({ msg: "Question added" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deletePracticeQuestions = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM practicequestions WHERE id = $1", [id]);
    res.json({ msg: "Question deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updatePracticeQuestions = async (req, res) => {
  const id = req.params.id;
  const {
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_option,
  } = req.body;
  try {
    await pool.query(
      `UPDATE practicequestions SET question_text=$1, option_a=$2, option_b=$3, option_c=$4, option_d=$5, correct_option=$6 WHERE id=$7`,
      [
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        id,
      ]
    );
    res.json({ message: "Question updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};
