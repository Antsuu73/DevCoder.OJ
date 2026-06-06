// js/profile.js

document.addEventListener("DOMContentLoaded", function () {
    const displayName = document.getElementById("user-display-name");
    const displayUsername = document.getElementById("user-display-username");
    const displayClass = document.getElementById("user-display-class");
    const displaySchool = document.getElementById("user-display-school");
    const displayLang = document.getElementById("user-display-lang");
    const avatarInitials = document.getElementById("avatar-initials");
    const userRank = document.getElementById("user-rank");

    const inputName = document.getElementById("input-name");
    const inputClass = document.getElementById("input-class");
    const inputSchool = document.getElementById("input-school");
    const inputLang = document.getElementById("input-lang");

    const saveProfileBtn = document.getElementById("save-profile-btn");
    const clearHistoryBtn = document.getElementById("clear-history-btn");
    const btnLogin = document.getElementById("btn-login");
    const btnRegister = document.getElementById("btn-register");
    const btnEdit = document.getElementById("btn-edit");
    const btnLogout = document.getElementById("btn-logout");
    const guestPanel = document.getElementById("guest-panel");
    const loggedInPanel = document.getElementById("logged-in-panel");

    const statSubmissions = document.getElementById("stat-submissions");
    const statSolved = document.getElementById("stat-solved");
    const statAccuracy = document.getElementById("stat-accuracy");
    const submissionHistoryBody = document.getElementById("submission-history-body");

    function getInitials(name) {
        const parts = name.trim().split(" ");
        return parts.length ? parts[parts.length - 1].charAt(0).toUpperCase() : "U";
    }

    function updateRankDisplay(solvedCount) {
        userRank.className = "badge";
        userRank.style.backgroundColor = "";
        if (solvedCount <= 1) { userRank.innerText = "Newbie"; userRank.classList.add("bg-secondary"); }
        else if (solvedCount <= 3) { userRank.innerText = "Pupil"; userRank.style.backgroundColor = "#008000"; }
        else if (solvedCount <= 5) { userRank.innerText = "Specialist"; userRank.style.backgroundColor = "#03a89e"; }
        else { userRank.innerText = "Expert"; userRank.style.backgroundColor = "#aa00aa"; }
    }

    function formatDate(isoString) {
        const date = new Date(isoString.includes("T") ? isoString : isoString.replace(" ", "T") + "Z");
        return `${String(date.getHours()).padStart(2,"0")}:${String(date.getMinutes()).padStart(2,"0")}:${String(date.getSeconds()).padStart(2,"0")} - ${String(date.getDate()).padStart(2,"0")}/${String(date.getMonth()+1).padStart(2,"0")}/${date.getFullYear()}`;
    }

    function renderSubmissionTable(history) {
        if (!history.length) {
            submissionHistoryBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary">Chưa có lượt nộp bài nào. Hãy thử giải bài tập!</td></tr>`;
            return;
        }
        submissionHistoryBody.innerHTML = "";
        history.forEach(sub => {
            const badges = { AC: "bg-success", WA: "bg-danger", TLE: "bg-warning text-dark", CE: "bg-secondary", RE: "bg-danger" };
            const cls = badges[sub.status] || "bg-secondary";
            submissionHistoryBody.innerHTML += `
                <tr>
                    <td class="ps-3 text-muted" style="font-size:0.85rem">${formatDate(sub.time)}</td>
                    <td><a href="problem-detail.html?id=${sub.probId}" class="cf-link fw-semibold">${sub.probTitle}</a></td>
                    <td class="text-center font-mono">${sub.language}</td>
                    <td class="text-center"><span class="badge ${cls} font-mono">${sub.status}</span></td>
                    <td class="text-center font-mono text-muted pe-3">${sub.executionTime}</td>
                </tr>`;
        });
    }

    function showGuestView() {
        guestPanel?.classList.remove("d-none");
        loggedInPanel?.classList.add("d-none");
        btnEdit?.classList.add("d-none");
        btnLogout?.classList.add("d-none");
        clearHistoryBtn?.classList.add("d-none");
        statSubmissions.innerText = "0";
        statSolved.innerText = "0";
        statAccuracy.innerText = "0%";
        submissionHistoryBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-secondary"><i class="fa-solid fa-lock me-2"></i>Vui lòng đăng nhập để xem lịch sử nộp bài.</td></tr>`;
    }

    function showLoggedInView(profile, history) {
        guestPanel?.classList.add("d-none");
        loggedInPanel?.classList.remove("d-none");
        btnEdit?.classList.remove("d-none");
        btnLogout?.classList.remove("d-none");
        clearHistoryBtn?.classList.remove("d-none");

        displayName.innerText = profile.name;
        if (displayUsername) displayUsername.innerText = "@" + profile.username;
        displayClass.innerText = profile.class;
        displaySchool.innerText = profile.school;
        displayLang.innerText = profile.preferredLang;
        avatarInitials.innerText = getInitials(profile.name);
        avatarInitials.classList.remove("anonymous");

        inputName.value = profile.name;
        inputClass.value = profile.class;
        inputSchool.value = profile.school;
        inputLang.value = profile.preferredLang;

        statSubmissions.innerText = profile.totalSubmissions;
        statSolved.innerText = profile.solvedCount;
        statAccuracy.innerText = `${profile.accuracy}%`;
        updateRankDisplay(profile.solvedCount);
        renderSubmissionTable(history);
        localStorage.setItem("dcoj_user", JSON.stringify(profile));
    }

    async function initProfile() {
        if (!api.isLoggedIn()) {
            showGuestView();
            return;
        }
        try {
            const [profile, history] = await Promise.all([api.getMe(), api.getSubmissions()]);
            showLoggedInView(profile, history);
        } catch (err) {
            if (!api.isLoggedIn()) showGuestView();
            else submissionHistoryBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">${err.message}</td></tr>`;
        }
    }

    saveProfileBtn?.addEventListener("click", async function () {
        const name = inputName.value.trim();
        const clazz = inputClass.value.trim();
        const school = inputSchool.value.trim();
        const lang = inputLang.value;
        if (!name || !clazz || !school) { alert("Vui lòng điền đầy đủ thông tin!"); return; }

        try {
            await api.updateProfile({ name, class: clazz, school, preferredLang: lang });
            bootstrap.Modal.getInstance(document.getElementById("editProfileModal"))?.hide();
            initProfile();
        } catch (err) { alert("Lỗi: " + err.message); }
    });

    btnLogout?.addEventListener("click", function () {
        if (confirm("Bạn có chắc muốn đăng xuất?")) {
            api.logout();
            window.location.href = "login.html";
        }
    });

    clearHistoryBtn?.addEventListener("click", async function () {
        if (!confirm("Xóa toàn bộ lịch sử nộp bài?")) return;
        try { await api.clearHistory(); initProfile(); }
        catch (err) { alert("Lỗi: " + err.message); }
    });

    initProfile();
});
