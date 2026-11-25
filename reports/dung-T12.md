# Báo cáo tiến độ cá nhân - Tuần 12

**Thành viên:** Dũng

**Phụ trách:** Fitness API, Resource Model, ERD và Swagger UI.

## 1. Công việc đã thực hiện

| Công việc | Nội dung                                       |
| --------- | ---------------------------------------------- |
| D1        | Tổ chức repository và nhánh làm việc           |
| D2        | Thiết kế OpenAPI cho Fitness                   |
| D3        | Thiết kế Resource Model và ERD                 |
| D4        | Viết tài liệu thiết kế                         |
| D5        | Tích hợp Swagger UI và kiểm thử API trên Prism |

## 2. Fitness API

Fitness gồm ba resource chính: Exercise, WorkoutSession và WorkoutSet.

Đã thiết kế 5 paths và 7 operations:

| Method | Endpoint                      |
| ------ | ----------------------------- |
| GET    | `/exercises`                  |
| GET    | `/exercises/{id}`             |
| GET    | `/workout-sessions`           |
| POST   | `/workout-sessions`           |
| GET    | `/workout-sessions/{id}`      |
| PATCH  | `/workout-sessions/{id}`      |
| POST   | `/workout-sessions/{id}/sets` |

Hợp đồng quy định định danh UUID, xác thực JWT Bearer và cập nhật buổi tập bằng `ETag`/`If-Match`. Hai API danh sách hỗ trợ phân trang, lọc và sắp xếp.

Các file:

- [Đường dẫn và phương thức](../api/paths/fitness.yaml)
- [Schema Fitness](../api/schemas/fitness.yaml)
- [Dữ liệu mẫu](../api/examples/fitness.yaml)

## 3. Resource Model và ERD

Thiết kế các resource và quan hệ dữ liệu của hệ thống trong phạm vi MVP.

- [Resource Model](../design/resource-model.png)
- [ERD](../design/erd.png)
- [Tài liệu thiết kế](../design/design.md)

## 4. Swagger UI và kiểm thử

Swagger UI hiển thị 27 operation của hệ thống. Khi gửi `GET /exercises` từ Swagger UI với token thử nghiệm, Prism trả về `200 OK` và danh sách bài tập mẫu.

Ngày 25/11/2026, Spectral kiểm tra hợp đồng OpenAPI với 0 lỗi ở mức error. Sau khi tạo lại bundle, [bộ kiểm thử Fitness](../api/verify-fitness.py) đạt **21/21 ca** trên Prism. Trong đó có 7 ca thành công, 11 ca kiểm tra dữ liệu đầu vào hoặc thiếu token và 3 ca mô phỏng phản hồi `404`, `412`, `428` bằng header `Prefer`.

Bằng chứng:

- [Swagger UI](swagger-ui-desktop.png)
- [Phản hồi của Fitness API](swagger-fitness-request.png)

## 5. Công việc chưa hoàn thành

- Triển khai Fitness API với FastAPI.
- Kết nối PostgreSQL.
- Kiểm tra xác thực, phân quyền và transaction trên backend.
- Hoàn thiện tích hợp Fitness với Weekly Planner.
- Tìm hiểu khả năng tích hợp Virtual Trainer.
- Tạo GitHub Issues và Project từ backlog của nhóm.

## 6. Kế hoạch tiếp theo

- Tham gia xây dựng frontend theo từng luồng nghiệp vụ.
- Triển khai Fitness API theo OpenAPI Specification.
- Viết kiểm thử cho các chức năng Fitness.
- Tích hợp Fitness với các module khác.

## 7. GitHub

- Branch: `dung/week12`
- Pull request phần thiết kế ban đầu: [#5](https://github.com/manhdung1126/UP/pull/5)
- Repository: [https://github.com/manhdung1126/UP](https://github.com/manhdung1126/UP)
