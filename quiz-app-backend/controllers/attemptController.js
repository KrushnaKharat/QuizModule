const pool = require("../config/db");

exports.submitQuiz = async (req, res) => {
  const userId = req.user.id;
  const { topicId, answers, score } = req.body;
  const startedAt = req.body.startedAt || new Date();
  const endedAt = new Date();

  try {
    // Check attempts
    const result = await pool.query(
      "SELECT COUNT(*) AS cnt FROM quiz_attempts WHERE user_id=$1 AND topic_id=$2",
      [userId, topicId]
    );
    const cnt = parseInt(result.rows[0].cnt, 10);
    if (cnt >= 3) {
      return res.status(403).json({ msg: "Maximum attempts reached" });
    }

    // Insert attempt
    const attemptResult = await pool.query(
      "INSERT INTO quiz_attempts (user_id, topic_id, score, started_at, ended_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [userId, topicId, score, startedAt, endedAt]
    );
    const attemptId = attemptResult.rows[0].id;

    // If no answers, just return success
    if (!answers || answers.length === 0) {
      return res.json({ msg: "Quiz submitted", attemptId });
    }

    // Insert user answers (bulk insert)
    const values = [];
    const params = [];
    let paramIndex = 1;
    answers.forEach((ans, idx) => {
      values.push(
        `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
      );
      params.push(
        userId,
        attemptId,
        ans.question_id,
        ans.selected_option,
        ans.is_correct
      );
    });
    if (values.length > 0) {
      const sql = `INSERT INTO user_answers (user_id, attempt_id, question_id, selected_option, is_correct) VALUES ${values.join(
        ", "
      )}`;
      await pool.query(sql, params);
    }
    res.json({ msg: "Quiz submitted", attemptId });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get user attempts for admin
exports.getUserAttempts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT qa.*, u.name as user_name, t.title as topic_title
       FROM quiz_attempts qa
       JOIN users u ON qa.user_id = u.id
       JOIN topics t ON qa.topic_id = t.id
       ORDER BY qa.started_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Get remaining attempts for a user/topic
exports.getRemainingAttempts = async (req, res) => {
  const userId = req.params.userId;
  const topicId = req.params.topicId;
  try {
    const result = await pool.query(
      "SELECT COUNT(*) AS cnt FROM quiz_attempts WHERE user_id=$1 AND topic_id=$2",
      [userId, topicId]
    );
    const cnt = parseInt(result.rows[0].cnt, 10);
    const result2 = await pool.query(
      "SELECT max_attempts FROM topics WHERE id=$1",
      [topicId]
    );
    const maxAttempts = result2.rows[0]?.max_attempts || 3;
    res.json({ remaining: maxAttempts - cnt, maxAttempts });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAllRemainingAttemptsForUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(
      `SELECT t.id as topic_id, t.title, t.max_attempts,
        (t.max_attempts - COALESCE(a.cnt,0)) as remaining_attempts
       FROM topics t
       LEFT JOIN (
         SELECT topic_id, COUNT(*) as cnt
         FROM quiz_attempts
         WHERE user_id = $1
         GROUP BY topic_id
       ) a ON t.id = a.topic_id`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getUserAttemptsAggregated = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.name as user_name,
        t.title as topic_title,
        c.title as course_title,
        MAX(CASE WHEN rn = 1 THEN qa.score END) as first_attempt,
        MAX(CASE WHEN rn = 2 THEN qa.score END) as second_attempt,
        MAX(CASE WHEN rn = 3 THEN qa.score END) as third_attempt,
        MAX(qa.score) as best_score
      FROM users u
      JOIN quiz_attempts qa ON qa.user_id = u.id
      JOIN topics t ON qa.topic_id = t.id
      JOIN courses c ON t.course_id = c.id
      JOIN (
        SELECT id, user_id, topic_id,
          ROW_NUMBER() OVER (PARTITION BY user_id, topic_id ORDER BY started_at ASC) as rn
        FROM quiz_attempts
      ) ranked ON ranked.id = qa.id
      GROUP BY u.name, t.title, c.title, qa.user_id, qa.topic_id
      ORDER BY u.name, c.title, t.title
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};
