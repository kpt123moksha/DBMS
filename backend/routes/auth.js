const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    // Public registration intentionally creates student accounts only.
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,'student') RETURNING id,name,email,role",
      [name, email.toLowerCase(), hash]
    );
    res.status(201).json({ message: "Registration successful", user: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ message: "Email already registered" });
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });
    const result = await db.query("SELECT * FROM users WHERE email=$1", [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const payload = { id: user.id, name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login successful", token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
