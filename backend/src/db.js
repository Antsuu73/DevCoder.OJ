const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "oj.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
    CREATE TABLE IF NOT EXISTS problems (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        accepted_rate TEXT DEFAULT '0%',
        description TEXT NOT NULL,
        time_limit_ms INTEGER NOT NULL DEFAULT 1000,
        memory_limit_mb INTEGER NOT NULL DEFAULT 256,
        input_spec TEXT NOT NULL,
        output_spec TEXT NOT NULL,
        sample_input TEXT NOT NULL,
        sample_output TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS test_cases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        problem_id TEXT NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        is_sample INTEGER NOT NULL DEFAULT 0,
        order_index INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'Nguyễn Văn A',
        class_name TEXT NOT NULL DEFAULT 'Lớp 9/11',
        school TEXT NOT NULL DEFAULT 'THCS Lê Tấn Bê',
        preferred_lang TEXT NOT NULL DEFAULT 'C++ (GCC 17)',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        problem_id TEXT NOT NULL,
        language TEXT NOT NULL,
        code TEXT NOT NULL,
        status TEXT NOT NULL,
        execution_time_ms INTEGER,
        passed_tests INTEGER DEFAULT 0,
        total_tests INTEGER DEFAULT 0,
        failed_test_index INTEGER,
        failed_input TEXT,
        failed_expected TEXT,
        failed_actual TEXT,
        compile_error TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (problem_id) REFERENCES problems(id)
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
    CREATE INDEX IF NOT EXISTS idx_test_cases_problem ON test_cases(problem_id);
`);

// Migration: thêm cột auth cho users (tương thích DB cũ)
const userColumns = db.prepare("PRAGMA table_info(users)").all().map((c) => c.name);
if (!userColumns.includes("username")) {
    db.exec("ALTER TABLE users ADD COLUMN username TEXT");
}
if (!userColumns.includes("password_hash")) {
    db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
}
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL");

module.exports = db;
