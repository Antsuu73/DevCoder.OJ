# Cấu hình Google Login

Để Google Login hoạt động, bạn cần cấu hình các thông tin sau:

### 1. Phía Frontend
Mở file `login.html`, tìm dòng `data-client_id` và thay thế `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` bằng Client ID thật của bạn.

### 2. Phía Backend
Bạn cần cung cấp Client ID cho Backend để xác thực token.

- **Trên máy local:** Tạo file `.env` trong thư mục `backend/` (hoặc thư mục gốc nếu chạy Vercel CLI) và thêm:
  ```env
  GOOGLE_CLIENT_ID=xxxxx-xxxxxx.apps.googleusercontent.com
  ```
- **Trên Vercel:** Vào Dashboard của Vercel -> Project Settings -> Environment Variables. Thêm biến `GOOGLE_CLIENT_ID` với giá trị tương ứng.

### 3. Cài đặt thư viện
Tôi đã cập nhật `package.json`. Bạn cần chạy lệnh sau để cài đặt thư viện mới:
```bash
npm install
```
(Hoặc `cd backend && npm install` nếu bạn chạy backend riêng lẻ).
