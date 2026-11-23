# Kế hoạch phát triển UP

Trạng thái: chỉ là kế hoạch, chưa có code mới. Tài liệu này dựa trên hiện trạng trong `docs/` và các bài học SOA (Tuần 1–9).

## 1. Mục tiêu

UP là app cá nhân dùng hằng ngày cho năm mảng: **công việc**, **học tập**, **thu chi**, **tập luyện**, **chế độ ăn**. LLM hỗ trợ ba việc:

1. Đánh giá video tập theo thời gian thực.
2. Cân đối dinh dưỡng và đề xuất chế độ ăn.
3. Lên kịch bản cho cả tuần, gộp việc, học, tập, ăn, tiền.

Tiêu chí thành công của bản đầu tiên (MVP):
- Dữ liệu được lưu bền, không mất khi tải lại trang.
- Một người dùng đăng nhập, dùng đủ năm mảng trên điện thoại và máy tính.
- Ít nhất một luồng LLM chạy trọn vẹn: lên kịch bản tuần có xác nhận của người dùng.

## 2. Hiện trạng

| Thành phần | Trạng thái |
| --- | --- |
| Lịch trong ngày | Giao diện chạy, dữ liệu mẫu trong bộ nhớ |
| Công việc | Thêm và tick xong, mất khi tải lại |
| Tập luyện | Thư viện 939 bài, 45 video, 10 model 3D, ghi hiệp tập (chưa lưu) |
| Ghi chú, Thu chi | Chỉ có giao diện mẫu |
| AI | Giao diện mẫu, nút bị tắt |
| Backend, đăng nhập, cơ sở dữ liệu | Chưa có |

Frontend hiện là HTML/CSS/JS thuần, chạy trên GitHub Pages. Giữ nguyên hướng này, không thêm framework trừ khi có lý do rõ.

## 3. Nguyên tắc thiết kế (bám theo bài học SOA)

| Nguyên tắc | Áp dụng | Bài học |
| --- | --- | --- |
| Thiết kế hợp đồng trước | Viết OpenAPI cho từng service trước khi code, kiểm bằng Spectral | Tuần 4 |
| Resource rõ ràng | Danh từ số nhiều, quan hệ lồng nhau tối đa một cấp | Tuần 3, 5 |
| Lỗi chuẩn | RFC 7807 `application/problem+json` cho mọi lỗi | Tuần 2 |
| Phân trang, lọc, sắp xếp | Một mẫu chung cho mọi danh sách | Tuần 5 |
| Điều kiện cập nhật | ETag và `If-Match` để tránh ghi đè khi sửa trên hai thiết bị | Tuần 2 |
| Xác thực, phân quyền | JWT ngắn hạn kèm refresh token, mỗi bản ghi thuộc một `user_id` | Tuần 6 |
| Backend theo lớp | Flask application factory, Blueprint, SQLAlchemy 2.x, Marshmallow, Flask-Migrate | Tuần 7 |
| Chạy được ở mọi nơi | Docker Compose, PostgreSQL, endpoint `/healthz` và `/ready` | Tuần 7 |
| Kiểm thử nhiều tầng | pytest, Newman/Postman, Spectral, thử tải | Tuần 8 |
| Phiên bản | Tiền tố `/api/v1`, quy tắc phá vỡ hợp đồng rõ ràng | Tuần 9 |

## 4. Kiến trúc đề xuất

Tách theo ranh giới nghiệp vụ, không tách quá nhỏ. Nhóm gồm 1–3 người nên chạy dạng **modular monolith ở giai đoạn đầu** (mỗi service là một Blueprint có schema riêng, không import chéo model), sau đó tách ra process riêng khi cần. LLM và phân tích video tách riêng ngay từ đầu vì khác hẳn về tài nguyên, độ trễ và rủi ro.

```
Trình duyệt (UP web, JS thuần)
  ├─ MediaPipe Pose chạy trong trình duyệt (video không rời máy)
  └─ gọi HTTPS
API Gateway (Flask hoặc Nginx): xác thực JWT, giới hạn tốc độ, định tuyến /api/v1/*
  ├─ identity-service   : đăng ký, đăng nhập, token, hồ sơ
  ├─ planner-service    : công việc, lịch, ghi chú, học tập
  ├─ finance-service    : tài khoản, giao dịch, ngân sách
  ├─ fitness-service    : thư viện bài tập, buổi tập, số liệu
  ├─ nutrition-service  : thực phẩm, nhật ký ăn, mục tiêu dinh dưỡng, thực đơn
  └─ ai-service         : điều phối LLM, mẫu prompt, kiểm tra đầu ra, ghi chi phí
PostgreSQL (một schema cho mỗi service)   Redis (tùy chọn: cache, hàng đợi, giới hạn tốc độ)
```

Quy tắc chung:
- Service gọi nhau qua HTTP có hợp đồng OpenAPI, không đọc bảng của nhau.
- `ai-service` không ghi thẳng vào dữ liệu của service khác. Nó trả **đề xuất** (bản nháp), người dùng xác nhận thì client mới gọi API ghi.
- Mọi tiền dùng số nguyên theo đơn vị nhỏ nhất (VND không có phần lẻ), không dùng số thực.
- Mọi thời gian lưu UTC, hiển thị theo múi giờ của người dùng (mặc định Asia/Ho_Chi_Minh).

## 5. Các mảng chức năng

### 5.1 Công việc và lịch (planner-service)
- Công việc: tiêu đề, mô tả, dự án, ưu tiên, hạn, ước lượng thời gian, trạng thái, lặp lại.
- Lịch: sự kiện theo ngày, chặn giờ cho công việc, phát hiện trùng giờ, hiện khoảng trống (đã có sẵn trên giao diện).
- Dự án và nhãn để gom việc.
- Pomodoro: ghi thời gian làm thật so với ước lượng.
- Nhắc việc: thông báo trình duyệt (Web Push), làm sau MVP.

### 5.2 Học tập (planner-service)
- Mục tiêu học: tên, hạn, số giờ mục tiêu mỗi tuần.
- Phiên học: ghi thời gian, chủ đề, ghi chú ngắn. Biểu đồ giờ học theo tuần.
- Ghi chú có thẻ và tìm kiếm toàn văn.
- Thẻ ôn tập (flashcard) lặp lại ngắt quãng. LLM tạo thẻ từ ghi chú, người dùng duyệt trước khi lưu. Làm ở giai đoạn sau.

### 5.3 Thu chi (finance-service)
- Tài khoản (tiền mặt, ngân hàng, ví), danh mục, giao dịch thu, chi, chuyển khoản.
- Ngân sách tháng theo danh mục, cảnh báo khi vượt 80% và 100%.
- Giao dịch định kỳ (tiền nhà, học phí).
- Nhập CSV sao kê, loại bỏ trùng bằng khóa mờ (ngày, số tiền, mô tả).
- Báo cáo tháng: tổng thu chi, theo danh mục, xu hướng 6 tháng.
- LLM gợi ý danh mục cho giao dịch mới và tóm tắt chi tiêu tháng. Số liệu do code tính, LLM chỉ viết lời diễn giải.

### 5.4 Tập luyện (fitness-service)
- Giữ thư viện bài tập hiện có (nạp vào cơ sở dữ liệu, giữ nguyên credit và giấy phép từng nguồn).
- Buổi tập: danh sách bài, hiệp, kg, số lần, RPE, ghi chú. **Lưu thật** thay vì dữ liệu mẫu.
- Mẫu buổi tập (routine) và lịch tập trong tuần.
- Lịch sử, kỷ lục cá nhân (1RM ước lượng), khối lượng theo nhóm cơ mỗi tuần.
- Đo cân nặng và số đo cơ thể.

### 5.5 Chế độ ăn (nutrition-service)
- Cơ sở dữ liệu thực phẩm: nguồn mở có kiểm tra giấy phép (ví dụ USDA FoodData Central, Open Food Facts), thêm món Việt do nhóm tự nhập.
- Hồ sơ: tuổi, giới, chiều cao, cân nặng, mức vận động, mục tiêu (giảm, giữ, tăng), dị ứng, món kiêng.
- Mục tiêu dinh dưỡng: BMR theo Mifflin-St Jeor, TDEE, chia đạm, béo, tinh bột. **Tính bằng code**, có đơn vị và công thức rõ.
- Nhật ký ăn: món, khẩu phần, bữa. Tổng kcal và macro theo ngày, so với mục tiêu.
- Thực đơn tuần và danh sách đi chợ.
- Nối với tập luyện: ngày tập nặng thì mục tiêu kcal và đạm điều chỉnh.

## 6. Tích hợp LLM (ai-service)

### 6.1 Nguyên tắc chung
1. **Code tính số, LLM giải thích và đề xuất.** Kcal, macro, tổng chi, góc khớp đều do code tính. LLM không được tự bịa số.
2. **Đầu ra có cấu trúc.** LLM trả JSON theo schema, server kiểm tra bằng schema, sai thì thử lại tối đa 2 lần rồi trả lỗi rõ ràng.
3. **Chỉ đề xuất, không tự ghi.** Mọi thay đổi dữ liệu cần người dùng bấm xác nhận.
4. **Quyền riêng tư.** Gửi tối thiểu dữ liệu cần thiết. Không gửi video. Không gửi tên, email. Người dùng bật hoặc tắt từng tính năng AI.
5. **Chi phí và giới hạn.** Hạn mức mỗi người dùng mỗi ngày, ghi số token và chi phí mỗi lần gọi, cache kết quả giống nhau.
6. **Khóa API chỉ nằm ở server.** Không bao giờ đưa khóa xuống trình duyệt.
7. **Nhà cung cấp thay được.** Một lớp adapter, đổi mô hình bằng cấu hình. Đầu ra Claude được dùng làm mặc định, kiểm tra tên mô hình và giá hiện hành trước khi cố định.

### 6.2 Đánh giá video tập theo thời gian thực
LLM **không nằm trong vòng lặp thời gian thực** vì độ trễ, chi phí và quyền riêng tư. Chia hai tầng:

**Tầng 1, trong trình duyệt, theo từng khung hình (mục tiêu ≥ 15 khung/giây):**
- Dùng bộ ước lượng tư thế chạy cục bộ (ví dụ MediaPipe Pose Landmarker bản web). Video không rời máy.
- Tính góc khớp (gối, hông, khuỷu, lưng), đếm lần tập, đo thời gian đi xuống và đi lên.
- Luật kiểm tra tư thế cho một nhóm nhỏ bài ban đầu (squat, hít đất, plank, bench, deadlift Romania). Lỗi hiện ngay trên màn hình, ví dụ "gối đổ vào trong", "lưng cong", "chưa xuống đủ sâu".
- Chỉ bài nào có luật và có thể quay rõ toàn thân mới bật tính năng này. Bài khác hiện "chưa hỗ trợ".

**Tầng 2, sau mỗi hiệp, qua LLM:**
- Client gửi **bản tóm tắt số liệu** của hiệp: bài, số lần, góc nhỏ nhất và lớn nhất mỗi lần, thời gian, danh sách lỗi đã phát hiện. Không gửi video.
- LLM viết nhận xét ngắn và gợi ý cho hiệp sau (giảm tạ, chậm lại, sửa tư thế). Kết quả lưu kèm hiệp tập.
- Tùy chọn sau này: người dùng chủ động gửi 1–3 ảnh chụp tư thế lỗi cho mô hình có khả năng nhìn ảnh, kèm cảnh báo rõ.

Giới hạn cần nói thẳng với người dùng: đây là công cụ hỗ trợ, không thay huấn luyện viên. Góc quay, ánh sáng, quần áo rộng làm sai số liệu. Không đưa ra lời khuyên y tế khi người dùng báo đau.

### 6.3 Cân đối dinh dưỡng và chế độ ăn
- **Ghi món bằng lời**: "sáng nay ăn 2 trứng và bát phở bò". LLM tách thành món và khẩu phần ước lượng, server đối chiếu với cơ sở dữ liệu thực phẩm để lấy số liệu. Món không khớp thì hỏi lại người dùng, không tự đoán.
- **Đánh giá ngày hoặc tuần**: code tính tổng, LLM nhận xét thiếu hoặc thừa gì và gợi ý món bù.
- **Tạo thực đơn tuần**: đầu vào là mục tiêu kcal và macro, dị ứng, món kiêng, ngân sách, thời gian nấu, lịch tập. LLM chọn món từ danh sách thực phẩm có sẵn. Server kiểm tra tổng kcal và macro nằm trong biên cho phép (ví dụ ±5%), lệch thì yêu cầu LLM sửa.
- **Rào chắn an toàn**: không đề xuất dưới mức kcal tối thiểu an toàn, không tư vấn cho trẻ em, người mang thai, người có bệnh lý. Mọi màn hình dinh dưỡng có dòng "không thay thế tư vấn của bác sĩ hoặc chuyên gia dinh dưỡng". Người dùng khai báo bệnh lý thì chỉ hiện chế độ theo dõi, không tạo thực đơn.

### 6.4 Kịch bản tuần
Luồng đầy đủ nhất của app, gom dữ liệu từ mọi service:
1. Đầu vào: việc đến hạn, ưu tiên, lịch cố định, mục tiêu học tuần, lịch tập, mục tiêu dinh dưỡng, ngân sách còn lại, giờ ngủ.
2. `ai-service` dựng ngữ cảnh gọn, gọi LLM, nhận **bản nháp** gồm: các khối giờ làm và học, buổi tập, bữa chính, giới hạn chi tiêu từng ngày.
3. Server kiểm tra ràng buộc: không trùng giờ, không quá tải mỗi ngày, có nghỉ, đủ giờ ngủ.
4. Client hiện bản nháp cạnh lịch hiện tại. Người dùng sửa, chọn từng mục hoặc nhận tất cả.
5. Mục được nhận mới ghi vào planner, fitness, nutrition. Cuối tuần có báo cáo: kế hoạch so với thực tế.

## 7. Mô hình dữ liệu (bản phác)

| Service | Bảng chính |
| --- | --- |
| identity | `users`, `refresh_tokens`, `user_settings` (múi giờ, bật tắt AI) |
| planner | `projects`, `tasks`, `events`, `notes`, `note_tags`, `study_goals`, `study_sessions`, `flashcards` |
| finance | `accounts`, `categories`, `transactions`, `budgets`, `recurring_rules` |
| fitness | `exercises`, `routines`, `workout_sessions`, `workout_sets`, `body_metrics`, `set_feedback` |
| nutrition | `foods`, `food_servings`, `nutrition_profiles`, `meal_logs`, `meal_log_items`, `meal_plans`, `meal_plan_items` |
| ai | `ai_requests` (loại, token, chi phí, trạng thái), `ai_drafts` (đề xuất đã sinh, đã nhận hay chưa) |

Mọi bảng có `id`, `user_id`, `created_at`, `updated_at`, `version` (cho ETag). Xóa mềm cho công việc, ghi chú, giao dịch.

## 8. API (bản phác, tiền tố `/api/v1`)

| Nhóm | Ví dụ endpoint |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Planner | `/tasks`, `/events`, `/projects`, `/notes`, `/study-goals`, `/study-sessions` |
| Finance | `/accounts`, `/transactions`, `/categories`, `/budgets`, `GET /reports/monthly?month=2026-12` |
| Fitness | `/exercises`, `/routines`, `/workout-sessions`, `/workout-sessions/{id}/sets`, `/body-metrics` |
| Nutrition | `/foods`, `/meal-logs`, `/nutrition-profile`, `/meal-plans`, `POST /nutrition/targets:calculate` |
| AI | `POST /ai/week-plans`, `POST /ai/meal-plans`, `POST /ai/meal-parse`, `POST /ai/set-feedback`, `POST /ai/finance-summary`, `POST /ai/drafts/{id}:accept` |

Hành động không thuần CRUD dùng hậu tố `:động_từ`. Mọi danh sách hỗ trợ `page`, `size`, `sort`, lọc theo trường. Mọi lỗi theo RFC 7807.

## 9. Lộ trình

Mỗi giai đoạn kết thúc bằng một bản chạy được. Thời lượng là ước lượng cho nhóm nhỏ làm bán thời gian, điều chỉnh khi có số liệu thật.

| Giai đoạn | Nội dung | Kết quả kiểm tra được | Ước lượng |
| --- | --- | --- | --- |
| 0. Nền tảng | Chốt hợp đồng OpenAPI cho identity và planner, dựng repo backend, Docker Compose, PostgreSQL, CI chạy pytest và Spectral | `docker compose up` chạy, `/ready` trả 200, CI xanh | 1 tuần |
| 1. Đăng nhập và công việc | identity-service, planner (công việc, lịch), nối frontend, thay dữ liệu mẫu bằng API | Tải lại trang không mất việc, người dùng A không thấy dữ liệu của B | 2 tuần |
| 2. Tập luyện thật | Nạp thư viện bài tập vào DB, lưu buổi tập, routine, lịch sử, kỷ lục | Ghi một buổi tập, xem lại ở thiết bị khác | 2 tuần |
| 3. Thu chi | finance-service, ngân sách, báo cáo tháng, nhập CSV | Nhập 100 giao dịch, báo cáo khớp tổng tính tay | 2 tuần |
| 4. Dinh dưỡng cơ bản | nutrition-service, cơ sở dữ liệu thực phẩm, mục tiêu, nhật ký ăn (chưa LLM) | Tổng kcal ngày khớp công thức, lọc dị ứng đúng | 2–3 tuần |
| 5. Học tập và ghi chú | Mục tiêu học, phiên học, ghi chú có thẻ, tìm kiếm | Biểu đồ giờ học theo tuần đúng dữ liệu | 1–2 tuần |
| 6. LLM lớp 1 | ai-service, adapter, kiểm tra schema, hạn mức. Ghi món bằng lời, tóm tắt chi tiêu, thực đơn tuần | Đầu ra qua kiểm tra schema, macro thực đơn lệch ≤ 5% | 2 tuần |
| 7. Kịch bản tuần | Luồng 6.4 đầy đủ, màn hình bản nháp, nhận từng mục | Một tuần mẫu sinh ra không trùng giờ, người dùng nhận được từng phần | 2 tuần |
| 8. Video tập | Pose trong trình duyệt, luật cho 3–5 bài, nhận xét LLM sau hiệp | Đếm lần đúng ≥ 90% trên bộ video thử, ≥ 15 khung/giây trên máy trung bình | 3–4 tuần |
| 9. Hoàn thiện | Thử tải, rà soát bảo mật, sao lưu, Web Push, PWA, tài liệu | Báo cáo kiểm thử, danh sách lỗi mở, hướng dẫn triển khai | 2 tuần |

Thứ tự trên đưa LLM sau khi dữ liệu thật đã có, vì LLM không có gì để phân tích nếu app chưa lưu dữ liệu. Nếu cần demo sớm một tính năng LLM, làm "ghi món bằng lời" hoặc "tóm tắt chi tiêu" trước, vì đơn giản và dễ kiểm.

## 10. Kế hoạch kiểm thử

- **Hợp đồng**: Spectral lint cho OpenAPI, Newman chạy bộ Postman trong CI.
- **Đơn vị và tích hợp**: pytest, mỗi test dùng DB riêng. Có test riêng cho công thức dinh dưỡng, tính ngân sách, kiểm tra ràng buộc lịch.
- **Phân quyền**: bộ test bắt buộc "người dùng A đọc, sửa, xóa dữ liệu của B phải bị từ chối" cho mọi resource.
- **LLM**: bộ ca thử cố định (golden set) cho từng prompt, kiểm tra theo schema và ràng buộc, không so khớp chữ. Chạy lại khi đổi prompt hoặc mô hình. Có nhà cung cấp giả (mock) để CI không tốn tiền.
- **Video**: 20–30 clip thử gồm góc quay đúng và sai, đo độ chính xác đếm lần và phát hiện lỗi, ghi lại kết quả theo từng bài.
- **Tải**: thử tải các endpoint danh sách và `ai-service` để kiểm tra hạn mức.
- **Khả năng truy cập**: giữ chuẩn hiện có (focus, thông báo cho trình đọc màn hình, tương phản).

## 11. Bảo mật và quyền riêng tư

- Mật khẩu băm bằng Argon2 hoặc bcrypt, JWT truy cập sống ngắn, refresh token xoay vòng và thu hồi được.
- HTTPS bắt buộc, CORS chỉ cho domain của app, giới hạn tốc độ đăng nhập.
- Kiểm tra đầu vào ở biên bằng Marshmallow, escape đầu ra ở frontend (đã có).
- Dữ liệu sức khỏe và tài chính là dữ liệu nhạy cảm: mã hóa khi lưu ở mức đĩa, sao lưu mã hóa, cho phép xuất và xóa toàn bộ dữ liệu của người dùng.
- Prompt injection: nội dung do người dùng nhập (ghi chú, mô tả giao dịch) đưa vào LLM luôn được đánh dấu là dữ liệu, đầu ra LLM không bao giờ được thực thi trực tiếp, chỉ qua kiểm tra schema rồi chờ người dùng xác nhận.
- Nhật ký không ghi nội dung prompt chứa dữ liệu cá nhân ở môi trường chạy thật.

## 12. Rủi ro

| Rủi ro | Mức | Cách giảm |
| --- | --- | --- |
| Phạm vi quá rộng so với nhân lực | Cao | Làm theo giai đoạn, mỗi giai đoạn có bản chạy được, cắt giai đoạn 5 và 8 trước nếu trễ |
| Nhận xét tư thế sai gây chấn thương | Cao | Luật bảo thủ, chỉ vài bài, cảnh báo giới hạn, không tư vấn khi có đau |
| LLM đưa số dinh dưỡng sai | Cao | Số do code tính, LLM chỉ chọn món từ dữ liệu có sẵn, kiểm tra biên sau khi sinh |
| Chi phí LLM vượt dự kiến | Trung bình | Hạn mức theo người dùng, cache, mô hình rẻ cho tác vụ đơn giản |
| Giấy phép dữ liệu thực phẩm, bài tập, media | Trung bình | Ghi nguồn và giấy phép từng bộ (đã làm cho bài tập), kiểm tra trước khi nạp |
| Tách service sớm làm chậm | Trung bình | Bắt đầu bằng modular monolith, tách khi có lý do đo được |
| Hiệu năng pose trên máy yếu | Trung bình | Chọn mô hình nhẹ, hạ độ phân giải, có chế độ tắt phân tích |

## 13. Câu hỏi cần nhóm chốt

1. Nhóm bao nhiêu người, thời hạn nộp môn là khi nào? Câu trả lời quyết định có làm cả 9 giai đoạn hay chỉ tới giai đoạn 4 và 7.
2. Một người dùng hay nhiều người dùng? Nếu chỉ dùng cá nhân thì đăng nhập có thể giản lược, nhưng môn SOA đã học Auth nên nên giữ.
3. Nhà cung cấp LLM và ngân sách mỗi tháng là bao nhiêu?
4. Nơi triển khai: máy cá nhân, VPS hay dịch vụ đám mây? Frontend vẫn ở GitHub Pages hay chuyển cùng backend?
5. Dữ liệu thực phẩm: dùng nguồn mở có sẵn hay nhóm tự nhập món Việt trước?
6. Video tập: chấp nhận chỉ vài bài được hỗ trợ ở bản đầu không?
