const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

async function getUserStats(userId) {
    const submissions = await db.all("SELECT status FROM submissions WHERE user_id = ?", [userId]);
    const solved = await db.get(`
        SELECT COUNT(DISTINCT problem_id) AS count
        FROM submissions WHERE user_id = ? AND status = 'AC'
    `, [userId]);

    const totalSubmissions = submissions.length;
    const acCount = submissions.filter((s) => s.status === "AC").length;
    const accuracy = totalSubmissions > 0 ? Math.round((acCount / totalSubmissions) * 100) : 0;

    return { totalSubmissions, solvedCount: solved?.count || 0, accuracy };
}

async function formatUser(user) {
    const stats = await getUserStats(user.id);
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

router.post("/register", async (req, res) => {
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

    const existing = await db.get("SELECT id FROM users WHERE username = ?", [cleanUsername]);
    if (existing) {
        return res.status(409).json({ error: "Tên đăng nhập đã tồn tại" });
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    await db.run(`
        INSERT INTO users (id, username, password_hash, name, class_name, school, preferred_lang)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        id,
        cleanUsername,
        passwordHash,
        name.trim(),
        className.trim(),
        school.trim(),
        preferredLang || "C++ (GCC 17)"
    ]);

    const user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
    const token = signToken(user);

    res.status(201).json({ token, user: await formatUser(user) });
});

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username?.trim() || !password) {
        return res.status(400).json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu" });
    }

    const user = await db.get("SELECT * FROM users WHERE username = ?", [username.trim().toLowerCase()]);
    if (!user || !user.password_hash) {
        return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    if (!bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    const token = signToken(user);
    res.json({ token, user: await formatUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.user.userId]);
    if (!user) {
        return res.status(404).json({ error: "Không tìm thấy tài khoản" });
    }
    res.json(await formatUser(user));
});

router.put("/profile", requireAuth, async (req, res) => {
    const { name, class: className, school, preferredLang } = req.body;

    await db.run(`
        UPDATE users
        SET name = COALESCE(?, name),
            class_name = COALESCE(?, class_name),
            school = COALESCE(?, school),
            preferred_lang = COALESCE(?, preferred_lang)
        WHERE id = ?
    `, [name, className, school, preferredLang, req.user.userId]);

    const user = await db.get("SELECT * FROM users WHERE id = ?", [req.user.userId]);
    res.json(await formatUser(user));
});

router.delete("/history", requireAuth, async (req, res) => {
    await db.run("DELETE FROM submissions WHERE user_id = ?", [req.user.userId]);
    res.json({ ok: true });
});

const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/google", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Thiếu Google Token" });

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;

        let user = await db.get("SELECT * FROM users WHERE username = ?", [email]);

        if (!user) {
            const id = uuidv4();
            await db.run(`
                INSERT INTO users (id, username, name, class_name, school, preferred_lang)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [id, email, name, "Học sinh Google", "Online", "C++ (GCC 17)"]);
            user = await db.get("SELECT * FROM users WHERE id = ?", [id]);
        }

        const jwtToken = signToken(user);
        res.json({ token: jwtToken, user: await formatUser(user) });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(400).json({ error: "Xác thực Google thất bại" });
    }
});

module.exports = router;
