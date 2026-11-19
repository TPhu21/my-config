# iPhone + Locket: hướng dẫn kết nối backend riêng

Đây là ứng dụng xử lý ảnh độc lập, không phải plugin chính thức cho Locket. Chưa có hợp đồng API tạo filter của Locket được xác minh. Việc đổi trạng thái HTTP thành 200 hoặc tự sửa entitlement không đồng nghĩa tạo được ảnh thật hay Gold hợp lệ.

## Dùng ảnh xử lý trên iPhone qua HTTPS Tailscale Serve

1. Trên Windows, vào thư mục locket-backend và chạy Python 3.11:
   py -3.11 -m venv .venv
   .\.venv\Scripts\python.exe -m pip install -r requirements.txt
   $env:PHOTOBOOTH_API_KEY = 'YOUR_PRIVATE_SECRET'
   .\.venv\Scripts\python.exe -m uvicorn app:app --host 127.0.0.1 --port 8000
2. Cài Tailscale trên iPhone và Windows, đăng nhập cùng một tailnet, rồi chạy trong PowerShell khác: tailscale serve --bg 8000
3. Dùng lệnh tailscale serve status để lấy URL HTTPS riêng và mở bằng Safari trên iPhone.
4. Nhập API key trong giao diện, xử lý ảnh, nhấn Chia sẻ ảnh trên iPhone. Locket chỉ xuất hiện trong bảng chia sẻ khi ứng dụng đăng ký hỗ trợ nhận ảnh. Nếu không, tải PNG về thư viện rồi nhập từ Locket nếu ứng dụng/tài khoản hỗ trợ.
5. Dừng: tailscale serve off

Lưu ý iOS thường không thể bật hai VPN packet-tunnel cùng lúc: Tailscale VPN và Shadowrocket có thể xung đột. Để thử Tailscale, tắt Shadowrocket trên iPhone; hoặc triển khai backend qua một URL HTTPS thông thường của chính bạn. Không đưa API key vào repo/module công khai.

## Thử cùng Wi-Fi (HTTP, không bật nút Share)

Chạy uvicorn với --host 0.0.0.0 trên Wi-Fi tin cậy, giới hạn Windows Firewall chỉ mạng cục bộ, truy cập http://<Windows_IPv4>:8000 từ Safari. Tải PNG rồi lưu Ảnh nếu Locket hỗ trợ nhập ảnh. Web Share API cần HTTPS nên nút chia sẻ sẽ ẩn trên HTTP qua LAN. Không dùng HTTP cho ảnh nhạy cảm.

## Chẩn đoán giao thức filter gốc (chỉ đọc)

Module: https://raw.githubusercontent.com/TPhu21/my-config/main/locket-backend/locket-contract-probe.sgmodule

Chỉ ghi tên endpoint, phương thức, content-type, status, tên trường và kiểu dữ liệu JSON. Không log giá trị, token, uid, ảnh, query string; không chỉnh sửa request/response; không gửi dữ liệu ra ngoài. Chỉ bật khi cần kiểm tra bằng chứng trên tài khoản của chính mình và có quyền kiểm thử. Tắt ngay nếu xuất hiện lỗi SSL hoặc ngắt mạng. Không chia sẻ toàn bộ network logs hoặc credential.

Đây chỉ là module chẩn đoán, KHÔNG phải adapter đưa filter hoạt động ngay trong camera Locket. Phần đó cần hợp đồng API được xác minh và phương thức tích hợp được hỗ trợ.

## Option C: Hosted HTTPS without Tailscale (Render Blueprint)

The repository root contains `render.yaml`. In [Render Blueprints](https://dashboard.render.com/blueprints), choose **New Blueprint Instance**, connect the GitHub repository `TPhu21/my-config` branch `main`, and select the repo-root Blueprint file. On first deployment enter a strong private `PHOTOBOOTH_API_KEY` secret when prompted (you may generate one on Windows: `py -3.11 -c "import secrets;print(secrets.token_urlsafe(32))"`). Do not put it in source code, screenshots or a Shadowrocket module.

Render builds `locket-backend/` and assigns a real HTTPS `.onrender.com` address after successful deployment. Confirm `https://YOUR_ACTUAL_HOST/health` returns `{"status":"ok"}` and visit the same host in Safari on iPhone. Enter the private API key and generate a Photobooth image. Tap **Chia sẻ ảnh trên iPhone**; Locket only appears in the iOS Share Sheet if that app accepts files. Otherwise save the PNG to Photos and import into Locket using its supported camera roll control if available. Safari > Share > **Add to Home Screen** provides a shortcut to the standalone studio.

This free web instance installs only `requirements.txt`: Photobooth and conventional filters work. It does **not** load GPU InstructPix2Pix or the optional local background-removal package. The Blueprint enables `PHOTOBOOTH_REQUIRE_AUTH=1`: no key configured returns 503 for POST processing; missing/wrong key returns 401. Uploads above 36 MB by Content-Length are rejected. There is no Locket authorization redirection, no fake subscription entitlement and **no verified direct in-camera integration**.

## Viewing Shadowrocket read-only probe logs

In Shadowrocket on iPhone: import `locket-contract-probe.sgmodule` in **Module** and enable it temporarily. Check your own trusted MITM certificate, trigger one Locket filter action, then view **Data > Proxy Log** (or the Script/Log view for your app version). Look for the literal prefix `[LOCKET-CONTRACT]`. It logs only endpoint names, methods, content types, HTTP status and shallow JSON key/type shapes; not tokens, raw content, images or full URLs. If nothing appears, the endpoint may differ or traffic was not intercepted. Turn the probe off after the test. Never send complete raw logs or auth headers.
