const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// exports.register = async (req, res) => {
//   const { name, email, password, role, courses } = req.body; // courses: array of course IDs
//   const hash = await bcrypt.hash(password, 10);
//   try {
//     const result = await pool.query(
//       "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id",
//       [name, email, hash, role]
//     );
//     const userId = result.rows[0].id;
//     if (Array.isArray(courses) && courses.length > 0) {
//       for (const courseId of courses) {
//         await pool.query(
//           "INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)",
//           [userId, courseId]
//         );
//       }
//     }
//     res.json({ msg: "Registered successfully" });
//   } catch (err) {
//     res.status(500).json(err);
//   }
// };
exports.register = async (req, res) => {
  const { name, email, password, role, courses, mobile } = req.body; // add mobile
  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, hash, role, mobile]
    );
    const userId = result.rows[0].id;
    if (Array.isArray(courses) && courses.length > 0) {
      for (const courseId of courses) {
        await pool.query(
          "INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)",
          [userId, courseId]
        );
      }
    }
    res.json({ msg: "Registered successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(401).json({ msg: "Invalid email" });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ msg: "Invalid password" });
    const token = jwt.sign({ id: user.id, role: user.role }, "secret123", {
      expiresIn: "1d",
    });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role FROM users"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getMe = async (req, res) => {
  const userId = req.user.id; // req.user is set by authMiddleware
  try {
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getUserCourses = async (req, res) => {
  const userId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT c.id, c.title FROM courses c
       JOIN user_courses uc ON c.id = uc.course_id
       WHERE uc.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, courses } = req.body;
  try {
    await pool.query("UPDATE users SET name=$1, email=$2 WHERE id=$3", [
      name,
      email,
      id,
    ]);
    await pool.query("DELETE FROM user_courses WHERE user_id=$1", [id]);
    if (Array.isArray(courses) && courses.length > 0) {
      for (const courseId of courses) {
        await pool.query(
          "INSERT INTO user_courses (user_id, course_id) VALUES ($1, $2)",
          [id, courseId]
        );
      }
    }
    res.json({ msg: "User updated" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAllEmails = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, email FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json(err);
  }
};
