# FITLYO Prototype — Bản cập nhật mới nhất

**Ngày cập nhật:** 22/10/2026  
**Phạm vi:** Web prototype cho Player, Coach, Field Manager và Super Admin  
**Mục đích:** Tóm tắt tính năng mới, chính sách thanh toán hiện hành và kịch bản kiểm thử.

## 1. Thay đổi nổi bật

1. Chuẩn hóa cả bốn dịch vụ sang **thanh toán 100%**, không còn cọc giữ chỗ 50%.
2. Bổ sung nạp tiền vào Ví FITLYO bằng VietQR mô phỏng.
3. Hoàn thiện đặt Coach: gửi yêu cầu, Coach duyệt, Player thanh toán trong 15 phút, kiểm tra trùng lịch và tự xếp khóa 8 buổi.
4. Đơn giản hóa cập nhật nhiều slot cùng lúc cho Field Manager.
5. Tinh gọn hỗ trợ thành chatbot FITLYO Assistant.
6. Bổ sung nút làm mới dữ liệu mẫu để kiểm thử lại từ đầu.
7. Tăng cỡ chữ, vùng bấm và bổ sung chế độ Chữ lớn.

## 2. Thanh toán 100%

| Dịch vụ | Thời điểm thanh toán | Số tiền | Thời hạn |
|---|---|---:|---|
| Social Session | Khi Player tham gia | 100% phí tham gia | Xác nhận ngay |
| Đặt sân riêng | Khi Player xác nhận slot | 100% giá sân | Xác nhận ngay |
| Coach | Sau khi Coach duyệt yêu cầu | 100% học phí | 15 phút |
| FITLYO VIP | Khi đăng ký gói | 100% giá gói | Kích hoạt ngay |

Social Session và đặt sân không còn bộ đếm giữ chỗ chờ thanh toán. Booking Coach vẫn được giữ trong 15 phút kể từ lúc Coach duyệt; quá hạn chưa thanh toán thì yêu cầu hết hạn và slot được mở lại. Coach có tối đa 12 giờ để xử lý yêu cầu trước khi hệ thống tự hủy.

Các trạng thái giao dịch chính:

- Chờ duyệt Coach.
- Chờ thanh toán.
- Đã thanh toán và xác nhận.
- Hoàn tất.
- Thanh toán thất bại hoặc hết hạn.
- Đã hủy, đã hoàn một phần, đã hoàn tiền hoặc không hoàn phí.

## 3. Chính sách hủy và hoàn tiền

### Social Session

- Hủy trước giờ chơi từ 6 giờ trở lên: hoàn 100% về Ví FITLYO.
- Hủy dưới 6 giờ hoặc không đến: không hoàn tiền.
- Không đủ người: hệ thống hủy trước giờ chơi 60 phút và hoàn 100%.

### Đặt sân riêng

- Hủy trước từ 12 giờ trở lên: hoàn 100% số tiền đã thanh toán.
- Hủy trong khoảng 6–12 giờ: hoàn 50% số tiền đã thanh toán.
- Hủy dưới 6 giờ: không hoàn tiền.

### Đặt Coach

- Hủy trước từ 24 giờ trở lên: hoàn 100% số tiền đã thanh toán.
- Hủy dưới 24 giờ: được đổi lịch một lần và giữ nguyên toàn bộ học phí.
- Nếu tiếp tục hủy lịch mới: không hoàn tiền.
- Khóa 8 buổi: nếu Coach hủy một buổi và không thể xếp lại, hoàn `tổng học phí ÷ 8`.

### FITLYO VIP

- Thanh toán 100% và kích hoạt ngay.
- Không hoàn tiền sau khi kích hoạt.

### Khi Coach hoặc sân hủy

- Hoàn 100% số tiền đã thanh toán về Ví FITLYO.
- Tặng voucher bằng 10% giá trị booking, tối đa 100.000đ, hạn dùng 30 ngày.

## 4. Nạp tiền vào Ví FITLYO

Player có thể chọn **Nạp tiền** ở header, menu tài khoản trên màn hình nhỏ hoặc trang hồ sơ.

1. Chọn mức 100.000đ, 200.000đ, 500.000đ, 1.000.000đ hoặc nhập số khác.
2. Xem số dư dự kiến.
3. Tạo VietQR mô phỏng.
4. Xác nhận đã chuyển khoản.
5. Hệ thống cộng tiền vào ví và lưu trong `localStorage`.

Đây là mô phỏng, không kết nối ngân hàng và không phát sinh tiền thật.

## 5. Đặt lịch Coach

- Player xem lịch Coach và gửi yêu cầu, chưa bị trừ tiền.
- Hệ thống kiểm tra Coach đã có người đặt và Player có lịch sân, kèo hoặc buổi học khác cùng giờ hay chưa.
- Coach duyệt hoặc từ chối trong Coach Portal.
- Sau khi duyệt, Player có 15 phút thanh toán 100%.
- Khóa 8 buổi chỉ yêu cầu Player chọn buổi đầu; hệ thống tự xếp 7 buổi tiếp theo, tối đa 2 buổi mỗi tuần.
- Player theo dõi booking và từng buổi học trong **HLV của tôi** và **Lịch của tôi**.

## 6. Field Manager cập nhật slot nhanh

Lịch sân gồm 10 slot liên tục, mỗi slot 90 phút, từ 06:00 đến 21:00.

- Chọn nhiều slot cùng lúc.
- Chuyển sang Còn trống, Bảo trì hoặc Khách vãng lai.
- Cập nhật giá cho các slot đã chọn.
- Bắt buộc nhập lý do chung khi bảo trì.
- Nhập một lần họ tên, số điện thoại và phương thức thanh toán cho khách vãng lai đặt nhiều slot.
- Hoàn tác thao tác trong 10 giây.
- Chỉ hiển thị họ tên và số điện thoại người đặt.

Slot đã có Player đặt, lớp Coach hoặc Social Match phải đi qua luồng hủy và hoàn tiền; FM không thể chuyển thẳng thành trống.

## 7. Chatbot và khả năng tiếp cận

FITLYO Assistant xuất hiện trong Player, Coach và Field Manager Portal, không hiển thị ở Admin. Bot dùng kịch bản có sẵn về đặt sân, thanh toán 100%, hủy/hoàn tiền, Social Session và đặt Coach; chưa kết nối AI hoặc backend.

Toàn website có nút bấm tối thiểu 48px, cỡ chữ dễ đọc, tương phản rõ và chế độ **Chữ lớn**. Lựa chọn được lưu cho lần truy cập sau.

## 8. Làm mới dữ liệu thử nghiệm

Nút **Làm mới data** trên thanh điều hướng khôi phục booking, QR, lịch, thanh toán, ví, chat và slot mẫu. Hệ thống giữ nguyên tài khoản đăng nhập, light/dark mode và chế độ chữ lớn.

## 9. Tài khoản mẫu

| Vai trò | Email | Mật khẩu | Trang chính |
|---|---|---|---|
| Player | `player@fitlyo.vn` | `Player@123` | `/player` |
| Field Manager | `owner@fitlyo.vn` | `Owner@123` | `/fm/calendar` |
| Coach | `coach@fitlyo.vn` | `Coach@123` | `/coach/schedule` |
| Super Admin | `admin@fitlyo.vn` | `Admin@123` | `/admin/dashboard` |

Muốn đổi vai trò, người dùng phải đăng xuất và đăng nhập bằng tài khoản tương ứng.

## 10. Kịch bản kiểm thử chính

### A. Social Session

1. Đăng nhập Player và tham gia một Social Session.
2. Kiểm tra CTA và Ví FITLYO ghi nhận thanh toán 100%.
3. Kiểm tra vé QR được phát sau khi đủ người.
4. Hủy và đối chiếu số tiền hoàn theo mốc 6 giờ.

### B. Đặt sân

1. Chọn sân và slot còn trống.
2. Kiểm tra checkout hiển thị thanh toán 100%, không có phần còn lại tại quầy.
3. Thanh toán và kiểm tra lịch cá nhân.
4. Hủy và đối chiếu quy tắc 12 giờ / 6 giờ.

### C. Đặt Coach

1. Player gửi yêu cầu đặt lịch; kiểm tra ví chưa bị trừ.
2. Đăng nhập Coach và duyệt yêu cầu.
3. Đăng nhập lại Player; kiểm tra bộ đếm 15 phút.
4. Thanh toán 100% và kiểm tra booking được xác nhận, số tiền còn lại bằng 0.
5. Kiểm tra hủy trước 24 giờ hoàn 100% và hủy muộn cho phép đổi lịch một lần.

### D. VIP và nạp ví

1. Nạp thử tiền bằng VietQR mô phỏng.
2. Mua VIP bằng 100% giá gói.
3. Kiểm tra kích hoạt ngay và thông báo không hoàn tiền.

### E. Field Manager và reset

1. Cập nhật nhiều slot, giá, bảo trì và khách vãng lai.
2. Thử Hoàn tác trong 10 giây.
3. Nhấn **Làm mới data** và kiểm tra dữ liệu mẫu được khôi phục.

## 11. Giới hạn prototype

- Không có backend, cơ sở dữ liệu hoặc đồng bộ đa thiết bị.
- Không có cổng thanh toán, ngân hàng hay Escrow thật.
- VietQR, QR check-in, hoàn tiền và thời gian xử lý đều là mô phỏng phía trình duyệt.
- Không có OTP, Google Maps/GPS hoặc đồng bộ DUPR thật.
- Chatbot chưa sử dụng AI thật.

Prototype hiện phù hợp cho demo và usability test. Trước khi vận hành thật, booking lock, payment callback, ledger, refund, QR có chữ ký và chính sách thời gian phải được thực thi ở backend.
