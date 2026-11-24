# UP

UP là web app quản lý cá nhân với lịch, công việc và theo dõi tập luyện.

Bản dùng để chia sẻ nằm trong thư mục [docs](docs/). Xem [hướng dẫn chạy và kiểm tra](docs/README.md) cùng [nguồn và giấy phép dữ liệu](docs/DATA-SOURCES.md).

Để mở bằng GitHub Pages, chọn **Settings → Pages → Deploy from a branch**, rồi chọn **main** và **/docs**.

## API contract (Tuần 12)

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
