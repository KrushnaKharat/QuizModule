const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users SET ?', { name, email, password: hash, role }, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ msg: 'Registered successfully' });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ msg: 'Invalid email' });
    const valid = await bcrypt.compare(password, results[0].password);
    if (!valid) return res.status(401).json({ msg: 'Invalid password' });
    const token = jwt.sign({ id: results[0].id, role: results[0].role }, 'secret123', { expiresIn: '1d' });
    res.json({ token, role: results[0].role });
  });
};
