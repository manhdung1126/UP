# Báo cáo Tiến độ Tuần 12 — Dự án UP (Môn Kiến trúc hướng dịch vụ — SOA)

- **Nhóm thực hiện:** Dũng, Hiếu, Cảnh
- **Ngày báo cáo:** 25/11/2026
- **Người tổng hợp báo cáo:** Hiếu (H5)
- **Repository:** `https://github.com/manhdung1126/UP`
- **Tài liệu chuẩn phạm vi Tuần 12–15:** [plan.md](../plan.md) (cập nhật ngày 25/11/2026 theo hướng **FastAPI + BYOAI + Virtual Trainer PoC**)

---

## 1. Tóm tắt mục tiêu Tuần 12
Tuần 12 tập trung vào giai đoạn **Thiết kế hợp đồng trước (Design-First API)** và thống nhất kiến trúc cho ứng dụng quản lý cá nhân **UP** (hợp nhất Công việc, Lịch, Tập luyện, Dinh dưỡng và Kịch bản tuần theo hướng BYOAI):
1. Xác định rõ bài toán, API consumers, phạm vi **MVP bắt buộc (5 Use Case: `UC1`–`UC5`)**, nhóm mở rộng **[CHỜ NHÓM GÓP Ý]** (PoC Virtual Trainer 1–2 bài, connector subscription/MCP/Local LLM) và ranh giới **Ngoài MVP**.
2. Thiết kế Resource Model, ERD và giải thích sự khác biệt giữa mô hình tài nguyên với lược đồ cơ sở dữ liệu.
3. Xây dựng hợp đồng OpenAPI 3.0.3 viết tay trước tại `api/openapi.yaml`, áp dụng các nguyên tắc SOA (RFC 7807 `application/problem+json`, phân trang `page`/`size`/`sort`, cập nhật an toàn `ETag`/`If-Match`, JWT Bearer, versioning `/api/v1`, giới hạn tốc độ `429` + `Retry-After`).
4. Kiểm tra hợp đồng tự động bằng **Spectral** và chạy thử nghiệm 3 operation trọng tâm của luồng **UC5** trên mock server **Prism** (không cần API key trả phí).

---

## 2. Công việc đã hoàn thành và Bằng chứng (Tuần 12)

### 2.1. Bảng kết quả theo thành viên

| Thành viên | Mã việc | Nội dung đã hoàn thành | Tệp / Bằng chứng trong Repo | Trạng thái |
| :--- | :---: | :--- | :--- | :---: |
| **Cảnh** | C1 | Dựng cấu trúc thư mục `api/`, `design/`, `reports/`, khung `api/openapi.yaml` và các thành phần dùng chung trong `api/components.yaml` (`Problem`, `PageMeta`, `BearerAuth`, `If-Match`, `ETag`, `Retry-After`). | [api/openapi.yaml](../api/openapi.yaml), [api/components.yaml](../api/components.yaml) (nhánh `canh/week12`, commit `273d0f9`) | Hoàn thành |
| **Cảnh** | C2 | Đặc tả OpenAPI cho nhóm `identity` (`/auth/register`, `/auth/login`, `/auth/refresh`, `/users/me`) và `planner` (`/tasks`, `/tasks/{id}`, `/events`). | [api/paths/auth-planner.yaml](../api/paths/auth-planner.yaml), [api/schemas/identity.yaml](../api/schemas/identity.yaml), [api/schemas/planner.yaml](../api/schemas/planner.yaml) | Hoàn thành |
| **Cảnh** | C3 | Cấu hình Spectral lint và GitHub Actions CI tự động kiểm tra hợp đồng OpenAPI khi push / mở PR. | [.spectral.yaml](../.spectral.yaml), [.github/workflows/lint-api.yml](../.github/workflows/lint-api.yml) | Hoàn thành |
| **Cảnh** | C5 | Viết Project Brief (bài toán, consumers, 5 use case MVP, ranh giới hệ thống và các đánh đổi chính). | [design/brief.md](../design/brief.md) *(cần đồng bộ từ Flask sang FastAPI/BYOAI theo `plan.md` mới)* | Cần cập nhật nhỏ |
| **Dũng** | D1 | Tổ chức repository, tạo nhánh `dung/week12` và cập nhật kế hoạch (commit `9f5d40a`). | [README](../README.md), [kế hoạch](../plan.md) | Còn GitHub Issues và Project |
| **Dũng** | D2 | Thiết kế Fitness OpenAPI với 5 đường dẫn và 7 operation. | [Fitness OpenAPI](../api/paths/fitness.yaml) | Hoàn thành |
| **Dũng** | D3 | Thiết kế các tài nguyên của MVP và quan hệ giữa các bảng. | [Resource Model](../design/resource-model.png), [ERD](../design/erd.png) | Hoàn thành |
| **Dũng** | D4 | Viết tài liệu thiết kế, gồm mô hình dữ liệu, quyền sở hữu và quy tắc cập nhật buổi tập. | [Tài liệu thiết kế](../design/design.md) | Hoàn thành |
| **Dũng** | D5 | Tích hợp Swagger UI và kiểm thử hợp đồng Fitness trên Prism. | [Hướng dẫn chạy](../api/README.md), [kết quả Fitness](dung-T12.md) | Hoàn thành |
| **Hiếu** | H1 | Đặc tả OpenAPI đầy đủ cho mảng `nutrition`: `/foods`, `/meal-logs`, `/nutrition-profile` (có `ETag`/`If-Match`) và `/nutrition-profile/targets` (tính bằng công thức Mifflin-St Jeor). | [api/paths/nutrition-plans.yaml](../api/paths/nutrition-plans.yaml), [api/schemas/nutrition.yaml](../api/schemas/nutrition.yaml) (nhánh `hieu/week12`) | Hoàn thành |
| **Hiếu** | H2 | Đặc tả OpenAPI cho mảng `week-plans` (UC5 theo BYOAI/Mock): `POST /week-plans` (`202` + `status: "pending"`), `GET /week-plans/{id}` (bản nháp cố định `draft` gắn nhãn `source: "mock"`, hỗ trợ `awaiting-input`/`failed`), `POST /week-plans/{id}:accept` (idempotent transaction + đủ lỗi `401`, `404`, `409`, `412`, `422`, `429`). | [api/paths/nutrition-plans.yaml](../api/paths/nutrition-plans.yaml), [api/schemas/plans.yaml](../api/schemas/plans.yaml) | Hoàn thành |
| **Hiếu** | H3 | Vẽ sơ đồ Use Case (MVP / Mở rộng / Ngoài MVP), sơ đồ kiến trúc FastAPI + BYOAI + Virtual Trainer PoC, và sơ đồ tuần tự luồng UC5. | [design/use-case.svg](../design/use-case.svg), [design/architecture.svg](../design/architecture.svg), [design/uc5-sequence.svg](../design/uc5-sequence.svg) | Hoàn thành |
| **Hiếu** | H4 | Viết lựa chọn BYOAI (Mock Provider, Xuất prompt/Nhập JSON, kiểm tra Pydantic/Schema, giới hạn tốc độ `429`, điều kiện kiểm chứng cho Subscription/MCP/Local LLM). | Mục 2.3 trong báo cáo này *(chờ ghép vào `design/design.md` cùng phần D4 của Dũng)* | Hoàn thành |
| **Hiếu** | H5, H6 | Tổng hợp báo cáo tiến độ Tuần 12 và nội dung thuyết trình phần Kiến trúc FastAPI, Luồng UC5/BYOAI, Kế hoạch Tuần 13–15 và Quản trị Rủi ro. | [reports/report-T12.md](report-T12.md) | Hoàn thành |

### 2.2. Bằng chứng kiểm tra kỹ thuật (Spectral Lint & Prism Mock)
- **Kiểm tra hợp đồng bằng Spectral:**
  - Lệnh chạy: `npx @stoplight/spectral-cli@6.17.1 lint api/openapi.yaml --fail-severity=error`
  - Kết quả: **`No results with a severity of 'error' found!`** (0 lỗi).
- **Demo Mock Server bằng Prism (3 Operation bắt buộc Tuần 12 — dữ liệu mock cố định, không cần API key):**
  - Lệnh khởi chạy: `npx @stoplight/prism-cli@5.16.0 mock api/openapi.yaml -p 4010`
  - Operation 1 (`POST /auth/login`): Trả `200 OK` kèm cặp `accessToken` và `refreshToken`.
  - Operation 2 (`POST /week-plans`): Trả `202 Accepted` kèm header `Location`, `ETag: "1"`, `status: "pending"` và `source: "mock"`. Tiếp theo gọi `GET /week-plans/{id}` trả `200 OK` kèm bản nháp cố định `status: "draft"` gồm 3 mục (`task`, `workout`, `meal`).
  - Operation 3 (`POST /week-plans/{id}:accept`): Trả `200 OK` kèm `createdResources` trỏ tới `/api/v1/tasks/...`, `/api/v1/workout-sessions/...`, `/api/v1/meal-logs/...`; kiểm thử thành công các ca lỗi `401`, `404`, `409`, `412`, `422`, `429` qua header `Prefer: code=<status>`.
  - *Lưu ý minh bạch:* Đầu ra Tuần 12 là dữ liệu cố định từ **Mock Provider** (gắn nhãn `source: "mock"`), chỉ dùng để xác minh hợp đồng OpenAPI; việc chuyển trạng thái thật và ghi transaction PostgreSQL sẽ được chứng minh qua bộ test ở Tuần 14–15.

### 2.3. Thiết kế lựa chọn BYOAI — Không phụ thuộc API trả phí (H4 — Hiếu)
- **Nguyên tắc cốt lõi:** UP tách biệt tài khoản người dùng với công cụ AI; **không bắt buộc khóa API trả phí** và **không tự chuyển sang API tính phí** khi phương thức khác gặp lỗi. Mọi số liệu dinh dưỡng (BMR/TDEE theo Mifflin-St Jeor, tổng kcal/macro), tổng tập và kiểm tra trùng giờ đều do **code Python** tính.
- **Hai chế độ bắt buộc cho MVP:**
  1. **Mock Provider (`source: "mock"`):** Bắt buộc cho demo và CI/CD tự động; trả bản nháp cố định gắn nhãn rõ là `mock`, không phụ thuộc mạng hay chi phí token.
  2. **Xuất prompt / Nhập JSON (`byoai-export` $\rightarrow$ `awaiting-input` $\rightarrow$ `:import` [CHỜ NHÓM GÓP Ý]):** Hệ thống xuất prompt và ngữ cảnh đã tối giản dữ liệu cá nhân (không chứa tên thật, email) để người dùng tự đưa sang trợ lý AI họ đang có (ChatGPT, Claude, Gemini...). Khi nhập JSON ngược lại, backend kiểm tra chặt bằng **Pydantic**, kiểm quyền sở hữu, ID tham chiếu (`exerciseId`, `foodId`) và ràng buộc lịch/dinh dưỡng; hợp lệ mới chuyển sang `draft`, sai trả `422`, tuyệt đối không ghi trực tiếp vào bảng thật cho tới khi gọi `:accept`.
- **Các hướng mở rộng [CHỜ NHÓM GÓP Ý] và điều kiện kiểm chứng trước khi dùng:**
  - *Subscription chính thức (vd. Sign in with ChatGPT):* Phải kiểm tài liệu chính thức, gói, khu vực và quyền inference (lưu ý: gói ChatGPT Plus/Pro hay Google AI Pro **không mặc nhiên** là API credits; OAuth đăng nhập không tự cấp quyền gọi model).
  - *MCP:* AI bên ngoài gọi công cụ UP; bắt đầu từ quyền đọc, giới hạn theo tài khoản; MCP không tự cấp model.
  - *Local LLM (vd. Ollama):* Không tốn phí token nhưng cần đo RAM, độ trễ và tỷ lệ JSON hợp lệ trên máy chạy.
- **Bảo mật & Giới hạn tốc độ:** Tuyệt đối **không lấy session cookie/token trình duyệt** hay tự động hóa giao diện web chat để inference. Áp dụng giới hạn tốc độ **`429 Too Many Requests`** kèm header **`Retry-After`** cho các endpoint tạo/nhập kế hoạch để bảo vệ tài nguyên máy chủ kể cả khi dùng Mock hoặc xuất/nhập.

---

## 3. Công việc còn lại & Quyết định chờ nhóm góp ý (Mục 14 của `plan.md`)

1. **Tiến độ và công việc trước hạn nộp 25/11/2026:**
   - Dũng bổ sung GitHub Issues và Project từ backlog. Nhóm đối chiếu phần BYOAI ở mục 2.3 với tài liệu thiết kế. Cảnh phụ trách đồng bộ `design/brief.md` với kế hoạch FastAPI/BYOAI.
   - Phần thiết kế Fitness của Dũng đã được gộp qua [PR #5](https://github.com/manhdung1126/UP/pull/5).
   - Nhóm đã có [slide Tuần 12](slides/UP-slide-T12.pdf). Công việc còn lại là tổng duyệt demo Prism và phần hỏi đáp.
2. **Các điểm [CHỜ NHÓM GÓP Ý] cần thống nhất trước Tuần 13 (`Q1`–`Q7`):**
   - `Q1` (Cả nhóm): Thống nhất giữ 5 UC MVP, demo UC5 bằng Mock + Xuất/Nhập; Virtual Trainer chỉ là PoC mở rộng.
   - `Q2` (Cảnh): Chốt phiên bản tương thích của FastAPI, Pydantic, SQLAlchemy 2.x, Alembic và cách ánh xạ lỗi RFC 7807 / `ETag`.
   - `Q3` (Hiếu): Duyệt đề xuất bổ sung `POST /week-plans/{id}:import` và vòng đời trạng thái (`pending` $\rightarrow$ `awaiting-input` $\rightarrow$ `draft` $\rightarrow$ `accepted`/`failed`) vào `api/openapi.yaml` trước khi code.
   - `Q4` (Hiếu): Chốt phương án PoC mở rộng (Subscription chính thức, MCP hay Local LLM) nếu lõi MVP hoàn thành sớm.
   - `Q5` (Dũng, Hiếu): Quyền sử dụng mã/model và phạm vi PoC Virtual Trainer cục bộ 1–2 bài (squat, bicep curl) + nhận xét BYOAI sau hiệp từ số liệu tóm tắt.
   - `Q6`–`Q7` (Dũng, Cả nhóm): Chốt vị trí `frontend/` mới (giữ `docs/` làm prototype) và lịch review hàng tuần.

---

## 4. Kế hoạch Tuần 13–15 và Phân công trách nhiệm

| Tuần | Mục tiêu trọng tâm | Sản phẩm kiểm được | Người chính |
| :---: | :--- | :--- | :--- |
| **Tuần 13**<br>*(Nền tảng)* | • Dựng khung **FastAPI / APIRouter**, **Pydantic**, **SQLAlchemy 2.x**, **Alembic**, **PostgreSQL**, Docker Compose, `/healthz`, `/ready`.<br>• Hiện thực hóa `identity` (JWT, refresh token) và `planner` (`/tasks`, `/events` có `ETag`/`If-Match`).<br>• Xây các vertical slice đầu tiên của frontend mới (`auth` $\rightarrow$ `tasks`/`events`). | • `docker compose up` chạy ổn định.<br>• `pytest` và Newman chạy xanh cho auth/tasks; test tích hợp chạy trên **PostgreSQL**.<br>• OpenAPI sinh từ FastAPI khớp hợp đồng viết tay `api/openapi.yaml`. | **Cảnh** (FastAPI base, identity, planner, error mapping)<br>**Dũng** (Docker, frontend slice) |
| **Tuần 14**<br>*(Nghiệp vụ & BYOAI)* | • Hiện thực hóa `fitness` (939 bài tập, buổi tập/hiệp tập) và `nutrition` (công thức Mifflin-St Jeor, `/foods`, `/meal-logs`).<br>• Hiện thực hóa `plans` (Mock Provider + BYOAI xuất prompt/nhập JSON + `:accept` idempotent trong transaction PostgreSQL).<br>• Nối các luồng frontend còn lại; PoC Virtual Trainer chỉ làm khi lõi MVP đạt và nhóm duyệt. | • Luồng UC5 chạy trọn vẹn không cần API key.<br>• JSON sai schema bị chặn (`422`), không ghi DB.<br>• Test phân quyền: *"User A không đọc/sửa được dữ liệu của User B (trả 404)"*; gọi `:accept` lặp lại không tạo bản ghi trùng. | **Dũng** (fitness, frontend slices)<br>**Hiếu** (nutrition, week-plans, BYOAI mock & xuất/nhập) |
| **Tuần 15**<br>*(Hoàn thiện)* | • Versioning `/api/v1`, thử tải (k6), rà soát bảo mật, sửa lỗi, hoàn thiện tài liệu và slide cuối kỳ.<br>• Mở rộng (nếu PoC đạt): connector chính thức/Local LLM và Virtual Trainer cục bộ. | • Báo cáo kiểm thử đầy đủ, demo mock và xuất/nhập trọn vẹn.<br>• Tách bạch rõ kết quả chạy thật, đầu ra mock và tính năng chưa kiểm chứng. | **Cả nhóm** |

**Thứ tự cắt giảm nếu trễ:** (1) Cắt connector AI tự động/Local LLM và Virtual Trainer; (2) Rút gọn frontend, demo phần thiếu bằng Swagger UI. Không tự ý cắt Nutrition khỏi MVP trừ khi cả nhóm và tiêu chí môn học cho phép.
