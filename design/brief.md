# UP — Project brief (Tuần 12)

Nhóm: Dũng, Hiếu, Cảnh · Môn: Kiến trúc hướng dịch vụ (SOA)

## 1. Bài toán

Người dùng cá nhân thường dùng nhiều app rời rạc cho công việc, tập luyện và ăn uống. Các app không biết nhau: lịch tập không tính tới lịch làm việc, thực đơn không tính tới ngày tập nặng. Người dùng phải tự ghép, nên hay bỏ dở.

UP gom ba mảng này sau một API thống nhất. Một trợ lý AI của chính người dùng (**BYOAI**, Bring Your Own AI) giúp lên **kịch bản tuần** hợp nhất việc, tập và ăn. AI chỉ đề xuất bản nháp. Backend kiểm tra dữ liệu, người dùng xem và xác nhận trước khi dữ liệu được ghi. Số liệu dinh dưỡng do code tính, AI không tự tính. Demo và test dùng Mock Provider, không cần API key; đường BYOAI tối thiểu là xuất prompt rồi nhập JSON.

Hiện có một frontend khung (HTML/CSS/JS thuần, thư mục `docs/`) với dữ liệu mẫu và chưa lưu gì. Dự án này bổ sung API và backend thật cho frontend đó.

## 2. API phục vụ ai (consumers)

| Consumer | Vai trò |
| --- | --- |
| Frontend UP (web) | Consumer chính, gọi API qua HTTPS với JWT |
| Module `plans` | Dựng ngữ cảnh BYOAI từ dữ liệu việc, tập, ăn qua hợp đồng nghiệp vụ; connector/MCP (nếu nhóm duyệt) chỉ truy cập theo quyền đã cấp |
| Ngoài MVP | App di động, công cụ nhập dữ liệu bên thứ ba |

## 3. Use case

| # | Use case | Phạm vi |
| --- | --- | --- |
| UC1 | Đăng ký, đăng nhập, giữ phiên | MVP |
| UC2 | Quản lý công việc và sự kiện trong lịch | MVP |
| UC3 | Ghi buổi tập (bài, hiệp, kg, số lần) và xem lịch sử | MVP |
| UC4 | Ghi bữa ăn, xem kcal và macro so với mục tiêu | MVP |
| UC5 | Lên kịch bản tuần: nhận bản nháp qua BYOAI (hoặc Mock Provider), kiểm dữ liệu, người dùng nhận hoặc từ chối | MVP, **luồng demo trọng tâm** |

Luồng UC5 từ góc nhìn consumer: `POST /auth/login` → `POST /week-plans` (202, `pending`) → `GET /week-plans/{id}` (mock: bản nháp cố định `draft`; xuất/nhập: `awaiting-input` kèm prompt) → [đề xuất, chờ nhóm duyệt] `POST /week-plans/{id}:import` → `POST /week-plans/{id}:accept` (tạo task, buổi tập, bữa ăn trong transaction, retry không tạo trùng). Ca lỗi: 401, 404, 409, 412, 422, 429.

## 4. Phạm vi MVP

**Trong MVP:** UC1–UC5, một người dùng đăng nhập thấy dữ liệu của chính mình, hợp đồng OpenAPI đầy đủ, mock server chạy được.

**Mở rộng, chờ nhóm duyệt:** PoC Virtual Trainer cục bộ 1–2 bài; connector subscription chính thức, MCP hoặc Local LLM.

**Ngoài MVP:** thu chi, học tập và flashcard, camera trainer tích hợp web đầy đủ, nhập CSV, thông báo đẩy, chia sẻ dữ liệu giữa người dùng. Lộ trình dài hạn nằm ở `plan-roadmap.md`.

## 5. Công nghệ và đánh đổi chính

| Hạng mục | Lựa chọn | Đánh đổi |
| --- | --- | --- |
| Kiến trúc | Modular monolith FastAPI, mỗi module một APIRouter (Pydantic, SQLAlchemy 2.x, Alembic, PostgreSQL) | Chưa chứng minh được triển khai độc lập, nhưng 3 người trong 4 tuần không nên gánh vận hành nhiều service |
| Hợp đồng | OpenAPI viết trước (design-first), kiểm bằng Spectral, mock bằng Prism | Tốn công viết spec trước, bù lại cả nhóm làm song song và frontend không phải chờ backend |
| BYOAI | Mock Provider + xuất prompt/nhập JSON; trả `202` và bản nháp | Không phụ thuộc API trả phí; thêm bước kiểm và xác nhận, bù lại không ghi nhầm dữ liệu. Connector subscription/MCP/local chỉ thử khi nhóm duyệt |
| Xác thực | JWT truy cập ngắn hạn kèm refresh token | Phải xử lý xoay vòng và thu hồi token |

Tiêu chuẩn API áp dụng từ các bài học: lỗi RFC 7807, phân trang `page`/`size`/`sort`, `ETag` và `If-Match`, JWT Bearer, phiên bản `/api/v1`.

## 6. Kế hoạch Tuần 13–15

| Tuần | Mục tiêu |
| --- | --- |
| 13 | FastAPI khung, PostgreSQL, Alembic, Docker Compose, identity, planner |
| 14 | fitness, nutrition, week-plans (mock + xuất/nhập JSON), `:accept`, nối frontend |
| 15 | Versioning, thử tải, bảo mật, tài liệu; connector/trainer chỉ nếu PoC đạt |

Chi tiết, phân công và rủi ro: [plan.md](../plan.md).
