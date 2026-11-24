# Backlog khởi tạo

Nguồn: mục 10 của [plan.md](../plan.md). Mỗi dòng nên là một GitHub Issue, nhãn theo tuần và người. Cột trạng thái cập nhật theo commit hoặc PR.

## Tuần 12 (thiết kế)

| # | Việc | Người | Trạng thái | Bằng chứng |
| --- | --- | --- | --- | --- |
| 1 | `design/brief.md` | Cảnh | Xong | PR #1 |
| 2 | Resource model, ERD, đoạn khác biệt resource/DB | Dũng | Xong | PR #5 |
| 3 | Sơ đồ kiến trúc, sơ đồ luồng UC5 | Hiếu | Xong | PR #3 |
| 4 | `api/components.yaml` (Problem, Pagination, Auth) | Cảnh | Xong | PR #1 |
| 5 | OpenAPI auth, tasks, events | Cảnh | Xong | PR #1 |
| 6 | OpenAPI exercises, workout-sessions | Dũng | Xong | PR #5 |
| 7 | OpenAPI nutrition, meal-logs, week-plans | Hiếu | Xong | PR #3 |
| 8 | Spectral lint trong CI | Cảnh | Xong | `.github/workflows/lint-api.yml` |
| 9 | Prism mock và Swagger UI | Cảnh, Dũng | Xong | `reports/evidence/`, `api/index.html` |
| 10 | README: mục tiêu, cách chạy, cấu trúc repo, phân công | Cảnh | Xong | `README.md` |
| 11 | Slide 6–8 và báo cáo tiến độ | Cả nhóm | Đã soạn, chờ nhóm duyệt | `reports/slides/UP-slide-T12.pdf`, `reports/report-T12.md` |

## Tuần 13 (nền tảng)

| # | Việc | Người |
| --- | --- | --- |
| 12 | Chốt Q2: phiên bản FastAPI/Pydantic/SQLAlchemy/Alembic, cách map lỗi RFC 7807 và ETag | Cảnh |
| 13 | Khung FastAPI, APIRouter, Docker Compose, PostgreSQL, `/healthz`, `/ready` | Cảnh |
| 14 | Alembic migration đầu tiên (users, tasks, events) | Cảnh |
| 15 | identity: register, login, refresh, JWT, `/users/me` | Cảnh |
| 16 | planner: tasks, events (ETag, If-Match, phân trang) | Cảnh |
| 17 | Test pytest và Newman cho auth, tasks; test phân quyền A/B | Cảnh |
| 18 | Đối chiếu OpenAPI sinh từ FastAPI với spec viết tay | Cảnh |
| 19 | Frontend mới: slice auth, tasks/events (quyết định Q6) | Dũng |

## Tuần 14 (nghiệp vụ)

| # | Việc | Người |
| --- | --- | --- |
| 20 | fitness: nạp 939 bài tập, buổi tập, hiệp, ETag | Dũng |
| 21 | nutrition: foods, meal-logs, profile, targets (Mifflin-St Jeor) | Hiếu |
| 22 | week-plans: Mock Provider, xuất prompt, `:import`, kiểm Pydantic | Hiếu |
| 23 | `:accept` trong transaction, retry không tạo trùng | Hiếu |
| 24 | Frontend: workout, meal-log, week-plan | Dũng |
| 25 | PoC Virtual Trainer 1–2 bài (chỉ khi lõi đạt và nhóm duyệt) | Dũng |

## Tuần 15 (hoàn thiện)

| # | Việc | Người |
| --- | --- | --- |
| 26 | Versioning `/api/v1`, thử tải, rà soát bảo mật | Cả nhóm |
| 27 | Báo cáo kiểm thử, tài liệu, slide cuối kỳ | Cả nhóm |
| 28 | Connector chính thức, MCP hoặc Local LLM (chỉ nếu PoC đạt) | Hiếu |

## Tạo GitHub Issues từ file này

Cần cài `gh` và đăng nhập. Ví dụ cho một việc: `gh issue create --title "Khung FastAPI và Docker Compose" --label "tuan-13,canh" --body "Xem design/backlog.md, dòng 13"`.
