// js/tasks.js

// 1. DANH SÁCH NHIỆM VỤ MẶC ĐỊNH
const defaultTasks = {
    daily: [
        { id: "d1", title: "Giải quyết ít nhất 1 bài tập", desc: "Nộp bài thành công (AC) 1 bài bất kỳ trong kho bài.", exp: "+10 EXP" },
        { id: "d2", title: "Tra cứu 1 thuật toán trong Wiki", desc: "Mở đọc tài liệu kiến thức trên trang Wiki thuật toán.", exp: "+5 EXP" },
        { id: "d3", title: "Kiểm tra lỗi hệ thống", desc: "Xem trạng thái máy chủ trong thẻ Information ở trang chủ.", exp: "+5 EXP" }
    ],
    weekly: [
        { id: "w1", title: "Giải quyết bài toán Số Nguyên Tố", desc: "Giải bài PRIME_CHECK trên IDE với thuật toán tối ưu O(sqrt(N)).", exp: "+50 EXP" },
        { id: "w2", title: "Đọc thảo luận trên diễn đàn", desc: "Mở đọc bài viết về mẹo lập trình Ubuntu song song Windows.", exp: "+20 EXP" },
        { id: "w3", title: "Giải quyết 3 bài tập khác nhau", desc: "Đạt Accepted trên 3 bài tập bất kỳ trong tuần này.", exp: "+40 EXP" }
    ],
    monthly: [
        { id: "m1", title: "Hoàn thành chuyên đề Số học", desc: "Giải quyết thành công cả 3 bài: A+B, Số Nguyên Tố và UCLN.", exp: "+150 EXP" },
        { id: "m2", title: "Đạt tỷ lệ AC trên 70%", desc: "Tỷ lệ làm bài chính xác trung bình trên hồ sơ cá nhân đạt trên 70%.", exp: "+100 EXP" },
        { id: "m3", title: "Luyện tập bài toán Khó", desc: "Giải quyết thành công bài LIS (Dãy con tăng dài nhất).", exp: "+200 EXP" }
    ]
};

let userTaskStatus = {};

document.addEventListener("DOMContentLoaded", async function () {
    if (api.isLoggedIn()) {
        try {
            const tasks = await api.getUserTasks();
            tasks.forEach(t => {
                userTaskStatus[t.task_id] = t.completed === 1;
            });
        } catch (err) {
            console.error("Lỗi khi tải nhiệm vụ từ server:", err);
        }
    }

    // Tải các nhiệm vụ lên giao diện
    loadTasks();
    
    // Khởi chạy đếm ngược thời gian reset và cập nhật thanh tiến trình (timeline)
    updateTimers();
    setInterval(updateTimers, 1000);
});

// 2. HÀM TẢI NHIỆM VỤ LÊN GIAO DIỆN
function loadTasks() {
    const categories = ["daily", "weekly", "monthly"];
    
    categories.forEach(cat => {
        const container = document.getElementById(`${cat}-tasks-list`);
        if (!container) return;
        
        container.innerHTML = "";
        const tasks = defaultTasks[cat];
        
        tasks.forEach(task => {
            // Ưu tiên trạng thái từ server, nếu không có thì dùng localStorage (tương thích ngược)
            let isCompleted = userTaskStatus[task.id];
            if (isCompleted === undefined) {
                isCompleted = localStorage.getItem(`task_${task.id}`) === "true";
            }
            
            const taskHTML = `
                <div class="task-item ${isCompleted ? 'task-checked' : ''}" id="task-container-${task.id}">
                    <input type="checkbox" class="task-checkbox" id="chk-${task.id}" ${isCompleted ? 'checked' : ''} onchange="toggleTask('${task.id}')">
                    <div class="task-content">
                        <div class="task-title">${task.title}</div>
                        <div class="task-desc">${task.desc}</div>
                    </div>
                    <div class="d-flex flex-column align-items-end justify-content-between gap-1">
                        <span class="badge bg-secondary text-xs">${task.exp}</span>
                        <span class="task-checked-status"><i class="fa-solid fa-circle-check"></i> Đã xong</span>
                    </div>
                </div>
            `;
            container.innerHTML += taskHTML;
        });
    });
}

// 3. HÀM XỬ LÝ CLICK TÍCH CHỌN HOÀN THÀNH
async function toggleTask(taskId) {
    const checkbox = document.getElementById(`chk-${taskId}`);
    const container = document.getElementById(`task-container-${taskId}`);
    
    if (checkbox && container) {
        const isChecked = checkbox.checked;
        
        if (isChecked) {
            container.classList.add("task-checked");
        } else {
            container.classList.remove("task-checked");
        }

        // Lưu vào localStorage cho khách
        localStorage.setItem(`task_${taskId}`, isChecked ? "true" : "false");

        // Lưu vào server nếu đã đăng nhập
        if (api.isLoggedIn()) {
            try {
                await api.toggleUserTask(taskId, isChecked);
                userTaskStatus[taskId] = isChecked;
            } catch (err) {
                console.error("Lỗi khi lưu nhiệm vụ:", err);
            }
        }
    }
}

// 4. HÀM TÍNH TOÁN VÀ HIỂN THỊ ĐẾM NGƯỢC THỜI GIAN RESET + TIMELINE BARS
function updateTimers() {
    const now = new Date();
    
    // --- A. ĐẾM NGƯỢC HÀNG NGÀY (RESET VÀO 23:59:59 HÔM NAY) ---
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const dailyDiff = endOfDay - now;
    
    if (dailyDiff > 0) {
        const hours = Math.floor((dailyDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((dailyDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((dailyDiff / 1000) % 60);
        
        document.getElementById("daily-timer").innerText = 
            `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Tính tỷ lệ phần trăm thời gian còn lại trong ngày (để làm chiều rộng timeline bar)
        const dayProgress = (dailyDiff / (24 * 60 * 60 * 1000)) * 100;
        document.getElementById("daily-progress").style.width = `${dayProgress}%`;
    }

    // --- B. ĐẾM NGƯỢC HÀNG TUẦN (RESET VÀO 23:59:59 CHỦ NHẬT) ---
    const currentDay = now.getDay(); // 0: Chủ Nhật, 1: Thứ 2...
    const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
    const endOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, 23, 59, 59, 999);
    const weeklyDiff = endOfWeek - now;
    
    if (weeklyDiff > 0) {
        const days = Math.floor(weeklyDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((weeklyDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((weeklyDiff / (1000 * 60)) % 60);
        
        document.getElementById("weekly-timer").innerText = `${days}d ${hours}h ${minutes}m`;
        
        // Tính tỷ lệ phần trăm thời gian còn lại trong tuần
        const weekProgress = (weeklyDiff / (7 * 24 * 60 * 60 * 1000)) * 100;
        document.getElementById("weekly-progress").style.width = `${weekProgress}%`;
    }

    // --- C. ĐẾM NGƯỢC HÀNG THÁNG (RESET VÀO 23:59:59 NGÀY CUỐI THÁNG) ---
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth(), lastDayOfMonth, 23, 59, 59, 999);
    const monthlyDiff = endOfMonth - now;
    
    if (monthlyDiff > 0) {
        const days = Math.floor(monthlyDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((monthlyDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((monthlyDiff / (1000 * 60)) % 60);
        
        document.getElementById("monthly-timer").innerText = `${days}d ${hours}h ${minutes}m`;
        
        // Tính tỷ lệ phần trăm thời gian còn lại trong tháng
        const monthProgress = (monthlyDiff / (lastDayOfMonth * 24 * 60 * 60 * 1000)) * 100;
        document.getElementById("monthly-progress").style.width = `${monthProgress}%`;
    }
}
