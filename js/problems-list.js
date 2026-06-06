// js/problems-list.js

document.addEventListener("DOMContentLoaded", async function () {
    const problemsListBody = document.getElementById("problems-list-body");
    const searchInput = document.getElementById("search-input");
    const noProblemsAlert = document.getElementById("no-problems-alert");
    const difficultyButtons = document.querySelectorAll(".difficulty-btn");

    let allProblems = [];
    let activeDifficulty = "all";
    let searchQuery = "";

    try {
        allProblems = await api.getProblems();
    } catch (err) {
        problemsListBody.innerHTML = `
            <tr><td colspan="4" class="text-center text-danger py-4">
                Không kết nối được backend. Hãy chạy server trước.
            </td></tr>
        `;
        return;
    }

    function renderProblems() {
        problemsListBody.innerHTML = "";

        const filteredProblems = allProblems.filter(prob => {
            const matchesSearch = prob.title.toLowerCase().includes(searchQuery) ||
                                  prob.id.toLowerCase().includes(searchQuery);
            const matchesDifficulty = activeDifficulty === "all" || prob.difficulty === activeDifficulty;
            return matchesSearch && matchesDifficulty;
        });

        if (filteredProblems.length === 0) {
            noProblemsAlert.classList.remove("d-none");
        } else {
            noProblemsAlert.classList.add("d-none");
        }

        filteredProblems.forEach(prob => {
            let diffClass = "diff-easy";
            if (prob.difficulty === "Trung bình") diffClass = "diff-medium";
            if (prob.difficulty === "Khó") diffClass = "diff-hard";

            const rowHTML = `
                <tr>
                    <td class="ps-3 font-mono fw-semibold text-secondary">${prob.id}</td>
                    <td>
                        <a href="problem-detail.html?id=${prob.id}" class="cf-link fw-medium">
                            ${prob.title}
                        </a>
                    </td>
                    <td class="text-center font-mono">
                        <span class="${diffClass} fw-bold">${prob.difficulty}</span>
                    </td>
                    <td class="text-center font-mono text-muted">${prob.acceptedRate}</td>
                </tr>
            `;
            problemsListBody.innerHTML += rowHTML;
        });
    }

    searchInput.addEventListener("input", function () {
        searchQuery = this.value.toLowerCase().trim();
        renderProblems();
    });

    difficultyButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            difficultyButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");
            activeDifficulty = this.dataset.difficulty;
            renderProblems();
        });
    });

    renderProblems();
});
