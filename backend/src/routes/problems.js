const express = require("express");
const db = require("../db");

const router = express.Router();

function formatProblem(row) {
    return {
        id: row.id,
        title: row.title,
        difficulty: row.difficulty,
        acceptedRate: row.accepted_rate,
        description: row.description,
        timeLimit: `${(row.time_limit_ms / 1000).toFixed(1)}s`,
        memoryLimit: `${row.memory_limit_mb}MB`,
        timeLimitMs: row.time_limit_ms,
        memoryLimitMb: row.memory_limit_mb,
        inputSpec: row.input_spec,
        outputSpec: row.output_spec,
        sampleInput: row.sample_input,
        sampleOutput: row.sample_output
    };
}

router.get("/", (req, res) => {
    const rows = db.prepare("SELECT * FROM problems ORDER BY id").all();
    res.json(rows.map(formatProblem));
});

router.get("/:id", (req, res) => {
    const row = db.prepare("SELECT * FROM problems WHERE id = ?").get(req.params.id);
    if (!row) {
        return res.status(404).json({ error: "Không tìm thấy bài tập" });
    }
    res.json(formatProblem(row));
});

module.exports = router;
