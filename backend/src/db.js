const { createClient } = require("@libsql/client");
const path = require("path");
const fs = require("fs");

const SCHEMA_SQL = `
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
        username TEXT UNIQUE,
        password_hash TEXT,
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_tasks (
        user_id TEXT NOT NULL,
        task_id TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, task_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS problem_drafts (
        user_id TEXT NOT NULL,
        problem_id TEXT NOT NULL,
        language TEXT NOT NULL,
        code TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        PRIMARY KEY (user_id, problem_id, language),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
    CREATE INDEX IF NOT EXISTS idx_test_cases_problem ON test_cases(problem_id);
`;

let client = null;
let initPromise = null;

function getDbUrl() {
    if (process.env.TURSO_DATABASE_URL) {
        return process.env.TURSO_DATABASE_URL;
    }

    const dataDir = process.env.DB_PATH
        ? path.dirname(process.env.DB_PATH)
        : path.join(__dirname, "..", "data");

    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = process.env.DB_PATH || path.join(dataDir, "oj.db");
    return `file:${dbPath}`;
}

async function initDb() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
        const url = getDbUrl();
        client = createClient({
            url,
            authToken: process.env.TURSO_AUTH_TOKEN
        });

        await client.execute("PRAGMA foreign_keys = ON");
        await client.executeMultiple(SCHEMA_SQL);

        const mode = process.env.TURSO_DATABASE_URL ? "Turso cloud" : "local file";
        console.log(`Database đã sẵn sàng (${mode})`);
    })();

    return initPromise;
}

async function get(sql, args = []) {
    const result = await client.execute({ sql, args });
    return result.rows[0] || null;
}

async function all(sql, args = []) {
    const result = await client.execute({ sql, args });
    return result.rows;
}

async function run(sql, args = []) {
    return client.execute({ sql, args });
}

async function batch(statements) {
    return client.batch(statements, "write");
}

module.exports = {
    initDb,
    get,
    all,
    run,
    batch
};
