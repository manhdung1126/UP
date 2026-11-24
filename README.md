# UP

UP là API và web app quản lý cá nhân (công việc, tập luyện, dinh dưỡng, kịch bản tuần do AI đề xuất). Dự án nhóm môn Kiến trúc hướng dịch vụ (SOA). Hướng kỹ thuật: FastAPI, PostgreSQL, BYOAI (Bring Your Own AI), thiết kế hợp đồng OpenAPI trước.

Trạng thái Tuần 12: thiết kế, OpenAPI, Swagger UI và mock. Chưa có backend hay database thật.

## Nhóm và phân công

| Thành viên | Sở hữu | Sản phẩm Tuần 12 |
| --- | --- | --- |
| Cảnh | identity, planner, khung OpenAPI, chuẩn chung, CI Spectral | `api/components.yaml`, `api/paths/auth-planner.yaml`, `.spectral.yaml`, `design/brief.md`, bằng chứng Prism |
| Dũng | fitness, frontend, Swagger UI | `api/paths/fitness.yaml`, `design/resource-model.*`, `design/erd.*`, `design/design.md`, `api/index.html` |
| Hiếu | nutrition, week-plans, BYOAI | `api/paths/nutrition-plans.yaml`, `design/architecture.svg`, `design/uc5-sequence.svg`, `reports/report-T12.md` |

Mọi thay đổi vào `main` qua Pull Request, người khác duyệt. Kế hoạch đầy đủ: [plan.md](plan.md). Lộ trình dài hạn: [plan-roadmap.md](plan-roadmap.md). Backlog: [design/backlog.md](design/backlog.md).

## Cấu trúc repo

```
api/        OpenAPI (openapi.yaml, paths/, schemas/, components.yaml), Swagger UI
design/     brief, resource model, ERD, kiến trúc, sơ đồ UC5, backlog
reports/    báo cáo tiến độ, bằng chứng (reports/evidence/)
docs/       prototype frontend hiện có (GitHub Pages)
```

## Xem hợp đồng API

Swagger UI cục bộ: xem [api/README.md](api/README.md). Báo cáo Tuần 12: [reports/report-T12.md](reports/report-T12.md).

## Chạy kiểm tra và mock

Hợp đồng OpenAPI nằm ở [api/openapi.yaml](api/openapi.yaml), chia file: `api/paths/` (mỗi người một file), `api/schemas/`, `api/components.yaml`. Kế hoạch và phân công: [plan.md](plan.md).

```sh
# Kiểm tra spec
npx @stoplight/spectral-cli@6.17.1 lint api/openapi.yaml

# Chạy mock server tại http://127.0.0.1:4010 (không có tiền tố /api/v1)
npx @stoplight/prism-cli@5.16.0 mock api/openapi.yaml -p 4010
```

Thử mock: `curl -X POST http://127.0.0.1:4010/auth/login -H 'Content-Type: application/json' -d '{"email":"canh@example.com","password":"mat-khau-dai-12-ky-tu"}'`. Thêm `-H 'Prefer: code=422'` để ép Prism trả ca lỗi.

Bằng chứng mock chạy: [Prism khởi động, liệt kê toàn bộ operation gồm `POST /auth/login`, `POST /week-plans`, `POST /week-plans/{id}:accept`](reports/evidence/prism-mock-start.png).
Kết quả chạy 3 operation demo và ca lỗi 409/422 trên spec của Hiếu: [prism-mock-run.md](reports/evidence/prism-mock-run.md).


## Prototype frontend (`docs/`)

Bản prototype dùng dữ liệu mẫu nằm trong [docs](docs/). Xem [hướng dẫn chạy và kiểm tra](docs/README.md) cùng [nguồn và giấy phép dữ liệu](docs/DATA-SOURCES.md). GitHub Pages: **Settings → Pages → Deploy from a branch**, chọn **main** và **/docs**.
