# UP

UP là web app thực hành quản lý cá nhân, viết bằng HTML, CSS và JavaScript thuần. Màn hình đầu là lịch trong ngày. Bạn có thể thêm công việc, duyệt thư viện tập luyện và ghi số liệu từng hiệp. Ghi chú và thu chi dùng dữ liệu mẫu.

## Chạy trên máy

Mở Terminal trong thư mục chứa `index.html` và chạy:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Mở [UP trên trình duyệt](http://127.0.0.1:4173/). Trong **Tập luyện**, chọn **Thư viện** để lọc 939 mục. Có 45 mục kèm video wger và 10 model 3D. Tên bài tập dùng tiếng Anh.

Các thay đổi chỉ nằm trong bộ nhớ của trang và mất khi tải lại. Mục AI là giao diện mẫu, các nút kết nối đang tắt. Bản này chạy với dữ liệu đi kèm, không cần tài khoản hay API key.

## Nguồn dữ liệu

Xem [DATA-SOURCES.md](DATA-SOURCES.md) về nguồn, công sức chuyển đổi và giấy phép. Dữ liệu và media giữ giấy phép của từng nguồn. Thông tin tác giả và giấy phép video được hiển thị trong trình phát.

Kiểm tra tệp media và dữ liệu với `python3 -B check_models.py` và `python3 -B check_videos.py`. Lệnh kiểm tra video cần `ffprobe` của FFmpeg.
