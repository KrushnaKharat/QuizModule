const pool = require("../config/db");

// 1. Create a new group quiz session
exports.createSession = async (req, res) => {
  const { host_id, course_id, topic_id, group_name, total_questions, timer } =
    req.body;
  try {
    // Create session
    const sessionRes = await pool.query(
      `INSERT INTO quiz_sessions (host_id, course_id, topic_id, group_name, total_questions, timer)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [host_id, course_id, topic_id, group_name, total_questions,timer]
    );
    const session_id = sessionRes.rows[0].id;

    // Randomly select N questions for this topic
    const questionsRes = await pool.query(
      `SELECT id FROM questions WHERE topic_id = $1 ORDER BY RANDOM() LIMIT $2`,
      [topic_id, total_questions]
    );
    for (const q of questionsRes.rows) {
      await pool.query(
        `INSERT INTO quiz_session_questions (session_id, question_id) VALUES ($1, $2)`,
        [session_id, q.id]
      );
    }
    res.json({ session_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. Invite users
exports.inviteUsers = async (req, res) => {
  const { session_id, user_ids } = req.body; // user_ids: array
  try {
    for (const user_id of user_ids) {
      await pool.query(
        `INSERT INTO quiz_invitations (session_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [session_id, user_id]
      );
    }
    res.json({ msg: "Invitations sent" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Accept/Reject invitation
exports.respondInvitation = async (req, res) => {
  const { invitation_id } = req.params;
  const { status } = req.body; // 'accepted' or 'rejected'
  try {
    await pool.query(
      `UPDATE quiz_invitations SET status=$1, responded_at=NOW() WHERE id=$2`,
      [status, invitation_id]
    );
    res.json({ msg: "Invitation updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. Get lobby users
exports.getLobby = async (req, res) => {
  const { session_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, qi.status
   FROM quiz_invitations qi
   JOIN users u ON qi.user_id = u.id
   WHERE qi.session_id = $1`,
      [session_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Start quiz (host only)
exports.startSession = async (req, res) => {
  const { session_id } = req.params;
  try {
    await pool.query(`UPDATE quiz_sessions SET status='active' WHERE id=$1`, [
      session_id,
    ]);
    res.json({ msg: "Quiz started" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Fetch locked questions for a session
exports.getSessionQuestions = async (req, res) => {
  const { session_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT q.* FROM quiz_session_questions ssq
       JOIN questions q ON ssq.question_id = q.id
       WHERE ssq.session_id = $1`,
      [session_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 7. Submit quiz result
exports.submitResult = async (req, res) => {
  const { session_id, user_id, score } = req.body;
  try {
    await pool.query(
      `INSERT INTO quiz_results (session_id, user_id, score, started_at, ended_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [session_id, user_id, score]
    );
    res.json({ msg: "Result submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 8. Get previous group quizzes for a user
exports.getUserSessions = async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT qs.*, c.title AS course_name, t.title AS topic_name
       FROM quiz_sessions qs
       JOIN quiz_invitations qi ON qs.id = qi.session_id
       JOIN courses c ON qs.course_id = c.id
       JOIN topics t ON qs.topic_id = t.id
       WHERE qi.user_id = $1 AND qs.expires_at > NOW()`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSessionInfo = async (req, res) => {
  const { session_id } = req.params;
  const result = await pool.query(
    `SELECT qs.status, qs.host_id, u.name as host_name, qs.timer
     FROM quiz_sessions qs
     JOIN users u ON qs.host_id = u.id
     WHERE qs.id = $1`,
    [session_id]
  );
  res.json(result.rows[0]);
};
exports.getUserInvitations = async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT qi.*, qs.group_name, qs.course_id, qs.topic_id, u.name as host_name
       FROM quiz_invitations qi
       JOIN quiz_sessions qs ON qi.session_id = qs.id
       JOIN users u ON qs.host_id = u.id
       WHERE qi.user_id = $1 AND qi.status = 'invited'`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSessionResults = async (req, res) => {
  const { session_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT qr.*, u.name FROM quiz_results qr
       JOIN users u ON qr.user_id = u.id
       WHERE qr.session_id = $1`,
      [session_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
