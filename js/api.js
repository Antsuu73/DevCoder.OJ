// js/api.js — Client gọi Backend API + Auth

const API_BASE = (() => {
    const manualApi = localStorage.getItem("dcoj_api_url");
    if (manualApi) return manualApi;

    const configUrl = window.DCOJ_CONFIG?.productionApiUrl?.trim();
    if (configUrl) return configUrl.replace(/\/$/, "");

    if (window.location.protocol === "file:" || !window.location.origin || window.location.origin === "null") {
        return "http://localhost:3000";
    }

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal && window.location.port !== "3000") {
        return "http://localhost:3000";
    }

    return window.location.origin;
})();

const TOKEN_KEY = "dcoj_token";
const USER_KEY = "dcoj_user";

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function getStoredUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

function isLoggedIn() {
    return !!getToken();
}

function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

async function apiRequest(path, options = {}) {
    const headers = { "Content-Type": "application/json", ...options.headers };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) clearSession();
        throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
}

const api = {
    getToken,
    getStoredUser,
    isLoggedIn,
    setSession,
    clearSession,

    async getHealth() {
        return apiRequest("/api/health");
    },

    async register({ username, password, name, class: className, school, preferredLang }) {
        const data = await apiRequest("/api/auth/register", {
            method: "POST",
            body: JSON.stringify({ username, password, name, class: className, school, preferredLang })
        });
        setSession(data.token, data.user);
        return data;
    },

    async login({ username, password }) {
        const data = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password })
        });
        setSession(data.token, data.user);
        return data;
    },

    logout() {
        clearSession();
    },

    async getMe() {
        return apiRequest("/api/auth/me");
    },

    async updateProfile(profile) {
        const user = await apiRequest("/api/auth/profile", {
            method: "PUT",
            body: JSON.stringify(profile)
        });
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
    },

    async getProblems() {
        return apiRequest("/api/problems");
    },

    async getProblem(id) {
        return apiRequest(`/api/problems/${encodeURIComponent(id)}`);
    },

    async submitCode({ problemId, language, code, runSamplesOnly = false }) {
        return apiRequest("/api/submissions", {
            method: "POST",
            body: JSON.stringify({ problemId, language, code, runSamplesOnly })
        });
    },

    async getSubmissions() {
        return apiRequest("/api/submissions");
    },

    async getUserTasks() {
        return apiRequest("/api/users/tasks");
    },

    async toggleUserTask(taskId, completed) {
        return apiRequest("/api/users/tasks/toggle", {
            method: "POST",
            body: JSON.stringify({ taskId, completed })
        });
    },

    async getDraft(problemId, language) {
        return apiRequest(`/api/users/drafts/${encodeURIComponent(problemId)}/${encodeURIComponent(language)}`);
    },

    async saveDraft(problemId, language, code) {
        return apiRequest("/api/users/drafts", {
            method: "POST",
            body: JSON.stringify({ problemId, language, code })
        });
    },

    async clearHistory() {
        return apiRequest("/api/auth/history", { method: "DELETE" });
    }
};
