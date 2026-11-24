# Chạy hợp đồng UP API

Tuần 12 dùng OpenAPI 3.0.3 viết trước, Prism và Swagger UI. Chưa có backend FastAPI hay database thật. Chạy các lệnh dưới đây từ thư mục gốc `UP/`; không dùng `web/` hoặc `docs/` làm thư mục gốc của HTTP server này.

## Kiểm tra và tạo bundle

```sh
npx --yes @stoplight/spectral-cli@6.17.1 lint api/openapi.yaml --fail-severity=error
npx --yes @redocly/cli@1.34.5 bundle api/openapi.yaml --output api/openapi.bundle.json --ext json
```

`openapi.yaml` và các file con là nguồn chỉnh sửa. `openapi.bundle.json` là file sinh ra để Swagger UI đọc ổn định; phải tạo lại sau mỗi lần đổi spec, không chỉnh trực tiếp file bundle.

## Mở Swagger UI

Terminal thứ nhất:

```sh
python3 -m http.server 4175 --bind 127.0.0.1
```

Mở [Swagger UI](http://127.0.0.1:4175/api/). Tài nguyên Swagger UI 5.32.0 nằm tại `api/vendor/swagger-ui/`, giữ nguyên LICENSE Apache-2.0. UI và spec không gọi CDN hoặc gửi hợp đồng đến validator bên ngoài. Trình duyệt cần HTTP server, không mở `index.html` bằng `file://`.

Terminal thứ hai:

```sh
npx --yes @stoplight/prism-cli@5.16.0 mock api/openapi.yaml --host 127.0.0.1 --port 4010
```

Trong Swagger UI chọn server mock `http://127.0.0.1:4010`, bấm **Authorize**, nhập `mock-token`. Đây là chuỗi thử, không phải JWT của tài khoản thật. UI không lưu authorization khi tải lại. Không đổi cấu hình GitHub Pages trong phần việc này.

## Demo Fitness

1. `GET /exercises`: xem trang thư viện, dùng UUID `5af44b30-3f2e-4c55-86d1-64df1c89bc01` trong fixture.
2. `POST /workout-sessions`: dùng request example. Response fixture có buổi `8c2e5d63-1d4f-4a4c-9b67-3e6e0b4f7c21`, `sets=[]`, ETag `"1"`.
3. `POST /workout-sessions/{id}/sets`: gửi `If-Match: "1"` và request example; thấy 10 rep × 50 kg. GET chi tiết trả fixture có tổng 500 kg và ETag `"2"`.
4. Sửa `reps` thành -1 để thấy 422 do schema. Bỏ authorization để thấy 401 do mock.
5. Với lỗi nghiệp vụ 404/412/428, thêm header `Prefer: code=412` và `Accept: application/problem+json` khi dùng curl. Đây là ép ví dụ response, không chứng minh kiểm version thật.

```sh
python3 api/verify-fitness.py
```

Bộ smoke có 21 ca: 7 operation thành công, lỗi input/security mock, và ví dụ 404/412/428. Không có `Prefer` ở các ca input không hợp lệ. Nếu đổi cổng, đặt `MOCK_URL=http://127.0.0.1:4011` trước lệnh kiểm.

## Giới hạn của bằng chứng Tuần 12

- Prism trả ví dụ cố định và không có database. POST rồi GET không chứng minh dữ liệu vừa ghi đã được lưu.
- Mock không xác minh JWT thật, chủ sở hữu A/B, FK, khoảng thời gian, transaction hay chống ghi trùng khi đồng thời.
- Những điều đó cần test backend/PostgreSQL ở Tuần 13–15. Ràng buộc và quyết định cần nhóm review nằm trong [design.md](../design/design.md).
- Tên bài, UUID và thời gian trong examples là fixture minh họa, không phải seed đã chạy hoặc chất lượng dữ liệu đã xác minh.
