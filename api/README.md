# UP API

API được thiết kế theo phương pháp Design-first với OpenAPI 3.0.3.

## 1. Công cụ sử dụng

- OpenAPI: thiết kế API.
- Spectral: kiểm tra OpenAPI Specification.
- Redocly: gộp các file OpenAPI.
- Swagger UI: hiển thị tài liệu API.
- Prism: mô phỏng API.

## 2. Cấu trúc thư mục

```
api/
├── openapi.yaml
├── components.yaml
├── paths/
├── schemas/
├── examples/
├── vendor/
├── index.html
├── swagger-init.js
├── openapi.bundle.json
└── verify-fitness.py
```

## 3. Kiểm tra OpenAPI

Chạy tại thư mục gốc của repository:

```
npx --yes @stoplight/spectral-cli@6.17.1 lint api/openapi.yaml --fail-severity=error
```

## 4. Tạo OpenAPI Bundle

```
npx --yes @redocly/cli@1.34.5 bundle api/openapi.yaml --output api/openapi.bundle.json --ext json
```

Cần tạo lại bundle mỗi khi thay đổi OpenAPI Specification.

## 5. Chạy Swagger UI

```
python3 -m http.server 4175 --bind 127.0.0.1
```

Truy cập: [http://127.0.0.1:4175/api/](http://127.0.0.1:4175/api/)

Swagger UI 5.32.0 được lưu trong `vendor/swagger-ui/` và sử dụng giấy phép Apache-2.0.

## 6. Chạy Prism Mock Server

Mở terminal khác và chạy:

```
npx --yes @stoplight/prism-cli@5.16.0 mock api/openapi.yaml --host 127.0.0.1 --port 4010
```

Trong Swagger UI:

1. Chọn server `http://127.0.0.1:4010`.
2. Chọn Authorize và nhập `mock-token`.
3. Chọn API cần kiểm tra.
4. Chọn Try it out và Execute.

## 7. Demo Fitness API

| Method | Endpoint                      | Status |
| ------ | ----------------------------- | ------ |
| GET    | `/exercises`                  | 200    |
| POST   | `/workout-sessions`           | 201    |
| POST   | `/workout-sessions/{id}/sets` | 201    |
| GET    | `/workout-sessions/{id}`      | 200    |
| PATCH  | `/workout-sessions/{id}`      | 200    |

Exercise ID mẫu:

```
5af44b30-3f2e-4c55-86d1-64df1c89bc01
```

WorkoutSession ID mẫu:

```
8c2e5d63-1d4f-4a4c-9b67-3e6e0b4f7c21
```

Khi thêm hiệp tập, gửi header `If-Match: "1"`.

Khi cập nhật buổi tập theo dữ liệu mẫu, gửi header `If-Match: "2"`.

## 8. Kiểm thử Fitness API

Khởi động Prism trước khi chạy:

```
python3 api/verify-fitness.py
```

Bộ kiểm thử gồm 21 test cases:

- 7 ca kiểm tra operation thành công.
- 11 ca kiểm tra validation và authorization mô phỏng.
- 3 ca kiểm tra response lỗi 404, 412 và 428 bằng header Prefer.

## 9. Lưu ý

Prism trả về dữ liệu mẫu từ OpenAPI và không lưu dữ liệu vào database.

Token mock-token chỉ dùng để kiểm thử. Việc xác thực JWT, kiểm tra quyền sở hữu, transaction và ETag thực tế sẽ được triển khai trong backend.
