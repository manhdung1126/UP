# Bằng chứng chạy Prism mock (Tuần 12)

- Spec: nhánh `hieu/week12`, commit `51e065e`
- Ngày chạy: 25/11/2026
- Lệnh: `npx @stoplight/prism-cli@5.16.0 mock api/openapi.yaml -p 4010` (ở đây dùng cổng 4012)
- Spectral: `npx @stoplight/spectral-cli@6.17.1 lint api/openapi.yaml` -> không có lỗi

## 1. POST /auth/login

```
$ curl -X POST $B/auth/login -H Content-Type: application/json -d {"email":"canh@example.com","password":"mat-khau-dai-12-ky-tu"}
HTTP/1.1 200 OK
Content-type: application/json
{"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access","refreshToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh","tokenType":"Bearer","expiresIn":900}

```

## 2. POST /week-plans (kỳ vọng 202)

```
$ curl -X POST $B/week-plans -H Authorization: Bearer x -H Content-Type: application/json -d {"weekStart":"2026-12-07","mode":"mock","goals":{"focus":"SOA","workoutDaysPerWeek":3}}
HTTP/1.1 202 Accepted
ETag: "3"
Location: /api/v1/week-plans/c4b0e8a2-6f1d-4d9c-9a12-8e7b5c3d1f00
Content-type: application/json
{"id":"c4b0e8a2-6f1d-4d9c-9a12-8e7b5c3d1f00","weekStart":"2026-12-07","status":"pending","source":"mock","goals":{"focus":"Hoàn thành bài tập lớn SOA và duy trì 3 buổi tập sức mạnh","workoutDaysPerWeek":3,"dailyCalorieTargetKcal":2500,"maxStudyHoursPerDay":4,"notes":"Tối thứ Tư và thứ Sáu rảnh sau 18:00"},"exportPrompt":null,"rationale":"[MOCK] Yêu cầu đang được xử lý. Gọi GET /week-plans/{id} để lấy bản nháp draft.","failureReason":null,"items":[],"version":1,"createdAt":"2026-11-25T07:00:00Z","updatedAt":"2026-11-25T07:00:00Z"}

```

## 3. POST /week-plans/{id}:accept (kỳ vọng 200)

```
$ curl -X POST $B/week-plans/c4b0e8a2-6f1d-4d9c-9a12-8e7b5c3d1f00:accept -H Authorization: Bearer x -H Content-Type: application/json -d {"acceptAll":true}
HTTP/1.1 200 OK
Content-type: application/json
{"planId":"c4b0e8a2-6f1d-4d9c-9a12-8e7b5c3d1f00","status":"accepted","acceptedCount":3,"createdResources":[{"itemId":"91a0b2c3-1111-4e5f-8a9b-111111110001","kind":"task","resourceId":"7b1f4c52-0c3e-4f3b-8a56-2f5d9a3e6b10","resourceUri":"/api/v1/tasks/7b1f4c52-0c3e-4f3b-8a56-2f5d9a3e6b10"},{"itemId":"91a0b2c3-1111-4e5f-8a9b-111111110002","kind":"workout","resourceId":"8c2e5d63-1d4f-4a4c-9b67-3e6e0b4f7c21","resourceUri":"/api/v1/workout-sessions/8c2e5d63-1d4f-4a4c-9b67-3e6e0b4f7c21"},{"itemId":"91a0b2c3-1111-4e5f-8a9b-111111110003","kind":"meal","resourceId":"5e6f7a8b-3333-4c5d-8e6f-000000000301","resourceUri":"/api/v1/meal-logs/5e6f7a8b-3333-4c5d-8e6f-000000000301"}],"updatedAt":"2026-11-25T07:05:00Z"}

```

## 4. Ca lỗi 409 (Prefer: code=409)

```
$ curl -X POST $B/week-plans/c4b0e8a2-6f1d-4d9c-9a12-8e7b5c3d1f00:accept -H Authorization: Bearer x -H Content-Type: application/json -H Prefer: code=409 -d {"acceptAll":true}
HTTP/1.1 409 Conflict
Content-type: application/problem+json
{"type":"https://up.example/problems/conflict","title":"Xung đột","status":409,"detail":"Tài nguyên đã ở trạng thái này."}

```

## 5. Ca lỗi 422 (Prefer: code=422)

```
$ curl -X POST $B/week-plans -H Authorization: Bearer x -H Content-Type: application/json -H Prefer: code=422 -d {"weekStart":"2026-12-07"}
HTTP/1.1 422 Unprocessable Entity
Content-type: application/problem+json
{"type":"https://up.example/problems/validation-error","title":"Dữ liệu không hợp lệ","status":422,"detail":"Có 1 trường sai.","errors":[{"field":"title","message":"Không được để trống."}]}

```

Lưu ý: đây là mock (Prism trả ví dụ cố định trong spec), chỉ chứng minh hợp đồng; chưa chứng minh chuyển trạng thái hay lưu dữ liệu thật (Tuần 14–15).
