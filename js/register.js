document.addEventListener("DOMContentLoaded", function () {
    if (api.isLoggedIn()) {
        window.location.href = "profile.html";
        return;
    }

    const form = document.getElementById("register-form");
    const errorEl = document.getElementById("register-error");
    const btn = document.getElementById("register-btn");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        errorEl.classList.add("d-none");
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang tạo tài khoản...';

        try {
            await api.register({
                username: document.getElementById("username").value,
                password: document.getElementById("password").value,
                name: document.getElementById("name").value,
                class: document.getElementById("class").value,
                school: document.getElementById("school").value,
                preferredLang: document.getElementById("lang").value
            });
            window.location.href = "profile.html";
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.classList.remove("d-none");
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-user-plus me-1"></i> Tạo tài khoản';
        }
    });
});
