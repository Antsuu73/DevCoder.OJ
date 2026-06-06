document.addEventListener("DOMContentLoaded", function () {
    if (api.isLoggedIn()) {
        window.location.href = "profile.html";
        return;
    }

    const form = document.getElementById("login-form");
    const errorEl = document.getElementById("login-error");
    const btn = document.getElementById("login-btn");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        errorEl.classList.add("d-none");
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang đăng nhập...';

        try {
            await api.login({
                username: document.getElementById("username").value,
                password: document.getElementById("password").value
            });
            window.location.href = "profile.html";
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove("d-none");
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-right-to-bracket me-1"></i> Đăng nhập';
        }
    });
});
