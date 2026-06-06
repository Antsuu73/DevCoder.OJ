const express = require("express");
const cors = require("cors");
const path = require("path");

require("./src/db");
require("./src/seed");

const problemsRouter = require("./src/routes/problems");
const submissionsRouter = require("./src/routes/submissions");
const authRouter = require("./src/routes/auth");
const healthRouter = require("./src/routes/health");

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = path.join(__dirname, "..");

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);

app.use("/api/problems", problemsRouter);
app.use("/api/submissions", submissionsRouter);

app.use(express.static(rootDir));

app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    const filePath = path.join(rootDir, req.path);
    if (req.path.endsWith(".html") || req.path === "/") {
        return res.sendFile(path.join(rootDir, req.path === "/" ? "index.html" : req.path));
    }
    next();
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
});

app.listen(PORT, () => {
    console.log(`DevCoder.OJ đang chạy tại http://localhost:${PORT}`);
});
