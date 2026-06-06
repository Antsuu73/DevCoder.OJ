# Hướng dẫn Deploy DevCoder.OJ (nộp trường)

DevCoder.OJ cần **server có G++/Python** và **database lưu lâu dài**.  
Vercel **không đáp ứng** được — hãy deploy lên **Render.com** (miễn phí).

---

## Bước 1: Tạo database Turso (miễn phí, lưu tài khoản vĩnh viễn)

1. Vào [https://turso.tech](https://turso.tech) → đăng ký (GitHub)
2. **Create Database** → đặt tên `devcoder-oj`
3. Vào database → tab **Connect** → copy:
   - **Database URL** → `TURSO_DATABASE_URL`
   - **Auth Token** → `TURSO_AUTH_TOKEN`

---

## Bước 2: Deploy lên Render

1. Push code lên GitHub
2. Vào [https://render.com](https://render.com) → **New → Web Service**
3. Connect repo GitHub của bạn
4. Cấu hình:
   - **Runtime:** Docker
   - **Plan:** Free
5. Thêm **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `TURSO_DATABASE_URL` | URL từ Turso |
   | `TURSO_AUTH_TOKEN` | Token từ Turso |
   | `JWT_SECRET` | Chuỗi bí mật bất kỳ (vd: `dcoj-secret-2025-ltb`) |

6. Bấm **Create Web Service** → đợi 5–10 phút

7. Copy URL Render, ví dụ: `https://devcoder-oj.onrender.com`

---

## Bước 3: Kiểm tra

Mở trình duyệt:

- `https://YOUR-APP.onrender.com/api/health` → thấy `"judgeReady": true`
- `https://YOUR-APP.onrender.com` → đăng ký tài khoản → nộp bài thử

---

## Bước 4 (tùy chọn): Dùng Vercel làm frontend

Nếu vẫn muốn giữ Vercel cho giao diện:

1. Mở `js/config.js`
2. Điền URL Render:

```javascript
window.DCOJ_CONFIG = {
    productionApiUrl: "https://devcoder-oj.onrender.com"
};
```

3. Push lên GitHub → Vercel tự deploy

**Khuyến nghị nộp trường:** chỉ dùng **một URL Render** (đơn giản, đủ tính năng).

---

## Chạy local (phát triển)

```bash
cd backend
npm install
npm start
```

Mở: **http://localhost:3000**

Không cần Turso khi chạy local — database lưu tại `backend/data/oj.db`.

---

## Yêu cầu hệ thống (local)

- Node.js 18+
- G++ (C++17)
- Python 3.x

---

## Link nộp trường (mẫu)

> **DevCoder.OJ — Hệ thống luyện thuật toán THCS Lê Tấn Bê**  
> Demo: https://devcoder-oj.onrender.com  
> GitHub: https://github.com/Antsuu73/DevCoder.OJ
