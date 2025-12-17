const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/auth");
const pool = require("../config/database");
const { checkAndAwardStreakFlames } = require("../utils/streakFlames");
const { limiter } = require("../middleware/rateLimiter");

/* 
|---------------------------------------------------------------------------
| Signup Route
|---------------------------------------------------------------------------
*/
router.post("/signup", limiter, async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const existingUsers = await conn.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res
        .status(409)
        .json({ error: "User with that username or email already exists." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await conn.query(
      "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
      [username, email, passwordHash]
    );

    const userId = Number(result.insertId);

    const token = jwt.sign(
      { user_id: userId, role: "user" },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(201).json({
      message: "User created successfully.",
      token,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user." });
  } finally {
    if (conn) conn.release();
  }
});

/* 
|---------------------------------------------------------------------------
| Login Route
|---------------------------------------------------------------------------
*/
router.post("/login", limiter, async (req, res) => {
  const { identifier, password, rememberMe } = req.body;

  // Validate input
  if (!identifier || !password) {
    return res.status(400).json({ error: "Missing identifier or password." });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    // Check if identifier is email or username
    const query = identifier.includes("@")
      ? "SELECT * FROM users WHERE email = ?"
      : "SELECT * FROM users WHERE username = ?";

    const [user] = await conn.query(query, [identifier]);

    // Validate user existence
    if (!user) {
      return res
        .status(401)
        .json({ error: "Invalid username/email or password." });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Invalid username/email or password." });
    }

    // Generate JWT token
    const expiresIn = rememberMe ? "7d" : "1h";
    const token = jwt.sign(
      { user_id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Update last login
    await conn.query("UPDATE users SET last_login = NOW() WHERE id = ?", [
      user.id,
    ]);

    console.log(`✅ User ${user.id} logged in successfully.`);
    res.status(200).json({
      message: "Logged in successfully.",
      token,
      expiresIn,
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Failed to log in." });
  } finally {
    if (conn) conn.release(); // Ensure connection is always released
  }
});
/* 
|---------------------------------------------------------------------------
| Get User Profile Route
|---------------------------------------------------------------------------
*/
router.get("/me", authenticateToken, async (req, res) => {
  try {
    console.log("✅ Authenticated user:", req.user);

    if (!req.user || !req.user.user_id) {
      console.error("❌ Missing user ID in token.");
      return res.status(401).json({ error: "Invalid user token." });
    }

    const conn = await pool.getConnection();
    const userQuery = `
      SELECT id, username, email, flames, level, streak_days, last_login, total_recipes_saved, badges 
      FROM users WHERE id = ?`;
    const [user] = await conn.query(userQuery, [req.user.user_id]);

    if (!user) {
      console.error(
        "❌ User not found in database. User ID:",
        req.user.user_id
      );
      return res.status(404).json({ error: "User not found." });
    }

    console.log(user.id + user.last_login);

    const { flamesAwarded, streakDays } = await checkAndAwardStreakFlames(
      user.id,
      user.last_login,
      user.streak_days
    );

    conn.release();

    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      flames: user.flames + flamesAwarded,
      level: user.level,
      streakDays,
      totalRecipesSaved: user.total_recipes_saved,
      badges: JSON.parse(user.badges || "[]"),
      flamesAwarded,
    });
  } catch (err) {
    console.error("❌ Database Error fetching user data:", err);
    res.status(500).json({ error: "Failed to fetch user data." });
  }
});

module.exports = router;
