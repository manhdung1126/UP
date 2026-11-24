# UP — Project brief (Tuần 12)

Nhóm: Dũng, Hiếu, Cảnh · Môn: Kiến trúc hướng dịch vụ (SOA)

## 1. Bài toán

Người dùng cá nhân thường dùng nhiều app rời rạc cho công việc, tập luyện và ăn uống. Các app không biết nhau: lịch tập không tính tới lịch làm việc, thực đơn không tính tới ngày tập nặng. Người dùng phải tự ghép, nên hay bỏ dở.

UP gom ba mảng này sau một API thống nhất. Một LLM (Gemini API) lên **kịch bản tuần** hợp nhất việc, tập và ăn. LLM chỉ đề xuất bản nháp. Người dùng xem và xác nhận trước khi dữ liệu được ghi. Số liệu dinh dưỡng do code tính, LLM không tự tính.

Hiện có một frontend khung (HTML/CSS/JS thuần, thư mục `docs/`) với dữ liệu mẫu và chưa lưu gì. Dự án này bổ sung API và backend thật cho frontend đó.

## 2. API phục vụ ai (consumers)

| Consumer | Vai trò |
| --- | --- |
| Frontend UP (web) | Consumer chính, gọi API qua HTTPS với JWT |
| `ai-service` (module LLM) | Consumer nội bộ, đọc dữ liệu việc, tập, ăn để dựng ngữ cảnh cho LLM |
| Ngoài MVP | App di động, công cụ nhập dữ liệu bên thứ ba |

## 3. Use case

| # | Use case | Phạm vi |
| --- | --- | --- |
| UC1 | Đăng ký, đăng nhập, giữ phiên | MVP |
| UC2 | Quản lý công việc và sự kiện trong lịch | MVP |
| UC3 | Ghi buổi tập (bài, hiệp, kg, số lần) và xem lịch sử | MVP |
| UC4 | Ghi bữa ăn, xem kcal và macro so với mục tiêu | MVP |
| UC5 | Lên kịch bản tuần: LLM sinh bản nháp, người dùng xem, nhận hoặc từ chối | MVP, **luồng demo trọng tâm** |

Luồng UC5 từ góc nhìn consumer: `POST /auth/login` → `POST /week-plans` (202, bản nháp) → `GET /week-plans/{id}` → `POST /week-plans/{id}:accept` (tạo task, buổi tập, bữa ăn). Ca lỗi: 401, 404, 409, 412, 422.

## 4. Phạm vi MVP

**Trong MVP:** UC1–UC5, một người dùng đăng nhập thấy dữ liệu của chính mình, hợp đồng OpenAPI đầy đủ, mock server chạy được.

**Ngoài MVP:** thu chi, học tập và flashcard, đánh giá video tập realtime bằng pose estimation, nhập CSV, thông báo đẩy, chia sẻ dữ liệu giữa người dùng. Lộ trình dài hạn nằm ở `plan-roadmap.md`.

## 5. Công nghệ và đánh đổi chính

| Hạng mục | Lựa chọn | Đánh đổi |
| --- | --- | --- |
| Kiến trúc | Modular monolith, mỗi module một Blueprint Flask | Chưa chứng minh được triển khai độc lập, nhưng 3 người trong 4 tuần không nên gánh vận hành nhiều service |
| Hợp đồng | OpenAPI viết trước (design-first), kiểm bằng Spectral, mock bằng Prism | Tốn công viết spec trước, bù lại cả nhóm làm song song và frontend không phải chờ backend |
| LLM | Gemini API, gọi từ server, trả `202` và bản nháp | Thêm một bước xác nhận cho người dùng, bù lại không ghi nhầm dữ liệu |
| Xác thực | JWT truy cập ngắn hạn kèm refresh token | Phải xử lý xoay vòng và thu hồi token |

Tiêu chuẩn API áp dụng từ các bài học: lỗi RFC 7807, phân trang `page`/`size`/`sort`, `ETag` và `If-Match`, JWT Bearer, phiên bản `/api/v1`.

## 6. Kế hoạch Tuần 13–15

| Tuần | Mục tiêu |
| --- | --- |
| 13 | Backend khung, DB, migration, Docker Compose, identity, planner |
| 14 | fitness, nutrition, week-plans với LLM adapter, nối frontend |
| 15 | Versioning, thử tải, bảo mật, gọi Gemini thật, hoàn thiện |

Chi tiết, phân công và rủi ro: [plan.md](../plan.md).
