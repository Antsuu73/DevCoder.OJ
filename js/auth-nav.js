// js/auth-nav.js — Cập nhật navbar theo trạng thái đăng nhập

document.addEventListener("DOMContentLoaded", function () {
    const slot = document.getElementById("auth-nav");
    if (!slot) return;

    if (api.isLoggedIn()) {
        const user = api.getStoredUser();
        const name = user?.name || user?.username || "User";
        slot.innerHTML = `
            <span class="text-muted text-sm me-2 d-none d-md-inline">
                <i class="fa-solid fa-user-check text-success me-1"></i>${name}
            </span>
            <a class="profile-btn px-3 py-2 border border-secondary me-1" href="profile.html">
                <i class="fa-regular fa-user me-1"></i>Hồ sơ
            </a>
            <button id="nav-logout-btn" class="btn btn-outline-danger btn-sm px-3 py-2">
                <i class="fa-solid fa-right-from-bracket"></i>
            </button>
        `;
        document.getElementById("nav-logout-btn")?.addEventListener("click", () => {
            api.logout();
            window.location.href = "login.html";
        });
    } else {
        slot.innerHTML = `
            <a class="btn btn-outline-primary btn-sm px-3 py-2 me-1" href="login.html">
                <i class="fa-solid fa-right-to-bracket me-1"></i>Đăng nhập
            </a>
            <a class="btn btn-primary btn-sm px-3 py-2" href="register.html">
                <i class="fa-solid fa-user-plus me-1"></i>Đăng ký
            </a>
        `;
    }
});
