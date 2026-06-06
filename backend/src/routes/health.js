const express = require("express");
const { RUNTIME } = require("../services/judge");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
    const problemCount = db.prepare("SELECT COUNT(*) AS count FROM problems").get();
    const submissionCount = db.prepare("SELECT COUNT(*) AS count FROM submissions").get();

    res.json({
        status: "online",
        message: "DevCoder.OJ Backend đang hoạt động",
        runtime: {
            cpp: RUNTIME.cpp,
            python: RUNTIME.python
        },
        stats: {
            problems: problemCount.count,
            submissions: submissionCount.count
        },
        sandbox: "Python 3.x & C++17"
    });
});

module.exports = router;
