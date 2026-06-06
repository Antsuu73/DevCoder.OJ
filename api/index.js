const express = require("express");
const cors = require("cors");
const path = require("path");

// Fix paths for Vercel deployment
const srcPath = path.join(__dirname, "..", "backend", "src");
require(path.join(srcPath, "db"));
require(path.join(srcPath, "seed"));

const problemsRouter = require(path.join(srcPath, "routes", "problems"));
const submissionsRouter = require(path.join(srcPath, "routes", "submissions"));
const authRouter = require(path.join(srcPath, "routes", "auth"));
const healthRouter = require(path.join(srcPath, "routes", "health"));

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/problems", problemsRouter);
app.use("/api/submissions", submissionsRouter);

// Export for Vercel
module.exports = app;

// Only listen if not running on Vercel
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}
