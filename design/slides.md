# Hai slide của Dũng — Tuần 12

Nội dung dùng để ghép vào bộ slide chung. Hai slide chỉnh sửa được đã được tạo trong cuộc trò chuyện Codex này; có thể xuất PowerPoint từ khung trình chiếu. Ảnh xem trước trong [slides/slide-1.png](slides/slide-1.png) và [slides/slide-2.png](slides/slide-2.png). Sơ đồ đầy đủ vẫn có nguồn Mermaid để cả nhóm sửa.

## Slide 1 — Resource Model của UP

Consumer làm việc với resource JSON qua `/api/v1`.

- User: `/users/me`.
- Planner: Task, Event.
- Fitness: WorkoutSession, WorkoutSet, Exercise.
- Nutrition: MealLog, Food, NutritionProfile, NutritionTarget.
- Weekly Planner: WeekPlan và `items[]`.

`WorkoutSession` chứa `sets[]` để consumer xem một buổi tập. Exercise/Food là thư viện chung. NutritionTarget do code tính từ hồ sơ.

Lời trình bày gợi ý:

“Resource Model mô tả những gì client nhìn thấy qua API. Người dùng có công việc, sự kiện, buổi tập, nhật ký ăn và kế hoạch tuần. Khi xem một buổi tập, client nhận luôn các hiệp trong `sets`, không cần biết dữ liệu nằm ở những bảng nào. Exercise và Food dùng chung, còn dữ liệu cá nhân được kiểm quyền theo tài khoản. NutritionTarget là kết quả tính từ hồ sơ, dù vẫn có URI riêng để client đọc.”

## Slide 2 — ERD và cách ánh xạ resource

Ví dụ Fitness:

- Một Exercise có thể xuất hiện trong 0..n WorkoutSet.
- Một WorkoutSession chứa 0..n WorkoutSet.
- Mỗi WorkoutSet có FK tới đúng một session và một exercise.
- API trả `WorkoutSession.sets[]` từ hai bảng liên quan.
- NutritionTarget và totalVolumeKg là giá trị tính, không có bảng tổng riêng.

Lời trình bày gợi ý:

“Ở database, một buổi và các hiệp được lưu thành hai bảng riêng. Mỗi hiệp giữ khóa ngoại tới buổi và bài tập, còn quyền sở hữu nằm trên buổi. Buổi mới hoặc kế hoạch vừa nhận có thể chưa có hiệp. Khi thêm hiệp, backend kiểm ETag và ghi trong transaction để không ghi đè hoặc thêm trùng do retry. Tổng khối lượng do code tính: 10 lần với 50 kg tương ứng 500 kg khối lượng tập. Đây là thiết kế logic; kiểm thử database thật thuộc giai đoạn backend.”

Nguồn nội dung: [plan.md](../plan.md), [design.md](design.md), [resource-model.mmd](resource-model.mmd), [erd.mmd](erd.mmd), [Fitness schema](../api/schemas/fitness.yaml).
