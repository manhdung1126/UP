# Lộ trình dài hạn UP — FastAPI, BYOAI và Virtual Trainer

Trạng thái: đề xuất cập nhật ngày **25/11/2026**, chờ nhóm review qua PR; chưa phải tính năng đã triển khai. MVP môn SOA Tuần 12–15 và phân công chính thức nằm ở [plan.md](plan.md), có ưu tiên khi phạm vi hai tài liệu khác nhau.

Tài liệu này định hướng Super App dài hạn. **[CHỜ NHÓM GÓP Ý]** đánh dấu lựa chọn chưa chốt; các ước lượng và chỉ tiêu dưới đây là mục tiêu cần đo. Không merge `main` tự động.

## 1. Mục tiêu

UP hướng tới nền tảng quản lý cá nhân cho năm mảng: **công việc**, **học tập**, **thu chi**, **tập luyện**, **chế độ ăn**. Backend FastAPI giữ dữ liệu, công cụ và nghiệp vụ; BYOAI cho người dùng sử dụng trợ lý AI của họ qua phương thức được hỗ trợ. Hai loại AI có trách nhiệm riêng:

1. **Perception AI / Virtual Trainer:** MediaPipe, góc khớp, state machine đếm rep và SVM nhận diện tên bài từ base AI Trainer. Không cần LLM trong vòng lặp camera.
2. **Reasoning AI / BYOAI:** giải thích số liệu đã tính, đề xuất lịch, dinh dưỡng và nhận xét sau hiệp. Kết quả luôn là bản nháp chờ người dùng duyệt.

Mục tiêu ưu tiên tận dụng gói AI sẵn có qua cơ chế chính thức; không bắt buộc mua API credits. Khi chưa có connector phù hợp, dùng xuất prompt/nhập JSON, local tùy thiết bị hoặc mock cho demo.

Tiêu chí MVP môn học theo `plan.md`:

- Đăng nhập, Planner, Fitness tracking, Nutrition và Weekly Planner; dữ liệu lưu bền, cách ly giữa người dùng.
- Demo UC5 trọn vẹn bằng Mock Provider, kiểm schema/ràng buộc và xác nhận; có đường BYOAI xuất/nhập mà không cần API trả phí.
- Frontend xây lại có kiểm soát; mock phải được ghi rõ trong demo/báo cáo.

Finance, học tập mở rộng, connector subscription/MCP/local và trainer tích hợp đầy đủ là các giai đoạn sau hoặc PoC được duyệt riêng; không yêu cầu đủ năm mảng trong Tuần 12–15.

## 2. Hiện trạng

| Thành phần | Trạng thái |
| --- | --- |
| Lịch trong ngày | Giao diện chạy, dữ liệu mẫu trong bộ nhớ |
| Công việc | Thêm và tick xong, mất khi tải lại |
| Tập luyện | Thư viện 939 bài, 45 video, 10 model 3D, ghi hiệp tập (chưa lưu) |
| Ghi chú, Thu chi | Chỉ có giao diện mẫu |
| AI | Giao diện mẫu, nút bị tắt |
| Backend, đăng nhập, cơ sở dữ liệu | Chưa có |

Bảng trên ghi hiện trạng prototype theo tài liệu trong repo, chưa phải audit toàn bộ giao diện. Frontend HTML/CSS/JS sinh từ AI trong `docs/` được giữ làm tham khảo. Xây lại theo vertical slice auth → planner → fitness → nutrition → week-plan, mỗi bước có review và kiểm thử. Ưu tiên JS module và một API client chung; chỉ đổi framework khi nhóm nêu rõ lợi ích.

**[CHỜ NHÓM GÓP Ý]** đề xuất mã mới ở `frontend/`, giữ Pages hiện tại đến khi thống nhất nơi triển khai. PR plan không sửa frontend hoặc cấu hình hosting.

## 3. Nguyên tắc thiết kế (bám theo bài học SOA)

| Nguyên tắc | Áp dụng | Bài học |
| --- | --- | --- |
| Thiết kế hợp đồng trước | Viết OpenAPI cho từng service trước khi code, kiểm bằng Spectral | Tuần 4 |
| Resource rõ ràng | Danh từ số nhiều, quan hệ lồng nhau tối đa một cấp | Tuần 3, 5 |
| Lỗi chuẩn | RFC 7807 `application/problem+json` cho mọi lỗi | Tuần 2 |
| Phân trang, lọc, sắp xếp | Một mẫu chung cho mọi danh sách | Tuần 5 |
| Điều kiện cập nhật | ETag và `If-Match` để tránh ghi đè khi sửa trên hai thiết bị | Tuần 2 |
| Xác thực, phân quyền | JWT ngắn hạn kèm refresh token, mỗi bản ghi thuộc một `user_id` | Tuần 6 |
| Backend theo lớp | FastAPI/APIRouter, Pydantic, SQLAlchemy 2.x, Alembic, Uvicorn; vận dụng phân lớp và DI | Tuần 7, cần học stack mới |
| Chạy được ở mọi nơi | Docker Compose, PostgreSQL, endpoint `/healthz` và `/ready` | Tuần 7 |
| Kiểm thử nhiều tầng | pytest, Newman/Postman, Spectral, thử tải | Tuần 8 |
| Phiên bản | Tiền tố `/api/v1`, quy tắc phá vỡ hợp đồng rõ ràng | Tuần 9 |

## 4. Kiến trúc đề xuất

Core dùng **modular monolith FastAPI**, một process API và PostgreSQL. Ranh giới identity/planner/fitness/nutrition/plans giữ rõ; finance và học tập mở rộng sau MVP. BYOAI là lớp tích hợp, trainer là runtime cục bộ cho PoC; chưa cần API gateway, Redis hay worker riêng nếu chưa có nhu cầu.

```
Frontend mới (JS module; docs/ là prototype)
  └─ HTTPS + JWT → FastAPI /api/v1
       ├─ identity, planner, fitness, nutrition, plans (APIRouter)
       ├─ finance / study (sau MVP)
       ├─ BYOAI: mock + xuất prompt/nhập JSON
       │         └─ subscription chính thức / MCP / Local LLM (PoC)
       └─ SQLAlchemy 2.x + Alembic → PostgreSQL

Camera → Trainer cục bộ: MediaPipe + RepCounter + SVM
       └─ tóm tắt hiệp được người dùng duyệt → Fitness API
```

Quy tắc chung:

- Module sở hữu model/nghiệp vụ riêng, gọi nhau qua hàm dịch vụ có hợp đồng; không truy cập bảng chéo. HTTP/OpenAPI dùng cho client ngoài hoặc khi tách process, không ép HTTP nội bộ.
- Spec `api/openapi.yaml` viết trước là nguồn hợp đồng; OpenAPI do FastAPI sinh phải được đối chiếu. Pydantic alias, lỗi RFC 7807, mã HTTP, ETag/If-Match và security không được lệch.
- Session DB theo request qua `Depends`; không chia sẻ session toàn cục hoặc đặt I/O đồng bộ trực tiếp trong route bất đồng bộ.
- AI không ghi thẳng dữ liệu nghiệp vụ. Sau xác nhận, luồng accept gọi nghiệp vụ các module trong transaction, kiểm lại quyền/phiên bản/ràng buộc và ngăn tạo trùng khi retry.
- Tiền dùng số nguyên theo đơn vị nhỏ nhất (VND không có phần lẻ). Thời gian lưu UTC, hiển thị theo múi giờ người dùng, mặc định Asia/Ho_Chi_Minh.
- Đường core và health/readiness không phụ thuộc LLM, subscription hoặc camera; khi AI lỗi vẫn ghi tập/lịch/ăn thủ công.

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

## 6. Tích hợp AI — BYOAI và Virtual Trainer

### 6.1 BYOAI

Code tính số; LLM giải thích và đề xuất. Kcal, macro, tổng chi, góc khớp do code tính, đầu ra LLM kiểm Pydantic và ràng buộc nghiệp vụ. JSON sai không được ghi; connector tự động có thể thử lại tối đa 2 lần, xuất/nhập trả lỗi để người dùng sửa. Không tự đổi sang API tính phí.

| Phương thức | Ưu tiên | Giới hạn |
| --- | --- | --- |
| Mock Provider | Bắt buộc CI/demo | Không cần tài khoản/khóa; phải ghi rõ dữ liệu giả |
| Xuất prompt / nhập JSON | Đường BYOAI tối thiểu | Người dùng tự dùng trợ lý đang có; xem trước dữ liệu xuất, backend kiểm JSON và chờ xác nhận |
| Subscription qua cơ chế chính thức, ví dụ Sign in with ChatGPT | **[CHỜ NHÓM GÓP Ý]**, PoC trước | Kiểm quyền inference, điều kiện ứng dụng, gói/khu vực và local/self-hosted/hosted; không coi OAuth đăng nhập là đủ |
| MCP để AI bên ngoài dùng công cụ UP | **[CHỜ NHÓM GÓP Ý]** | Client/gói cần hỗ trợ; bắt đầu chỉ đọc theo tài khoản. MCP không tự cấp LLM hoặc hạn mức subscription |
| Local LLM, ví dụ Ollama | **[CHỜ NHÓM GÓP Ý]** | Không phí token, nhưng có chi phí phần cứng, điện và giới hạn hiệu năng |
| API key trả phí | Tùy chọn sau khi nhóm chọn ngân sách | Không nằm trên đường chạy bắt buộc, không làm fallback tự động |

ChatGPT Plus/Pro, Google AI Pro hoặc gói khác không mặc nhiên cấp API credits cho UP. Chưa xác nhận connector nào hoạt động ở bản web công khai. Hiếu ghi tài liệu chính thức, ngày kiểm tra, gói, khu vực, loại triển khai, quyền và kết quả PoC trước khi cam kết; không dựa riêng vào mô tả từ hội thoại.

Chỉ dùng cơ chế tích hợp chính thức. Không lấy cookie/session token trình duyệt, API nội bộ hoặc tự động hóa web chat để inference. Token chính thức lưu an toàn ở backend/runtime được cấp quyền, có thu hồi; không đưa credential vào frontend/repo/log.

Gửi tối thiểu dữ liệu, không gửi tên/email hoặc video; người dùng chọn phần cho phép chia sẻ và có thể ngắt kết nối. Hạn mức/rate limit áp dụng cho mọi phương thức; chỉ ghi token/chi phí khi nhà cung cấp thực sự trả dữ liệu đó, không coi giá trị không biết là 0. Core tiếp tục hoạt động khi AI hết hạn mức.

### 6.2 Virtual Trainer

Nguồn: [Tri_Tue_Nhan_Tao](https://github.com/24021368-DucAnh/Tri_Tue_Nhan_Tao), khảo sát tại commit [`0d08d3d`](https://github.com/24021368-DucAnh/Tri_Tue_Nhan_Tao/tree/0d08d3d67bb5a3f88aafa9873782da517f103c7c), thư mục `ai_trainer/ai_trainer/`. Đã đọc mã, chưa chạy hay chứng minh độ chính xác.

| Nguồn | Dùng làm base | Việc cần làm trước tích hợp |
| --- | --- | --- |
| `pose_extractor.py` | MediaPipe, 33 landmark × 4 = 132 features, smoothing/normalize | Kiểm phiên bản runtime và timestamp tăng dần, độ tin cậy landmark |
| `exercise_logic.py`, `config.py` | Góc 2D, RepCounter/state machine, SessionManager, luật 7 bài | Audit import/config, ngưỡng theo góc quay, mất pose, đếm một/hai bên; chưa phải bộ đánh giá an toàn tư thế |
| `workout_plans.py` | WorkoutSession quản lý combo/rep/set | Map bài nguồn sang Exercise ID, tách trạng thái phiên và UI |
| `train_svm.py`, `models/svm_model.pkl` | SVM + StandardScaler nhận diện tên bài | Kiểm feature pipeline và model; tập đánh giá tách theo clip/người, tránh trộn frame cùng video giữa train/test |
| `main.py` | Webcam/HUD OpenCV | Tham khảo desktop; không thể gắn nguyên vào frontend web |

**Tầng 1 — Perception, [CHỜ NHÓM GÓP Ý]:**

1. Dũng làm PoC Python cục bộ cho 1–2 bài (đề xuất squat, bicep curl), chọn bài thủ công trước; SVM nhận diện tự động đánh giá riêng.
2. Tách lõi pose/rep/session khỏi UI sau audit; xác nhận Python/MediaPipe/dependency trên máy đích. Chỉ nạp pickle đã kiểm soát nguồn, không nhận model tùy ý từ người dùng.
3. Khi confidence thấp/mất pose, tạm dừng đếm và hướng dẫn chỉnh camera; cho người dùng sửa số trước lưu. Xuất tóm tắt hiệp vào Fitness API qua JSON là đường đầu tiên, metadata mới cần spec được duyệt.
4. Sau PoC mới chọn port sang MediaPipe web hay runtime cục bộ kết nối có xác thực. Chỉ tóm tắt được gửi lên UP; video giữ trên thiết bị. Không mở dịch vụ localhost không xác thực hoặc cho origin tùy ý.

**Tầng 2 — Reasoning:** Hiếu dùng số liệu đã kiểm (bài, rep/set, góc, thời gian, giới hạn chất lượng) để tạo nhận xét sau hiệp qua BYOAI. Đây là tính năng tùy chọn; đếm rep và lưu buổi tập vẫn hoạt động khi LLM không có. LLM không xử lý từng frame hoặc tự xác nhận dữ liệu.

Mục tiêu mở rộng sau PoC: 3–5 bài; độ chính xác đếm rep ≥ 90% trên bộ clip độc lập và ≥ 15 khung/giây trên thiết bị được ghi rõ. Đây là mục tiêu đề xuất, chưa đạt; nhóm cần chốt cách tính sai số rep, dữ liệu và máy đo trước thử. Không suy từ accuracy nhận diện SVM sang độ chính xác đếm rep hay chấm tư thế.

README nguồn ghi MIT nhưng cây khảo sát chưa có file LICENSE: xác nhận quyền mã/model/video, nguồn dữ liệu và credit trước sao chép/phân phối. Công cụ chỉ hỗ trợ tập luyện; góc quay/ánh sáng gây sai số, không thay huấn luyện viên, không tư vấn y tế khi người dùng báo đau. Những lỗi tư thế chưa có luật được kiểm chứng phải hiện chưa hỗ trợ.

### 6.3 Cân đối dinh dưỡng và chế độ ăn
- **Ghi món bằng lời**: "sáng nay ăn 2 trứng và bát phở bò". LLM tách thành món và khẩu phần ước lượng, server đối chiếu với cơ sở dữ liệu thực phẩm để lấy số liệu. Món không khớp thì hỏi lại người dùng, không tự đoán.
- **Đánh giá ngày hoặc tuần**: code tính tổng, LLM nhận xét thiếu hoặc thừa gì và gợi ý món bù.
- **Tạo thực đơn tuần**: đầu vào là mục tiêu kcal và macro, dị ứng, món kiêng, ngân sách, thời gian nấu, lịch tập. LLM chọn món từ danh sách thực phẩm có sẵn. Server kiểm tra tổng kcal và macro nằm trong biên cho phép (ví dụ ±5%), lệch thì yêu cầu LLM sửa.
- **Rào chắn an toàn**: không đề xuất dưới mức kcal tối thiểu an toàn, không tư vấn cho trẻ em, người mang thai, người có bệnh lý. Mọi màn hình dinh dưỡng có dòng "không thay thế tư vấn của bác sĩ hoặc chuyên gia dinh dưỡng". Người dùng khai báo bệnh lý thì chỉ hiện chế độ theo dõi, không tạo thực đơn.

### 6.4 Kịch bản tuần
Luồng dài hạn gộp dữ liệu từ các module đã triển khai:

1. Đầu vào: việc đến hạn, ưu tiên, lịch cố định, mục tiêu học tuần, lịch tập, mục tiêu dinh dưỡng, ngân sách còn lại, giờ ngủ.
2. `plans` dựng ngữ cảnh gọn, nhận JSON qua BYOAI hoặc mock thành **bản nháp**. MVP chỉ gộp việc, lịch, tập, ăn; giờ học và giới hạn chi tiêu thêm khi các module tương ứng đã có.
3. Server kiểm tra ràng buộc: không trùng giờ, không quá tải mỗi ngày, có nghỉ, đủ giờ ngủ.
4. Client hiện bản nháp cạnh lịch hiện tại. Người dùng sửa, chọn từng mục hoặc nhận tất cả.
5. Mục được nhận mới ghi qua nghiệp vụ planner, fitness, nutrition trong transaction; kiểm quyền/phiên bản và không tạo trùng khi nhận lại. Cuối tuần có báo cáo kế hoạch so với thực tế khi đủ dữ liệu.

MVP dùng `/week-plans` và `/{id}:accept` như `plan.md`; xuất/nhập JSON và trạng thái cần duyệt spec. Không tạo một luồng `/ai/week-plans` thứ hai.

## 7. Mô hình dữ liệu (bản phác)

| Service | Bảng chính |
| --- | --- |
| identity | `users`, `refresh_tokens`, `user_settings` (múi giờ, bật tắt AI) |
| planner | `projects`, `tasks`, `events`, `notes`, `note_tags`, `study_goals`, `study_sessions`, `flashcards` |
| finance | `accounts`, `categories`, `transactions`, `budgets`, `recurring_rules` |
| fitness | `exercises`, `routines`, `workout_sessions`, `workout_sets`, `body_metrics`, `set_feedback` |
| nutrition | `foods`, `food_servings`, `nutrition_profiles`, `meal_logs`, `meal_log_items`, `meal_plans`, `meal_plan_items` |
| plans / BYOAI | MVP: `week_plans`, `week_plan_items`; metadata nguồn/phương thức, trạng thái. Sau MVP có thể thêm `ai_requests` (token/chi phí nếu biết); không tạo `ai_drafts` trùng trách nhiệm |

Dữ liệu riêng có `user_id`, timestamp và `version` cho ETag; thư viện dùng chung như exercises/foods phân biệt với bản ghi cá nhân. Khi mở rộng lưu tóm tắt trainer cần chốt đơn vị, chất lượng và mapping bài, không lưu video mặc định. Xóa mềm cho công việc, ghi chú, giao dịch theo chính sách được duyệt.

## 8. API (bản phác, tiền tố `/api/v1`)

| Nhóm | Ví dụ endpoint |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| Planner | `/tasks`, `/events`, `/projects`, `/notes`, `/study-goals`, `/study-sessions` |
| Finance | `/accounts`, `/transactions`, `/categories`, `/budgets`, `GET /reports/monthly?month=2026-12` |
| Fitness | `/exercises`, `/routines`, `/workout-sessions`, `/workout-sessions/{id}/sets`, `/body-metrics` |
| Nutrition | MVP: `/foods`, `/meal-logs`, `/nutrition-profile`, `GET /nutrition-profile/targets`; sau MVP: `/meal-plans` |
| Plans | MVP: `POST /week-plans`, `GET /week-plans/{id}`, `POST /week-plans/{id}:accept`; `POST /week-plans/{id}:import` chờ duyệt như `plan.md` |
| AI mở rộng | Đề xuất sau MVP: `POST /ai/meal-plans`, `/ai/meal-parse`, `/ai/set-feedback`, `/ai/finance-summary`; schema và cơ chế nhận bản nháp cần design review |

Hành động không thuần CRUD dùng hậu tố `:động_từ`. Mọi danh sách hỗ trợ `page`, `size`, `sort`, lọc theo trường. Mọi lỗi theo RFC 7807.

## 9. Lộ trình

Nhóm hiện có Dũng, Hiếu, Cảnh. Giữ nguyên ownership trong `plan.md`:

| Thành viên | Phần tiếp tục sở hữu | Mở rộng đề xuất, chưa là cam kết |
| --- | --- | --- |
| Cảnh | Identity, Planner, khung OpenAPI, lỗi/phân trang/ETag, CI Spectral | Hỗ trợ chuẩn API/quyền cho connector; người sở hữu Finance cần nhóm chốt |
| Dũng | Fitness, frontend/tích hợp API, Swagger UI/mock | Virtual Trainer, camera UX, map bài và tóm tắt hiệp |
| Hiếu | Nutrition, Weekly Planner, BYOAI/LLM adapter, prompt/schema | Connector subscription chính thức, MCP/local, nhận xét sau hiệp |

**[CHỜ NHÓM GÓP Ý]** Mỗi giai đoạn có bản chạy được và PR riêng; ước lượng sau MVP tính theo nhóm nhỏ bán thời gian, không phải hạn nộp đã chốt. Kế hoạch Tuần 12–15 ở `plan.md` có ưu tiên.

| Giai đoạn | Nội dung | Bằng chứng cần có | Ước lượng |
| --- | --- | --- | --- |
| 0. MVP môn học | Thiết kế/mock Tuần 12; FastAPI/DB/Alembic và auth/planner Tuần 13; fitness/nutrition/UC5 mock + xuất/nhập Tuần 14; kiểm thử/hoàn thiện Tuần 15 | Spec hợp lệ, API khớp hợp đồng, phân quyền, lưu bền, accept không trùng, demo không API key | Theo Tuần 12–15 |
| 1. Củng cố frontend | Hoàn thiện từng slice, thay dữ liệu mẫu và xử lý lỗi, kiểm trên điện thoại/máy tính | Tải lại còn dữ liệu, điều hướng và trạng thái lỗi dùng được | 1–2 tuần |
| 2. Fitness mở rộng | Routine, lịch tập, kỷ lục, số đo cơ thể | Lịch sử và tổng khối lượng khớp dữ liệu thật | 2 tuần |
| 3. Finance | Ngân sách, báo cáo, nhập CSV; chốt owner trước | Báo cáo khớp tổng kiểm tay, nhập lại không trùng | 2 tuần |
| 4. Nutrition mở rộng | Mở rộng thực phẩm, thực đơn/danh sách đi chợ | Công thức/đơn vị đúng, kiểm dị ứng và biên số liệu | 2–3 tuần |
| 5. Học tập và ghi chú | Mục tiêu, phiên học, tìm kiếm | Tổng giờ tuần đúng dữ liệu | 1–2 tuần |
| 6. BYOAI nâng cao | PoC một connector chính thức hoặc MCP/local trước, không làm tất cả | Điều kiện provider được xác minh; mất kết nối/hết hạn mức có fallback không tính phí API | 1–2 tuần cho PoC, ước lượng lại sau đo |
| 7. Weekly Planner mở rộng | Thêm học/thu chi khi dữ liệu sẵn có, nhận từng mục | Không trùng lịch, không vượt quyền, retry không trùng | 2 tuần |
| 8. Virtual Trainer | PoC local 1–2 bài trước; tích hợp 3–5 bài/browser sau khi đo | Clip độc lập, sai số rep/FPS theo thiết bị, mất pose an toàn, người dùng duyệt số trước lưu | 1–2 tuần PoC; 3–4 tuần tích hợp sau duyệt |
| 9. Hoàn thiện dài hạn | Tải, bảo mật, backup, Web Push/PWA khi cần | Báo cáo, lỗi còn mở, hướng dẫn chạy và phục hồi | 2 tuần |

PoC giai đoạn 6/8 có thể thử sớm khi MVP không bị chậm, cần nhóm duyệt riêng. Finance/học tập không chặn UC5 môn học. Giữ mock/xuất-nhập làm đường demo khi connector chưa đạt; không tự chuyển sang API trả phí.

## 10. Kế hoạch kiểm thử

- **Hợp đồng**: Spectral lint cho OpenAPI, Newman chạy bộ Postman trong CI.
- **Đơn vị và tích hợp**: pytest, mỗi test dùng DB riêng; migration/transaction/ETag chạy PostgreSQL, không suy từ SQLite. Kiểm công thức dinh dưỡng, ngân sách, ràng buộc lịch và nhận bản nháp lặp/đồng thời không tạo trùng.
- **Phân quyền**: bộ test bắt buộc "người dùng A đọc, sửa, xóa dữ liệu của B phải bị từ chối" cho mọi resource.
- **BYOAI**: golden set kiểm schema/ràng buộc, không so chữ. CI mock không cần API key; thử JSON sai/ID người khác/prompt injection, token hết hạn, provider lỗi, ngắt kết nối và chế độ không AI. PoC thật ghi provider, gói/khu vực, hạn mức, điều kiện ứng dụng; test xuất/nhập không gọi endpoint tính phí.
- **Trainer**: bộ thử đề xuất 20–30 clip có đếm tay, góc đúng/sai, mất pose và hai bên cơ thể; độc lập với train theo clip/người. Đo nhận diện SVM, sai số rep và FPS riêng từng bài/máy. Chỉ đo phát hiện lỗi tư thế khi có luật và nhãn kiểm chứng; không công bố chỉ tiêu đã đạt khi chưa đo.
- **Tải**: thử các endpoint danh sách và plans/BYOAI để kiểm tra hạn mức, độ trễ và lỗi phục hồi.
- **Khả năng truy cập**: giữ chuẩn hiện có (focus, thông báo cho trình đọc màn hình, tương phản).

## 11. Bảo mật và quyền riêng tư

- Mật khẩu băm bằng Argon2 hoặc bcrypt, JWT truy cập sống ngắn, refresh token xoay vòng và thu hồi được.
- HTTPS bắt buộc, CORS chỉ cho domain của app, giới hạn tốc độ đăng nhập.
- Kiểm tra đầu vào và JSON nhập ở biên bằng Pydantic; escape đầu ra frontend và review lại từng luồng mới.
- Kết nối AI/MCP tách quyền theo tài khoản UP, tối thiểu quyền, thu hồi được; không thu mật khẩu/cookie AI. Runtime trainer cục bộ nếu có cần giới hạn origin và xác thực, không upload video mặc định.
- Dữ liệu sức khỏe và tài chính là dữ liệu nhạy cảm: mã hóa khi lưu ở mức đĩa, sao lưu mã hóa, cho phép xuất và xóa toàn bộ dữ liệu của người dùng.
- Prompt injection: nội dung do người dùng nhập (ghi chú, mô tả giao dịch) đưa vào LLM luôn được đánh dấu là dữ liệu, đầu ra LLM không bao giờ được thực thi trực tiếp, chỉ qua kiểm tra schema rồi chờ người dùng xác nhận.
- Nhật ký không ghi nội dung prompt chứa dữ liệu cá nhân ở môi trường chạy thật.

## 12. Rủi ro

| Rủi ro | Mức | Cách giảm |
| --- | --- | --- |
| Phạm vi quá rộng so với nhân lực | Cao | Làm theo giai đoạn, mỗi giai đoạn có bản chạy được, cắt giai đoạn 5 và 8 trước nếu trễ |
| Nhận xét tư thế sai gây chấn thương | Cao | Luật bảo thủ, chỉ vài bài, cảnh báo giới hạn, không tư vấn khi có đau |
| LLM đưa số dinh dưỡng sai | Cao | Số do code tính, LLM chỉ chọn món từ dữ liệu có sẵn, kiểm tra biên sau khi sinh |
| Subscription/connector không khả dụng hoặc đổi điều kiện | Cao | PoC chính thức, không hứa hỗ trợ mọi gói/khu vực; mock/xuất-nhập luôn có, không tự gọi API tính phí |
| Trainer Python khác runtime web, dependency/giấy phép chưa rõ | Cao | Local PoC, audit mã/model/video, đo độc lập trước port browser |
| Giấy phép dữ liệu thực phẩm, bài tập, media | Trung bình | Ghi nguồn và giấy phép từng bộ (đã làm cho bài tập), kiểm tra trước khi nạp |
| Tách service sớm làm chậm | Trung bình | Bắt đầu bằng modular monolith, tách khi có lý do đo được |
| Hiệu năng pose trên máy yếu | Trung bình | Chọn mô hình nhẹ, hạ độ phân giải, có chế độ tắt phân tích |

## 13. Quyết định chờ nhóm góp ý

Tất cả mục dưới đây mang trạng thái **[CHỜ NHÓM GÓP Ý]**, đối chiếu Q1–Q7 trong `plan.md`:

1. Giữ MVP 5 UC và hạn Tuần 12 là 25/11/2026; mốc nộp Tuần 13–15 theo giảng viên là ngày nào? Chưa biến lộ trình dài hạn thành deadline môn học.
2. Chi tiết stack FastAPI/Pydantic/SQLAlchemy/Alembic, phiên bản tương thích và cách kiểm spec viết trước với runtime.
3. Duyệt BYOAI xuất/nhập, trạng thái và operation `:import`; chọn một PoC connector subscription chính thức, MCP hoặc local. Ai dùng gói/khu vực nào và kiểu triển khai nào để thử? Hiếu chuẩn bị; chưa chốt provider hay ngân sách API trả phí.
4. Dũng đề xuất `frontend/` mới, giữ `docs/` làm prototype; nơi deploy core/DB/frontend và repo nộp nhóm cần thống nhất trước thay hosting.
5. PoC trainer 1–2 bài nào, máy/clip/quy ước rep nào, quyền tái sử dụng ai xác minh? Dũng chuẩn bị; Hiếu nối nhận xét sau hiệp. Browser hay runtime bridge chỉ chốt sau kết quả PoC.
6. Nguồn thực phẩm, ngưỡng an toàn và phạm vi tư vấn dinh dưỡng cần kiểm; số lượng món/biên ±5% là mục tiêu thử, không phải bằng chứng y tế.
7. Thứ tự mở rộng và owner Finance/học tập sau MVP; không tự điều chuyển quyền nghiệp vụ hiện tại.

Nhóm góp ý trên PR; sau khi thống nhất mới cập nhật hợp đồng, backlog và triển khai. PR này chỉ sửa `plan.md` và `plan-roadmap.md`, không merge `main`.
