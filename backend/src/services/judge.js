const { spawn, execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");

const execFileAsync = promisify(execFile);

const RUNTIME = {
    cpp: process.env.CPP_COMPILER || "g++",
    python: process.env.PYTHON_BIN || "python"
};

// Tự động phát hiện python3 nếu python không tồn tại
const { execSync } = require("child_process");
try {
    if (!process.env.PYTHON_BIN) {
        try {
            execSync("python --version", { stdio: "ignore" });
        } catch (e) {
            execSync("python3 --version", { stdio: "ignore" });
            RUNTIME.python = "python3";
        }
    }
} catch (e) {
    console.warn("Cảnh báo: Không tìm thấy lệnh python hoặc python3 trên hệ thống!");
}

// Danh sách các từ khóa nguy hiểm cần chặn (Soft sandbox)
const DANGEROUS_KEYWORDS = {
    cpp: [
        "system(", "fork(", "vfork(", "exec(", "clone(", "socket(", 
        "chmod(", "chown(", "kill(", "pthread_", "fstream", "ofstream"
    ],
    python: [
        "os.system", "os.popen", "subprocess.", "pty.", "shutil.", 
        "socket.", "requests.", "urllib.", "builtins.open", "eval(", "exec(", 
        "open(", "write(", "__import__", "getattr", "setattr"
    ]
};

function securityCheck(code, language) {
    const keywords = DANGEROUS_KEYWORDS[language] || [];
    for (const kw of keywords) {
        if (code.includes(kw)) {
            return { ok: false, error: `Mã nguồn chứa từ khóa bị cấm vì lý do bảo mật: "${kw}"` };
        }
    }
    return { ok: true };
}

function normalizeOutput(text) {
    if (text == null) return "";
    return text
        .replace(/\r\n/g, "\n")
        .trim()
        .split("\n")
        .map((line) => line.trimEnd())
        .join("\n")
        .trim();
}

async function compileCpp(sourcePath, outputPath) {
    try {
        const { stderr } = await execFileAsync(
            RUNTIME.cpp,
            ["-std=c++17", "-O2", "-o", outputPath, sourcePath],
            { timeout: 15000, windowsHide: true }
        );
        return { ok: true, error: stderr?.trim() || null };
    } catch (err) {
        const message = err.stderr?.toString() || err.message || "Lỗi biên dịch không xác định";
        return { ok: false, error: message };
    }
}

function runWithStdin(command, args, input, timeLimitMs, cwd) {
    return new Promise((resolve) => {
        const child = spawn(command, args, { cwd, windowsHide: true });

        let stdout = "";
        let stderr = "";
        let killed = false;

        const timer = setTimeout(() => {
            killed = true;
            child.kill("SIGKILL");
        }, timeLimitMs);

        child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
        child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

        child.on("error", (err) => {
            clearTimeout(timer);
            resolve({ stdout, stderr: err.message, exitCode: -1, killed });
        });

        child.on("close", (code) => {
            clearTimeout(timer);
            resolve({ stdout, stderr, exitCode: code ?? -1, killed });
        });

        child.stdin.write(input);
        child.stdin.end();
    });
}

async function runTestCase(executable, input, timeLimitMs, language, workDir) {
    if (language === "cpp") {
        return runWithStdin(executable, [], input, timeLimitMs, workDir);
    }
    return runWithStdin(RUNTIME.python, [path.join(workDir, "main.py")], input, timeLimitMs, workDir);
}

async function judgeCode({ code, language, testCases, timeLimitMs }) {
    // 1. Kiểm tra bảo mật cơ bản
    const security = securityCheck(code, language);
    if (!security.ok) {
        return {
            status: "CE",
            compileError: security.error,
            passedTests: 0,
            totalTests: testCases.length,
            executionTimeMs: 0,
            testResults: []
        };
    }

    const workDir = path.join(os.tmpdir(), `dcoj-${uuidv4()}`);
    fs.mkdirSync(workDir, { recursive: true });

    const result = {
        status: "AC",
        passedTests: 0,
        totalTests: testCases.length,
        executionTimeMs: 0,
        testResults: [],
        failedTestIndex: null,
        failedInput: null,
        failedExpected: null,
        failedActual: null,
        compileError: null
    };

    try {
        let executable = null;

        if (language === "cpp") {
            const sourcePath = path.join(workDir, "main.cpp");
            const outputPath = path.join(workDir, process.platform === "win32" ? "main.exe" : "main");
            fs.writeFileSync(sourcePath, code, "utf8");

            const compiled = await compileCpp(sourcePath, outputPath);
            if (!compiled.ok) {
                result.status = "CE";
                result.compileError = compiled.error;
                return result;
            }
            executable = outputPath;
        } else if (language === "python") {
            const sourcePath = path.join(workDir, "main.py");
            fs.writeFileSync(sourcePath, code, "utf8");
        } else {
            result.status = "CE";
            result.compileError = `Ngôn ngữ không được hỗ trợ: ${language}`;
            return result;
        }

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const start = Date.now();
            const runResult = await runTestCase(
                executable,
                tc.input,
                timeLimitMs,
                language,
                workDir
            );
            const elapsed = Date.now() - start;
            result.executionTimeMs = Math.max(result.executionTimeMs, elapsed);

            const testStatus = { index: i + 1, status: "ac", timeMs: elapsed };

            if (runResult.killed) {
                testStatus.status = "tle";
                result.status = "TLE";
                result.failedTestIndex = i + 1;
                result.failedInput = tc.input;
                result.testResults.push(testStatus);
                break;
            }

            if (runResult.exitCode !== 0) {
                testStatus.status = "re";
                result.status = "RE";
                result.failedTestIndex = i + 1;
                result.failedInput = tc.input;
                result.failedActual = runResult.stderr || `Exit code: ${runResult.exitCode}`;
                result.testResults.push(testStatus);
                break;
            }

            const actual = normalizeOutput(runResult.stdout);
            const expected = normalizeOutput(tc.expected_output);

            if (actual !== expected) {
                testStatus.status = "wa";
                result.status = "WA";
                result.failedTestIndex = i + 1;
                result.failedInput = tc.input;
                result.failedExpected = expected;
                result.failedActual = actual || "(Không có đầu ra)";
                result.testResults.push(testStatus);
                break;
            }

            result.passedTests++;
            result.testResults.push(testStatus);
        }

        if (result.passedTests === testCases.length) {
            result.status = "AC";
        }
    } finally {
        try {
            fs.rmSync(workDir, { recursive: true, force: true });
        } catch {
            // ignore cleanup errors
        }
    }

    return result;
}

module.exports = { judgeCode, RUNTIME };
