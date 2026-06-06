// js/main.js

document.addEventListener("DOMContentLoaded", async function () {
    const csesProblemBody = document.getElementById("cses-problem-body");

    if (csesProblemBody) {
        try {
            const currentProblems = await api.getProblems();
            csesProblemBody.innerHTML = "";

            currentProblems.forEach(prob => {
                let diffColor = "text-success";
                if (prob.difficulty === "Trung bình") diffColor = "text-warning";
                if (prob.difficulty === "Khó") diffColor = "text-danger";

                const rowHTML = `
                    <tr>
                        <td class="ps-3" style="width: 65%">
                            <a href="problem-detail.html?id=${prob.id}" class="cses-link fw-medium">
                                ${prob.title}
                            </a>
                        </td>
                        <td class="text-end text-muted font-mono" style="width: 20%; font-size: 0.85rem;">
                            <span class="${diffColor}">${prob.difficulty}</span>
                        </td>
                        <td class="text-end pe-3 text-muted font-mono" style="width: 15%; font-size: 0.85rem;">
                            ${prob.acceptedRate}
                        </td>
                    </tr>
                `;
                csesProblemBody.innerHTML += rowHTML;
            });
        } catch (err) {
            csesProblemBody.innerHTML = `
                <tr><td colspan="3" class="text-center text-danger py-3">
                    Không kết nối được backend. Hãy chạy <code>npm start</code> trong thư mục backend.
                </td></tr>
            `;
        }
    }

    const particlesContainer = document.getElementById("particles-container");
    if (particlesContainer) {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            createParticle(particlesContainer);
        }
    }
});

function createParticle(container) {
    const particle = document.createElement("div");
    particle.classList.add("particle");
    const size = Math.random() * 60 + 40;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}vw`;
    particle.style.top = `${Math.random() * 100}vh`;
    particle.style.opacity = Math.random() * 0.2 + 0.05;
    container.appendChild(particle);
    animateSingleParticle(particle);
}

function animateSingleParticle(particle) {
    const duration = Math.random() * 15000 + 10000;
    const targetX = (Math.random() - 0.5) * 150;
    const targetY = (Math.random() - 0.5) * 150;
    particle.animate([
        { transform: 'translate(0, 0)' },
        { transform: `translate(${targetX}px, ${targetY}px)` },
        { transform: 'translate(0, 0)' }
    ], { duration: duration, iterations: Infinity, easing: 'ease-in-out' });
}
