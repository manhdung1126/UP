# Tiến độ phần Dũng — Tuần 12

Ngày: 25/11/2026. Nhánh làm việc: `dung/week12`. Trạng thái: phần thiết kế sẵn sàng cho Cảnh/Hiếu review, chưa phải cả nhóm đã duyệt hoặc backend đã hoàn thành.

## Sản phẩm D2–D6

| Mục | Sản phẩm | Bằng chứng |
| --- | --- | --- |
| D2 — Fitness OpenAPI | 5 path, 7 operation; request/response schema, UUID, đơn vị, pagination, lỗi và ETag | `api/paths/fitness.yaml`, `api/schemas/fitness.yaml`, `api/examples/fitness.yaml`; commit `4866f53` |
| D3 — Resource Model và ERD | Toàn bộ MVP, quan hệ 0..n phù hợp buổi mới/kế hoạch đang xử lý; nguồn chỉnh sửa và ảnh xuất | `design/resource-model.mmd/.svg/.png`, `design/erd.mmd/.svg/.png`; commit `e2cf45b` |
| D4 — Design Documentation | Resource khác DB, quyền sở hữu, UUID/sourceId, công thức, transaction và điểm nhóm cần chốt | `design/design.md`; commit `e2cf45b` |
| D5 — Swagger UI | UI local, bundle tự chứa và Swagger UI 5.32.0 kèm LICENSE; hướng dẫn chạy | `api/index.html`, `api/README.md`, các ảnh kiểm tra dưới đây |
| D6 — Hai slide | Resource Model; ERD và ánh xạ resource. Deck chỉnh sửa trong Codex, ảnh xem trước và lời trình bày trong repo | `design/slides.md`, `design/slides/slide-1.png`, `design/slides/slide-2.png` |

## Kiểm tra đã chạy

- Spectral 6.17.1: không có lỗi ở mức error trên toàn bộ OpenAPI đã ghép.
- Redocly CLI 1.34.5: bundle spec nhiều file thành `api/openapi.bundle.json` thành công.
- `python3 api/verify-fitness.py`: 21 ca mock đạt. Có 7 operation thành công, kiểm UUID/giá trị/field lạ/minProperties và thiếu authorization; 404/412/428 là ca ép response bằng Prefer, được ghi rõ trong script.
- Chrome headless với profile kiểm thử riêng: Swagger hiển thị 27 operation toàn nhóm, bao gồm 7 operation Fitness. Bấm Authorize/Apply credentials/Try it out/Execute cho `GET /exercises` nhận 200 và JSON fixture.
- Kiểm khung desktop 1440×1000 và mobile 390×844: trang tải, không có lỗi trang/console/request bị lỗi trong luồng đã chạy. Authorization mock không còn sau reload.
- Đã render và xem hai sơ đồ và hai slide; slide là đối tượng chỉnh sửa được, có speaker notes. Chưa kiểm trực tiếp trong PowerPoint hoặc trên iPhone thật.

Ảnh bằng chứng: [Swagger desktop](swagger-ui-desktop.png), [Swagger mobile](swagger-ui-mobile.png), [request Fitness 200](swagger-fitness-request.png).

## Phụ thuộc và phần chưa chứng minh

- Nhánh Dũng cập nhật fast-forward tới `51e065e` của Hiếu; giữ nguyên commit Cảnh `273d0f9`, plan mới và phần Hiếu. Không sửa `api/components.yaml`, auth/planner hoặc nutrition/plans. PR phần Dũng nên đặt trên `hieu/week12` để reviewer chỉ thấy thay đổi của Dũng, rồi retarget main sau khi các PR phụ thuộc được duyệt/merge.
- Chưa có backend/DB: chưa chứng minh persistence, JWT thật, quyền A/B, FK, quan hệ thời gian, transaction, chống ghi trùng đồng thời hoặc kiểm ETag thật.
- Cần Hiếu đồng bộ UUID bài trong payload Weekly Planner, chốt schema theo kind và đường `:import`; các điểm này nằm trong `design/design.md`.
- D1 đã có nhánh và README hướng dẫn; chưa tạo thêm GitHub Project/Issues hoặc mời thành viên. Hoàn thiện sau phần bắt buộc như thứ tự người dùng yêu cầu.
- Chưa triển khai FastAPI, BYOAI connector hay Virtual Trainer; đây là phạm vi giai đoạn sau trong plan.
