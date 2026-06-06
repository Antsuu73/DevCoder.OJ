const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { judgeCode } = require("../services/judge");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
    const rows = await db.all(`
        SELECT s.*, p.title AS problem_title
        FROM submissions s
        JOIN problems p ON p.id = s.problem_id
        WHERE s.user_id = ?
        ORDER BY s.created_at DESC
        LIMIT 100
    `, [req.user.userId]);

    res.json(rows.map((row) => ({
        id: row.id,
        time: row.created_at,
        probId: row.problem_id,
        probTitle: row.problem_title,
        language: row.language === "cpp" ? "C++" : "Python",
        status: row.status,
        executionTime: row.execution_time_ms != null
            ? `${(row.execution_time_ms / 1000).toFixed(2)}s`
            : "--",
        passedTests: row.passed_tests,
        totalTests: row.total_tests
    })));
});

router.post("/", requireAuth, async (req, res) => {
    const { problemId, language, code, runSamplesOnly } = req.body;
    const userId = req.user.userId;

    if (!problemId || !language || !code?.trim()) {
        return res.status(400).json({ error: "Thiếu thông tin bắt buộc (problemId, language, code)" });
    }

    if (!["cpp", "python"].includes(language)) {
        return res.status(400).json({ error: "Ngôn ngữ phải là cpp hoặc python" });
    }

    const problem = await db.get("SELECT * FROM problems WHERE id = ?", [problemId]);
    if (!problem) {
        return res.status(404).json({ error: "Không tìm thấy bài tập" });
    }

    let testQuery = `
        SELECT input, expected_output, is_sample, order_index
        FROM test_cases WHERE problem_id = ?
    `;
    const testArgs = [problemId];
    if (runSamplesOnly) testQuery += " AND is_sample = 1";
    testQuery += " ORDER BY order_index";

    const testCases = await db.all(testQuery, testArgs);
    if (testCases.length === 0) {
        return res.status(400).json({ error: "Bài tập chưa có test case" });
    }

    try {
        const judgeResult = await judgeCode({
            code,
            language,
            testCases,
            timeLimitMs: problem.time_limit_ms
        });

        const submissionId = uuidv4();
        try {
            await db.run(`
                INSERT INTO submissions
                (id, user_id, problem_id, language, code, status, execution_time_ms,
                 passed_tests, total_tests, failed_test_index, failed_input,
                 failed_expected, failed_actual, compile_error)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                submissionId, userId, problemId, language, code,
                judgeResult.status, judgeResult.executionTimeMs,
                judgeResult.passedTests, judgeResult.totalTests,
                judgeResult.failedTestIndex, judgeResult.failedInput,
                judgeResult.failedExpected, judgeResult.failedActual,
                judgeResult.compileError
            ]);
        } catch (dbErr) {
            console.error("Database Insert Error:", dbErr);
            throw new Error("Lỗi khi lưu kết quả vào database: " + dbErr.message);
        }

        res.json({
            id: submissionId,
            status: judgeResult.status,
            passedTests: judgeResult.passedTests,
            totalTests: judgeResult.totalTests,
            executionTimeMs: judgeResult.executionTimeMs,
            testResults: judgeResult.testResults,
            failedTestIndex: judgeResult.failedTestIndex,
            failedInput: judgeResult.failedInput,
            failedExpected: judgeResult.failedExpected,
            failedActual: judgeResult.failedActual,
            compileError: judgeResult.compileError
        });
    } catch (err) {
        console.error("Judge error detail:", err);
        res.status(500).json({ error: "Lỗi hệ thống khi chấm bài: " + err.message });
    }
});

module.exports = router;
