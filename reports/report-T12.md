# Báo cáo tiến độ Tuần 12 — UP (SOA)

Nhóm: Dũng, Hiếu, Cảnh. Ngày: 25/11/2026. Repo: https://github.com/manhdung1126/UP. Phạm vi chuẩn: [plan.md](../plan.md). Bản chi tiết (bảng từng đầu việc, thiết kế BYOAI): [report-T12-chi-tiet.md](report-T12-chi-tiet.md).

## 1. Đã làm

| Sản phẩm | Nội dung | Người | Bằng chứng |
| --- | --- | --- | --- |
| Project brief | Bài toán, consumers, 5 use case, MVP và ngoài MVP, đánh đổi kỹ thuật | Cảnh | [design/brief.md](../design/brief.md), PR #1 |
| Resource model, ERD | Sơ đồ, giải thích resource khác DB schema, invariant Fitness | Dũng | [design/design.md](../design/design.md), `design/erd.*`, `design/resource-model.*`, PR #5 |
| Kiến trúc, luồng UC5 | Sơ đồ kiến trúc FastAPI + BYOAI, sơ đồ tuần tự UC5, use case | Hiếu | `design/architecture.svg`, `design/uc5-sequence.svg`, PR #3 |
| OpenAPI | Auth, planner (Cảnh); fitness (Dũng); nutrition, week-plans (Hiếu). Lỗi RFC 7807, phân trang, ETag/If-Match, JWT, `/api/v1`, `429` | Cả nhóm | [api/openapi.yaml](../api/openapi.yaml), PR #1, #3, #5 |
| Kiểm hợp đồng | Spectral 6.17.1: 0 lỗi; CI GitHub Actions | Cảnh | `.spectral.yaml`, `.github/workflows/lint-api.yml` |
| Swagger UI | UI cục bộ, bundle, 27 operation toàn nhóm | Dũng | `api/index.html`, [ảnh Swagger](swagger-ui-desktop.png) |
| Mock server | Prism: `POST /auth/login` 200, `POST /week-plans` 202, `POST /week-plans/{id}:accept` 200; ca lỗi 409 và 422 | Cảnh | [prism-mock-run.md](evidence/prism-mock-run.md) |
| Repo, README, phân công | Nhánh theo người, PR có người duyệt, bảng phân công | Cả nhóm | [README.md](../README.md) |
| Slide | 8 trang: bài toán, MVP, tiêu chuẩn API, resource model, ERD, kiến trúc và đánh đổi, UC5, kế hoạch | Cả nhóm | [slides/UP-slide-T12.pdf](slides/UP-slide-T12.pdf) |
| Backlog, kế hoạch Tuần 13–15 | Backlog 28 việc, kế hoạch và rủi ro | Cả nhóm | [design/backlog.md](../design/backlog.md), plan.md mục 9, 12 |

Demo (không cần database): mở Swagger UI hoặc Prism, gọi 3 operation, chạy luồng UC5 từ góc nhìn consumer: login, tạo kế hoạch (202, `pending`), xem bản nháp, nhận (`:accept`). Đầu ra là **mock cố định** (`source: "mock"`).

## 2. Chưa xong

- Chưa tạo GitHub Issues và Project từ `design/backlog.md` (backlog mới ở dạng file).
- Slide (8 trang) đã soạn, chờ cả nhóm duyệt lần cuối trước khi trình bày.
- Chưa có backend, database, JWT thật, phân quyền A/B, chuyển trạng thái thật: Tuần 12 chỉ yêu cầu thiết kế và mock. Prism chỉ chứng minh hợp đồng.
- `POST /week-plans/{id}:import` và vòng đời trạng thái (`awaiting-input`, `failed`) mới là đề xuất, chưa được nhóm duyệt.
- Cần schema payload theo từng `kind` (hiện `additionalProperties: true`) và cách liên kết mục đã nhận với bản ghi tạo ra, trước khi code `:accept`.

## 3. Cần hỗ trợ và quyết định chờ nhóm (plan.md mục 14)

- Q2: phiên bản FastAPI, Pydantic, SQLAlchemy, Alembic và cách map lỗi, ETag (Cảnh chuẩn bị).
- Q3, Q4: duyệt `:import`; chọn một PoC connector (subscription chính thức, MCP hoặc local) (Hiếu).
- Q5: phạm vi PoC Virtual Trainer và quyền tái sử dụng mã nguồn (Dũng).
- Q6, Q7: vị trí `frontend/`, hosting, lịch review, giờ họp (cả nhóm).
- Hỏi giảng viên: mốc nộp chính thức của Tuần 13–15.

## 4. Kế hoạch Tuần 13–15

| Tuần | Mục tiêu | Sản phẩm kiểm được | Người chính |
| --- | --- | --- | --- |
| 13 | FastAPI, PostgreSQL, Alembic, Docker Compose, identity, planner, frontend auth/tasks | Compose chạy, pytest/Newman auth và tasks, OpenAPI runtime khớp spec | Cảnh, Dũng |
| 14 | fitness, nutrition, week-plans (mock, xuất/nhập JSON), `:accept`, frontend các luồng còn lại | UC5 không cần API key; JSON sai không ghi; A không đọc dữ liệu B; nhận lại không trùng | Dũng, Hiếu |
| 15 | Versioning, tải, bảo mật, tài liệu, slide; connector và trainer nếu PoC đạt | Báo cáo kiểm thử, demo trọn vẹn | Cả nhóm |

Cắt giảm nếu trễ: connector AI tự động và Local LLM, rồi Virtual Trainer, rồi rút gọn frontend. Nutrition thuộc MVP.

## 5. Rủi ro chính

| Rủi ro | Cách giảm |
| --- | --- |
| Phạm vi lớn so với 3 người, 4 tuần | MVP chỉ 5 use case, có thứ tự cắt giảm |
| Chỉ một người hiểu một mảng | Mọi PR có người duyệt chéo; mỗi người tập trả lời cả thiết kế |
| Đổi hợp đồng giữa Tuần 13–14 | Đổi spec qua PR cả nhóm duyệt, chạy Spectral |
| Subscription AI không tích hợp được | PoC trước; giữ Mock và xuất/nhập; không tự chuyển sang API trả phí |
| Thiếu bằng chứng khi báo cáo | Mỗi mục xong gắn link PR, commit hoặc ảnh |
