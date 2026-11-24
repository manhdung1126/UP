# Thiết kế resource và dữ liệu UP

Phần D3–D4 của Dũng, Tuần 12. Phạm vi: thiết kế, OpenAPI và mock. Backend FastAPI, migration, phân quyền thật và cơ sở dữ liệu chưa được triển khai trong phần này. Cảnh tiếp tục sở hữu chuẩn chung/Identity/Planner; Hiếu sở hữu Nutrition/Weekly Planner/BYOAI.

## 1. Hai loại mô hình

| Resource Model | Database Schema |
| --- | --- |
| Mô tả dữ liệu consumer nhận và gửi qua API | Mô tả cách backend lưu và bảo vệ dữ liệu |
| Dùng tên `camelCase`, URI và JSON | Dùng bảng, cột `snake_case`, PK, FK, unique/check constraint |
| Có thể gộp dữ liệu và có trường tính ra | Tách bảng để tránh lặp và bảo đảm toàn vẹn |
| Ví dụ `WorkoutSession.sets[]` | Hai bảng `workout_sessions`, `workout_sets` |

Sơ đồ nguồn chỉnh sửa được: [resource-model.mmd](resource-model.mmd), [erd.mmd](erd.mmd). Bản xuất để đưa vào báo cáo: [resource-model.svg](resource-model.svg), [erd.svg](erd.svg). ERD là thiết kế logic đề xuất, chưa phải migration đã chạy. Bỏ bớt các trường audit khỏi hình để dễ đọc; dữ liệu riêng vẫn cần `created_at`, `updated_at` và version ở aggregate chịu trách nhiệm cập nhật.

## 2. Resource không ánh xạ 1:1 với bảng

- `WorkoutSession` chứa `sets[]` theo `setNumber`; API không yêu cầu client tự join bảng. Bảng `WORKOUT_SET` lưu FK `session_id`, `exercise_id`.
- `NutritionTarget` tính từ `NutritionProfile`, không có bảng riêng. Công thức và kiểm tra dinh dưỡng do Hiếu phụ trách.
- `totalVolumeKg = Σ(reps × weightKg)` tính từ hiệp đã ghi. Ví dụ 10 rep × 50 kg = 500 kg khối lượng tập. Đây không phải kcal, 1RM hoặc cân nặng cơ thể.
- `WeekPlan.items[]` gộp task/workout/meal; DB lưu `WEEK_PLAN_ITEM.kind` và `payload`. Chỉ sau `:accept` mới gọi nghiệp vụ các module để tạo bản ghi thật.
- `User` trong DB có `password_hash`; `/users/me` không bao giờ trả giá trị này.
- `Exercise` và `Food` là thư viện dùng chung. Bản ghi cá nhân có `user_id`; bản ghi con kế thừa quyền từ cha, không cần nhân bản `user_id` ở mọi bảng.

## 3. Invariant của Fitness

| Quy tắc | Nơi chịu trách nhiệm |
| --- | --- |
| Người dùng chỉ đọc/sửa buổi và hiệp của mình; tài nguyên khác chủ trả 404 | Fitness service truy vấn qua chủ sở hữu của `WorkoutSession`; không lấy `userId` từ JSON |
| UUID của bài API khác slug từ prototype | Khi seed, giữ `source_id` ổn định và map sang UUID; client/Weekly Planner dùng UUID |
| `reps` nguyên và ≥ 1, `weightKg` ≥ 0, RPE tùy chọn trong [1,10] | Schema đầu vào và DB check constraints |
| Một buổi có 0..n hiệp, một hiệp chỉ thuộc một buổi | FK và `UNIQUE(session_id, set_number)` |
| Thời gian có múi giờ; trả UTC; `endedAt >= startedAt` khi có cả hai | Validation nghiệp vụ và DB constraint phù hợp |
| Thêm hiệp/sửa buổi tăng version của buổi cha | Một transaction kiểm version và ghi; không làm check rồi insert rời nhau |
| `If-Match` thiếu trả 428, cũ trả 412 | API + thao tác ghi có điều kiện trong DB |
| Tổng khối lượng không lấy từ client hoặc LLM | Backend tính từ các hiệp thực hiện thật |

`POST /workout-sessions` chưa hỗ trợ Idempotency-Key và chưa an toàn để tự retry khi mất response. Cần kiểm lịch sử trước. `POST .../sets` sử dụng ETag buổi cha: khi request đầu đã thành công, request lặp cùng ETag phải trả 412. Điều này cần chứng minh bằng test DB/transaction khi làm backend; mock không chứng minh được.

Buổi từ UC5 là kế hoạch: có `scheduledAt`, `startedAt=null`, `sets=[]`. `PATCH /workout-sessions/{id}` ghi thời điểm bắt đầu thực tế; sau đó mới thêm hiệp. Không biến `targetReps` hoặc số hiệp dự kiến thành số liệu đã tập. Lõi Fitness và ghi tay không cần camera hoặc LLM.

## 4. Hợp đồng D2

Tiền tố production là `/api/v1`. Prism dùng path không tiền tố theo server trong spec.

| Method | Path | Thành công |
| --- | --- | --- |
| GET | `/exercises` | 200, phân trang/lọc/sort |
| GET | `/exercises/{id}` | 200 |
| GET, POST | `/workout-sessions` | 200, 201 |
| GET, PATCH | `/workout-sessions/{id}` | 200, ETag |
| POST | `/workout-sessions/{id}/sets` | 201, ETag mới của buổi cha |

Năm path, bảy operation. Ba path của D2 trong plan được giữ; thêm xem chi tiết và PATCH buổi để lấy ETag, xem lại dữ liệu và bắt đầu buổi dự kiến. Chưa thêm xóa buổi, sửa/xóa hiệp, routine, số đo hoặc camera. Mỗi bổ sung sau này cần PR hợp đồng.

Spec dùng lại `PageMeta`, Page/Size/IfMatch, ETag schema và response lỗi trong `api/components.yaml` của Cảnh. Giới hạn sort riêng theo resource nhưng vẫn dùng query `sort`; ví dụ `name` cho bài và `-createdAt` cho buổi. Invalid sort trả 422. Tìm/lọc không bỏ qua phân trang.

Ví dụ UUID/timestamp là fixture cho mock, không phải dữ liệu người dùng hoặc seed đã nạp. Hướng dẫn bài trong fixture được viết ngắn để demo hình dạng response. Dữ liệu thật giữ nguồn và giấy phép theo [DATA-SOURCES.md](../docs/DATA-SOURCES.md).

## 5. Điểm cần cả nhóm review

1. Hiếu đang có ví dụ `WeekPlanItem.payload.exercises[].exerciseId` là slug. D2 theo plan dùng UUID; cần map khi dựng ngữ cảnh BYOAI/nhận kế hoạch. Không âm thầm đổi payload do Hiếu sở hữu.
2. Payload workout của WeekPlan hiện mở (`additionalProperties: true`). Khi triển khai `:accept`, cần schema theo từng `kind`, kiểm Exercise UUID và ràng buộc trước transaction; mục tiêu tập không được coi là hiệp đã thực hiện.
3. Chốt cách liên kết item đã nhận với bản ghi tạo ra và ràng buộc duy nhất để `:accept` không tạo trùng. ERD chưa giả định FK đa hình đã tồn tại.
4. Chốt tính năng BYOAI `:import` và cập nhật root OpenAPI trước code. Dũng không triển khai connector, inference hoặc sửa phần API của Hiếu trong PR này.
5. ERD cần Cảnh/Hiếu duyệt trường riêng từng module trước khi tạo Alembic migration. Quan hệ nhiều-người-dùng chia sẻ và Finance nằm ngoài MVP.

## 6. Nguồn kỹ thuật

- Plan nhóm: [plan.md](../plan.md), OpenAPI thực tế trong [api/openapi.yaml](../api/openapi.yaml).
- [OpenAPI 3.0.3](https://spec.openapis.org/oas/v3.0.3.html): Path Item, Schema, Reference, Example và Header Object.
- [Swagger UI configuration](https://swagger.io/docs/open-source-tools/swagger-ui/usage/configuration/): `url`, `dom_id`, `validatorUrl`, `persistAuthorization`.
- [Prism mock documentation](https://docs.stoplight.io/docs/prism/): mock request/response theo hợp đồng; không thay backend lưu dữ liệu.
