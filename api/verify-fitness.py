"""Smoke test hợp đồng Fitness trên Prism; không chứng minh backend có lưu state."""

import json
import os
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE = os.environ.get("MOCK_URL", "http://127.0.0.1:4010").rstrip("/")
EXERCISE = "5af44b30-3f2e-4c55-86d1-64df1c89bc01"
SESSION = "8c2e5d63-1d4f-4a4c-9b67-3e6e0b4f7c21"
checks = 0


def request(method, path, expected, body=None, headers=None, auth=True):
    global checks
    combined = {"Accept": "application/json, application/problem+json"}
    if auth:
        combined["Authorization"] = "Bearer mock-token"
    if body is not None:
        combined["Content-Type"] = "application/json"
    combined.update(headers or {})
    req = Request(BASE + path, data=None if body is None else json.dumps(body).encode(),
                  headers=combined, method=method)
    try:
        response = urlopen(req, timeout=10)
    except HTTPError as error:
        response = error
    payload = json.loads(response.read())
    assert response.status == expected, (method, path, expected, response.status, payload)
    if expected >= 400:
        assert "application/problem+json" in response.headers.get("Content-Type", "")
        assert payload["status"] == expected
    checks += 1
    print(f"PASS {method} {path}: {expected}")
    return payload, response.headers


page, _ = request("GET", "/exercises?page=1&size=20&sort=name&muscle=chest", 200)
assert page["items"][0]["id"] == EXERCISE and page["page"] == 1
exercise, _ = request("GET", f"/exercises/{EXERCISE}", 200)
assert exercise["sourceId"] == "Barbell_Bench_Press_-_Medium_Grip"
request("GET", "/workout-sessions", 200)
session, headers = request("GET", f"/workout-sessions/{SESSION}", 200)
assert headers["ETag"] == f'"{session["version"]}"'
assert session["totalVolumeKg"] == sum(s["reps"] * s["weightKg"] for s in session["sets"])
created, headers = request("POST", "/workout-sessions", 201,
                           {"title": "Buổi tập thân trên", "startedAt": "2026-11-25T11:00:00Z"})
assert created["sets"] == [] and created["version"] == 1 and headers["ETag"] == '"1"'
assert SESSION in headers["Location"]
updated, headers = request("PATCH", f"/workout-sessions/{SESSION}", 200,
                           {"note": "Đã kiểm tra thời gian và kỹ thuật với người hướng dẫn."},
                           {"If-Match": '"2"'})
assert updated["version"] == 3 and headers["ETag"] == '"3"'
valid_set = {"exerciseId": EXERCISE, "reps": 10, "weightKg": 50, "rpe": 7}
set_, headers = request("POST", f"/workout-sessions/{SESSION}/sets", 201,
                        valid_set, {"If-Match": '"1"'})
assert set_["sessionId"] == SESSION and headers["ETag"] == '"2"'
# Validation của mock dựa trên schema, không ép status bằng Prefer.
request("GET", "/exercises?size=101", 422)
request("GET", "/exercises?sort=invalid", 422)
request("GET", "/exercises/not-a-uuid", 422)
request("GET", "/exercises", 401, auth=False)
for invalid in [{"reps": -1}, {"reps": 1.5}, {"weightKg": -2}, {"rpe": 11},
                {"exerciseId": "Barbell_Bench_Press_-_Medium_Grip"}, {"userId": EXERCISE}]:
    request("POST", f"/workout-sessions/{SESSION}/sets", 422,
            valid_set | invalid, {"If-Match": '"1"'})
request("PATCH", f"/workout-sessions/{SESSION}", 422, {}, {"If-Match": '"2"'})
# Chỉ kiểm ví dụ response của hợp đồng. Prism không có ownership/transaction/version thật.
for status in [404, 412, 428]:
    request("POST", f"/workout-sessions/{SESSION}/sets", status, valid_set,
            {"If-Match": '"1"', "Prefer": f"code={status}"})
print(f"\n{checks} ca mock đạt. Phân quyền, persistence và chống ghi trùng cần test backend Tuần 13–15.")
