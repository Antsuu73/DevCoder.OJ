const express = require("express");
const { execSync } = require("child_process");
const { RUNTIME } = require("../services/judge");
const db = require("../db");

const router = express.Router();

function hasCompiler(name, args = ["--version"]) {
    try {
        execSync(`${name} ${args.join(" ")}`, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

router.get("/", async (req, res) => {
    const problemCount = await db.get("SELECT COUNT(*) AS count FROM problems");
    const submissionCount = await db.get("SELECT COUNT(*) AS count FROM submissions");

    const hasGpp = hasCompiler("g++");
    const hasPython = hasCompiler("python") || hasCompiler("python3");

    res.json({
        status: "online",
        message: "DevCoder.OJ Backend đang hoạt động",
        runtime: {
            cpp: RUNTIME.cpp,
            python: RUNTIME.python
        },
        judgeReady: hasGpp && hasPython,
        database: process.env.TURSO_DATABASE_URL ? "turso-cloud" : "local-sqlite",
        stats: {
            problems: problemCount.count,
            submissions: submissionCount.count
        },
        sandbox: "Python 3.x & C++17"
    });
});

module.exports = router;
