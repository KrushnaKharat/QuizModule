const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role, courses } = req.body; // courses: array of course IDs
  const hash = await bcrypt.hash(password, 10);
  db.query(
    "INSERT INTO users SET ?",
    { name, email, password: hash, role },
    (err, result) => {
      if (err) return res.status(500).json(err);
      const userId = result.insertId;
      if (Array.isArray(courses) && courses.length > 0) {
        const values = courses.map((courseId) => [userId, courseId]);
        db.query(
          "INSERT INTO user_courses (user_id, course_id) VALUES ?",
          [values],
          (err2) => {
            if (err2) return res.status(500).json(err2);
            res.json({ msg: "Registered successfully" });
          }
        );
      } else {
        res.json({ msg: "Registered successfully" });
      }
    }
  );
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err || results.length === 0)
        return res.status(401).json({ msg: "Invalid email" });
      const valid = await bcrypt.compare(password, results[0].password);
      if (!valid) return res.status(401).json({ msg: "Invalid password" });
      const token = jwt.sign(
        { id: results[0].id, role: results[0].role },
        "secret123",
        { expiresIn: "1d" }
      );
      res.json({ token, role: results[0].role });
    }
  );
};
exports.getAllUsers = (req, res) => {
  db.query("SELECT id, name, email, role FROM users", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: "User deleted" });
  });
};
exports.getMe = (req, res) => {
  const userId = req.user.id; // req.user is set by authMiddleware
  db.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [userId],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(404).json({ error: "User not found" });
      res.json(results[0]); // returns { id, name, email, role }
    }
  );
};
exports.getUserCourses = (req, res) => {
  const userId = req.params.id;
  db.query(
    `SELECT c.id, c.title FROM courses c
     JOIN user_courses uc ON c.id = uc.course_id
     WHERE uc.user_id = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, courses } = req.body;
  db.query(
    "UPDATE users SET name=?, email=? WHERE id=?",
    [name, email, id],
    (err) => {
      if (err) return res.status(500).json(err);
      // Update courses
      db.query("DELETE FROM user_courses WHERE user_id=?", [id], (err2) => {
        if (err2) return res.status(500).json(err2);
        if (Array.isArray(courses) && courses.length > 0) {
          const values = courses.map((courseId) => [id, courseId]);
          db.query(
            "INSERT INTO user_courses (user_id, course_id) VALUES ?",
            [values],
            (err3) => {
              if (err3) return res.status(500).json(err3);
              res.json({ msg: "User updated" });
            }
          );
        } else {
          res.json({ msg: "User updated" });
        }
      });
    }
  );
};
