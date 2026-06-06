const express = require("express");
const cors = require("cors");
const path = require("path");
const { execSync } = require("child_process");

const { initDb } = require("./src/db");
const { seedProblems } = require("./src/seed");

const problemsRouter = require("./src/routes/problems");
const submissionsRouter = require("./src/routes/submissions");
const authRouter = require("./src/routes/auth");
const healthRouter = require("./src/routes/health");
const usersRouter = require("./src/routes/users");

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = path.join(__dirname, "..");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/problems", problemsRouter);
app.use("/api/submissions", submissionsRouter);

app.use(express.static(rootDir));

app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    if (req.path.endsWith(".html") || req.path === "/") {
        return res.sendFile(path.join(rootDir, req.path === "/" ? "index.html" : req.path));
    }
    next();
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
});

function checkCompiler(name, args = ["--version"]) {
    try {
        execSync(`${name} ${args.join(" ")}`, { stdio: "ignore" });
        return true;
    } catch {
        return false;
    }
}

async function start() {
    await initDb();
    await seedProblems();

    const hasGpp = checkCompiler("g++");
    const hasPython = checkCompiler("python") || checkCompiler("python3");
    if (!hasGpp || !hasPython) {
        console.warn("Cảnh báo: Thiếu G++ hoặc Python — chức năng chấm bài có thể không hoạt động.");
    }

    app.listen(PORT, () => {
        console.log(`DevCoder.OJ đang chạy tại http://localhost:${PORT}`);
    });
}

start().catch((err) => {
    console.error("Không khởi động được server:", err);
    process.exit(1);
});

module.exports = app;
