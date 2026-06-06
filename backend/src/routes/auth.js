const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

function getUserStats(userId) {
    const submissions = db.prepare("SELECT status FROM submissions WHERE user_id = ?").all(userId);
    const solved = db.prepare(`
        SELECT COUNT(DISTINCT problem_id) AS count
        FROM submissions WHERE user_id = ? AND status = 'AC'
    `).get(userId);

    const totalSubmissions = submissions.length;
    const acCount = submissions.filter((s) => s.status === "AC").length;
    const accuracy = totalSubmissions > 0 ? Math.round((acCount / totalSubmissions) * 100) : 0;

    return { totalSubmissions, solvedCount: solved?.count || 0, accuracy };
}

function formatUser(user) {
    const stats = getUserStats(user.id);
    return {
        id: user.id,
        username: user.username,
        name: user.name,
        class: user.class_name,
        school: user.school,
        preferredLang: user.preferred_lang,
        createdAt: user.created_at,
        ...stats
    };
}

router.post("/register", (req, res) => {
    const { username, password, name, class: className, school, preferredLang } = req.body;

    if (!username?.trim() || !password || !name?.trim() || !className?.trim() || !school?.trim()) {
        return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc" });
    }

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
        return res.status(400).json({ error: "Tên đăng nhập: 3-20 ký tự, chỉ chữ thường, số và dấu _" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Mật khẩu phải có ít nhất 6 ký tự" });
    }

    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(cleanUsername);
    if (existing) {
        return res.status(409).json({ error: "Tên đăng nhập đã tồn tại" });
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
        INSERT INTO users (id, username, password_hash, name, class_name, school, preferred_lang)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        cleanUsername,
        passwordHash,
        name.trim(),
        className.trim(),
        school.trim(),
        preferredLang || "C++ (GCC 17)"
    );

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    const token = signToken(user);

    res.status(201).json({ token, user: formatUser(user) });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
        return res.status(400).json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu" });
    }

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username.trim().toLowerCase());
    if (!user || !user.password_hash) {
        return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    const token = signToken(user);
    res.json({ token, user: formatUser(user) });
});

router.get("/me", requireAuth, (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.userId);
    if (!user) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }
    res.json(formatUser(user));
});

router.put("/profile", requireAuth, (req, res) => {
    const { name, class: className, school, preferredLang } = req.body;

    db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            class_name = COALESCE(?, class_name),
            school = COALESCE(?, school),
            preferred_lang = COALESCE(?, preferred_lang)
        WHERE id = ?
    `).run(name, className, school, preferredLang, req.user.userId);

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.userId);
    res.json(formatUser(user));
});

router.delete("/history", requireAuth, (req, res) => {
    db.prepare("DELETE FROM submissions WHERE user_id = ?").run(req.user.userId);
    res.json({ ok: true });
});

module.exports = router;
