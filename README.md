# my-config

Cấu hình cá nhân và **Private Photo Studio** (FastAPI Photobooth).

## Deploy Photobooth lên Render Free

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/TPhu21/my-config)

1. Bấm **Deploy to Render** phía trên, đăng nhập Render nếu cần và cấp quyền truy cập repository.
2. Xem trước Blueprint từ `render.yaml`: plan `free`, service `phu-private-photo-studio`, branch `main`, root `locket-backend`. Chấp thuận tạo Blueprint.
3. Đợi Render báo **Live** và dùng URL `https://<render-service>.onrender.com/health` mà chính Render hiển thị. Kết quả dự kiến: `{"status":"ok","service":"private-photobooth"}`.
4. Mở URL gốc để thử Photo Studio. API tạo ảnh cần header `X-API-Key`. Render đã **tự tạo** giá trị `PHOTOBOOTH_API_KEY`; xem trong Environment của chính service (không chia sẻ khóa).
5. Gói Free có thể ngủ sau 15 phút không có lưu lượng; truy cập đầu tiên sau đó có thể chậm.

**Bảo mật:** Không đăng khóa API lên GitHub. Backend là ứng dụng xử lý ảnh độc lập, **chưa được chứng minh tương thích với camera Locket**, và không cấp quyền Gold. Không trỏ RevenueCat, token đăng nhập hoặc API tài khoản Locket sang backend này.

Mã nguồn: [locket-backend/](locket-backend/).
