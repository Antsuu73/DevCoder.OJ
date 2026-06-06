const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// --- Lấy và lưu nhiệm vụ ---
router.get("/tasks", requireAuth, (req, res) => {
    const rows = db.prepare("SELECT task_id, completed FROM user_tasks WHERE user_id = ?").all(req.user.userId);
    res.json(rows);
});

router.post("/tasks/toggle", requireAuth, (req, res) => {
    const { taskId, completed } = req.body;
    db.prepare(`
        INSERT INTO user_tasks (user_id, task_id, completed, updated_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, task_id) DO UPDATE SET 
            completed = excluded.completed,
            updated_at = datetime('now')
    `).run(req.user.userId, taskId, completed ? 1 : 0);
    res.json({ ok: true });
});

// --- Lấy và lưu nháp code ---
router.get("/drafts/:problemId/:language", requireAuth, (req, res) => {
    const { problemId, language } = req.params;
    const row = db.prepare(`
        SELECT code FROM problem_drafts 
        WHERE user_id = ? AND problem_id = ? AND language = ?
    `).get(req.user.userId, problemId, language);
    res.json(row || { code: null });
});

router.post("/drafts", requireAuth, (req, res) => {
    const { problemId, language, code } = req.body;
    db.prepare(`
        INSERT INTO problem_drafts (user_id, problem_id, language, code, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, problem_id, language) DO UPDATE SET
            code = excluded.code,
            updated_at = datetime('now')
    `).run(req.user.userId, problemId, language, code);
    res.json({ ok: true });
});

module.exports = router;
