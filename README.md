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

Thử mock: `curl -X POST http://127.0.0.1:4010/auth/login -H 'Content-Type: application/json' -d '{"email":"canh@example.com","password":"mat-khau-dai-12-ky-tu"}'`. Thêm `-H 'Prefer: code=422' -H 'Accept: application/problem+json'` để ép Prism trả ví dụ response lỗi; đây không phải test nghiệp vụ thật.


## Phần Dũng Tuần 12

- [Fitness OpenAPI](api/paths/fitness.yaml): 5 path, 7 operation; schema và ví dụ riêng, dùng lại components chung.
- [Hướng dẫn Swagger UI và mock](api/README.md): chạy local, lint, bundle và 21 ca smoke test.
- [Resource Model](design/resource-model.svg), [ERD](design/erd.svg), nguồn Mermaid và [giải thích thiết kế](design/design.md).

Tuần 12 mới kiểm hợp đồng/mock; backend FastAPI/PostgreSQL và Virtual Trainer chưa triển khai. Các điểm cần đồng bộ Exercise UUID với payload Weekly Planner được ghi trong tài liệu thiết kế.
