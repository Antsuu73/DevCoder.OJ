// js/problem.js

let editorInstance = null;
let currentProblem = null;

const boilerplates = {
    cpp: {
        AB_SUM: `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    long long a, b;\n    if (cin >> a >> b) {\n        cout << a + b << endl;\n    }\n    return 0;\n}`,
        PRIME_CHECK: `#include <iostream>\n#include <cmath>\n\nusing namespace std;\n\nbool isPrime(long long n) {\n    if (n < 2) return false;\n    for (long long i = 2; i <= sqrt(n); i++) {\n        if (n % i == 0) return false;\n    }\n    return true;\n}\n\nint main() {\n    long long n;\n    if (cin >> n) {\n        if (isPrime(n)) cout << "YES" << endl;\n        else cout << "NO" << endl;\n    }\n    return 0;\n}`,
        default: `#include <iostream>\n\nusing namespace std;\n\nint main() {\n    // Viết mã nguồn C++ của bạn ở đây\n    \n    return 0;\n}`
    },
    python: {
        AB_SUM: `# Đọc hai số a và b từ bàn phím\na, b = map(int, input().split())\nprint(a + b)`,
        PRIME_CHECK: `import math\n\ndef is_prime(n):\n    if n < 2:\n        return False\n    for i in range(2, int(math.isqrt(n)) + 1):\n        if n % i == 0:\n            return False\n    return True\n\nn = int(input())\nif is_prime(n):\n    print("YES")\nelse:\n    print("NO")`,
        default: `# Viết mã nguồn Python 3 của bạn ở đây\n# Ví dụ:\n# n = int(input())\n# print(n)`
    }
};

function getEditorMode(lang) {
    return lang === "cpp" ? "ace/mode/c_cpp" : "ace/mode/python";
}

function initCodeEditor(lang, problemId) {
    if (typeof ace === "undefined") {
        throw new Error("Không tải được trình soạn thảo code");
    }

    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode(getEditorMode(lang));
    editor.setOptions({
        fontSize: "14px",
        fontFamily: "JetBrains Mono, Courier New, monospace",
        showPrintMargin: false,
        tabSize: 4,
        useSoftTabs: true,
        wrap: false
    });
    editor.setValue(getBoilerplate(lang, problemId), -1);
    editor.clearSelection();
    editor.resize();
    return editor;
}

document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const problemId = urlParams.get("id") || "AB_SUM";

    try {
        currentProblem = await api.getProblem(problemId);
    } catch (err) {
        document.getElementById("problem-title").innerText = "Không tìm thấy bài tập";
        document.getElementById("problem-desc").innerText = err.message || "Bài tập không tồn tại hoặc backend chưa chạy.";
        return;
    }

    document.title = `${currentProblem.title} - DevCoder.OJ`;
    document.getElementById("problem-title").innerHTML = `<i class="fa-solid fa-code text-primary me-2"></i>${currentProblem.id} - ${currentProblem.title}`;
    document.getElementById("time-limit").innerText = currentProblem.timeLimit;
    document.getElementById("memory-limit").innerText = currentProblem.memoryLimit;
    document.getElementById("problem-desc").innerText = currentProblem.description;
    document.getElementById("problem-input-spec").innerText = currentProblem.inputSpec;
    document.getElementById("problem-output-spec").innerText = currentProblem.outputSpec;
    document.getElementById("sample-input-content").innerText = currentProblem.sampleInput;
    document.getElementById("sample-output-content").innerText = currentProblem.sampleOutput;

    try {
        editorInstance = initCodeEditor("cpp", currentProblem.id);

        if (api.isLoggedIn()) {
            api.getDraft(currentProblem.id, "cpp").then(res => {
                if (res?.code && editorInstance) {
                    editorInstance.setValue(res.code, -1);
                    editorInstance.clearSelection();
                }
            }).catch(() => {});
        }

        let saveTimeout;
        editorInstance.getSession().on("change", () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                if (api.isLoggedIn() && editorInstance) {
                    const code = editorInstance.getValue();
                    const language = document.getElementById("language-select").value;
                    await api.saveDraft(currentProblem.id, language, code);
                }
            }, 2000);
        });
    } catch (err) {
        const editorEl = document.getElementById("editor");
        if (editorEl) {
            editorEl.innerHTML = `<div class="alert alert-danger m-3">Không tải được trình soạn thảo code: ${escapeHtml(err.message)}</div>`;
        }
    }

    const langSelect = document.getElementById("language-select");
    langSelect.addEventListener("change", async function () {
        const lang = langSelect.value;
        if (!editorInstance) return;

        if (api.isLoggedIn()) {
            const res = await api.getDraft(currentProblem.id, lang);
            if (res?.code) {
                editorInstance.setValue(res.code, -1);
            } else {
                editorInstance.setValue(getBoilerplate(lang, currentProblem.id), -1);
            }
        } else {
            editorInstance.setValue(getBoilerplate(lang, currentProblem.id), -1);
        }

        editorInstance.getSession().setMode(getEditorMode(lang));
        editorInstance.clearSelection();
    });

    document.getElementById("submit-btn").addEventListener("click", () => handleSubmit(false));
    document.getElementById("run-btn").addEventListener("click", () => handleSubmit(true));
});

function getBoilerplate(lang, problemId) {
    if (boilerplates[lang][problemId]) {
        return boilerplates[lang][problemId];
    }
    return boilerplates[lang].default;
}

async function handleSubmit(runSamplesOnly) {
    if (!editorInstance || !currentProblem) return;

    const code = editorInstance.getValue();
    const language = document.getElementById("language-select").value;

    if (code.trim() === "") {
        alert(runSamplesOnly ? "Vui lòng viết code trước khi chạy thử!" : "Vui lòng viết code trước khi nộp bài!");
        return;
    }

    if (!api.isLoggedIn()) {
        if (confirm("Bạn cần đăng nhập để nộp/chạy thử bài. Chuyển đến trang đăng nhập?")) {
            window.location.href = "login.html";
        }
        return;
    }

    showJudgingUI(language, runSamplesOnly);

    try {
        const result = await api.submitCode({
            problemId: currentProblem.id,
            language,
            code,
            runSamplesOnly
        });
        displayJudgeResult(result, runSamplesOnly);
    } catch (err) {
        showJudgeError(err.message);
    }
}

function showJudgingUI(language, isRunOnly) {
    const resultPanel = document.getElementById("judge-result-panel");
    const overallStatus = document.getElementById("overall-status");
    const testcasesList = document.getElementById("testcases-list");
    const judgeDetails = document.getElementById("judge-details");

    resultPanel.classList.remove("d-none");
    judgeDetails.classList.add("d-none");
    resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });

    overallStatus.className = "alert alert-info py-2 px-3 fw-bold mb-3 d-flex align-items-center justify-content-between";
    overallStatus.innerHTML = `
        <span><i class="fa-solid fa-gear fa-spin me-2"></i>Đang chấm trên server (${language === "cpp" ? "G++" : "Python"})...</span>
        <div class="spinner-border spinner-border-sm text-info" role="status"></div>
    `;

    testcasesList.innerHTML = `<span class="text-muted text-sm">Đang chờ kết quả từ máy chủ...</span>`;
}

function displayJudgeResult(result, isRunOnly) {
    const overallStatus = document.getElementById("overall-status");
    const testcasesList = document.getElementById("testcases-list");
    const judgeDetails = document.getElementById("judge-details");

    testcasesList.innerHTML = "";
    (result.testResults || []).forEach(tc => {
        const pill = document.createElement("span");
        pill.className = `testcase-pill testcase-${tc.status}`;
        pill.innerText = tc.index;
        pill.title = `Test ${tc.index}: ${tc.status.toUpperCase()} (${tc.timeMs}ms)`;
        testcasesList.appendChild(pill);
    });

    judgeDetails.classList.remove("d-none");

    if (result.status === "AC") {
        overallStatus.className = "alert alert-success py-2 px-3 fw-bold mb-3 d-flex align-items-center justify-content-between";
        overallStatus.innerHTML = `
            <span><i class="fa-solid fa-circle-check me-2"></i>ACCEPTED (${result.passedTests}/${result.totalTests} testcases)</span>
            <span class="badge bg-success font-mono"><i class="fa-solid fa-check"></i> AC</span>
        `;
        judgeDetails.innerHTML = `<div class="text-success"><i class="fa-solid fa-check-double me-1"></i> Chúc mừng! Mã nguồn đã vượt qua ${isRunOnly ? "các test mẫu" : "toàn bộ testcase"}.</div>`;
    } else if (result.status === "CE") {
        overallStatus.className = "alert alert-secondary py-2 px-3 fw-bold mb-3 d-flex align-items-center justify-content-between";
        overallStatus.innerHTML = `
            <span><i class="fa-solid fa-code me-2"></i>COMPILE ERROR</span>
            <span class="badge bg-secondary font-mono">CE</span>
        `;
        judgeDetails.innerHTML = `<pre class="bg-light p-2 rounded border text-xs mb-0" style="white-space: pre-wrap;">${escapeHtml(result.compileError || "Lỗi biên dịch")}</pre>`;
    } else if (result.status === "WA") {
        overallStatus.className = "alert alert-danger py-2 px-3 fw-bold mb-3 d-flex align-items-center justify-content-between";
        overallStatus.innerHTML = `
            <span><i class="fa-solid fa-circle-xmark me-2"></i>WRONG ANSWER (Test #${result.failedTestIndex})</span>
            <span class="badge bg-danger font-mono">WA</span>
        `;
        judgeDetails.innerHTML = `
            <div class="text-danger mb-1"><i class="fa-solid fa-circle-exclamation me-1"></i> Sai ở Test Case #${result.failedTestIndex}:</div>
            <div class="bg-light p-2 rounded border font-mono text-xs">
                <strong>Input:</strong> ${escapeHtml(result.failedInput || "")}<br>
                <strong>Đầu ra mong đợi:</strong> ${escapeHtml(result.failedExpected || "")}<br>
                <strong>Đầu ra của bạn:</strong> ${escapeHtml(result.failedActual || "")}
            </div>
        `;
    } else if (result.status === "TLE") {
        overallStatus.className = "alert alert-warning py-2 px-3 fw-bold mb-3 d-flex align-items-center justify-content-between";
        overallStatus.innerHTML = `
            <span><i class="fa-solid fa-clock me-2"></i>TIME LIMIT EXCEEDED (Test #${result.failedTestIndex})</span>
            <span class="badge bg-warning text-dark font-mono">TLE</span>
        `;
        judgeDetails.innerHTML = `<div class="text-warning">Chương trình chạy quá giới hạn thời gian tại testcase #${result.failedTestIndex}.</div>`;
    } else if (result.status === "RE") {
        overallStatus.className = "alert alert-danger py-2 px-3 fw-bold mb-3 d-flex align-items-center justify-content-between";
        overallStatus.innerHTML = `
            <span><i class="fa-solid fa-bug me-2"></i>RUNTIME ERROR (Test #${result.failedTestIndex})</span>
            <span class="badge bg-danger font-mono">RE</span>
        `;
        judgeDetails.innerHTML = `<pre class="bg-light p-2 rounded border text-xs mb-0" style="white-space: pre-wrap;">${escapeHtml(result.failedActual || "Lỗi runtime")}</pre>`;
    }
}

function showJudgeError(message) {
    const overallStatus = document.getElementById("overall-status");
    const judgeDetails = document.getElementById("judge-details");

    overallStatus.className = "alert alert-danger py-2 px-3 fw-bold mb-3";
    overallStatus.innerHTML = `<span><i class="fa-solid fa-triangle-exclamation me-2"></i>Lỗi kết nối backend</span>`;
    judgeDetails.classList.remove("d-none");
    judgeDetails.innerHTML = `<div class="text-danger">${escapeHtml(message)}. Hãy chạy <code>npm start</code> trong thư mục backend.</div>`;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
