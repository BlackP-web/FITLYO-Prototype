# FITLYO - Kịch bản demo 6 luồng nghiệp vụ chính

**Phiên bản:** 1.0  
**Ngày cập nhật:** 22/10/2026  
**Phạm vi:** Web prototype FITLYO cho Player, Coach, Field Manager và Super Admin  
**Mục tiêu:** Demo các quy trình nghiệp vụ end-to-end xuyên nhiều vai trò, không trình bày chức năng rời rạc theo từng actor.

---

## 1. Nguyên tắc trình bày

Mỗi kịch bản phải trả lời được bốn câu hỏi:

1. Nghiệp vụ bắt đầu từ nhu cầu nào?
2. Những vai trò nào tham gia xử lý?
3. Dữ liệu hoặc trạng thái thay đổi như thế nào qua từng cổng nghiệp vụ?
4. Kết quả cuối cùng tạo giá trị gì cho Player, đối tác và FITLYO?

Không demo riêng các chức năng như đăng nhập, nạp ví, QR hoặc thông báo. Các chức năng này chỉ xuất hiện tại đúng điểm của quy trình nghiệp vụ lớn.

## 2. Chuẩn bị trước khi demo

### 2.1. Khởi động prototype

Tại thư mục dự án:

```bash
npm run dev
```

Mở địa chỉ localhost do Vite hiển thị trên terminal.

### 2.2. Khôi phục dữ liệu mẫu

1. Đăng nhập bằng bất kỳ tài khoản mẫu nào.
2. Nhấn **Làm mới data** trên thanh điều hướng.
3. Xác nhận làm mới dữ liệu.
4. Chỉ làm bước này một lần trước toàn bộ buổi demo.

Không làm mới dữ liệu giữa các kịch bản vì thao tác này xóa booking, thanh toán, KYC, liên kết Coach, QR và lịch vừa tạo. Phiên đăng nhập, giao diện sáng/tối và chế độ chữ lớn được giữ lại.

### 2.3. Tài khoản mẫu

| Vai trò | Email | Mật khẩu | Trang mặc định |
|---|---|---|---|
| Player | `player@fitlyo.vn` | `Player@123` | `/player` |
| Field Manager | `owner@fitlyo.vn` | `Owner@123` | `/fm/calendar` |
| Coach | `coach@fitlyo.vn` | `Coach@123` | `/coach/schedule` |
| Super Admin | `admin@fitlyo.vn` | `Admin@123` | `/admin/dashboard` |

### 2.4. Quy tắc đổi vai trò

Prototype không có nút đổi role trực tiếp. Khi chuyển vai trò:

1. Đăng xuất tài khoản hiện tại.
2. Đăng nhập bằng tài khoản của vai trò tiếp theo.
3. Không nhấn **Làm mới data**.

Dữ liệu nghiệp vụ được lưu trong `localStorage`, vì vậy booking và trạng thái đã tạo vẫn còn sau khi đăng xuất/đăng nhập trên cùng trình duyệt.

### 2.5. Lưu ý trung thực khi thuyết trình

- Không có backend hoặc cơ sở dữ liệu thật.
- Thanh toán, VietQR, hoàn tiền, Escrow và QR check-in đều là mô phỏng phía trình duyệt.
- Một số dashboard tài chính và tranh chấp dùng dữ liệu mẫu để minh họa, chưa đối soát từ cùng một ledger giao dịch thật.
- KYC chỉ lưu metadata của file; không tải chứng từ lên máy chủ.
- Có thể dùng `src/assets/pickleball/fitlyo-coach-male.jpg` làm file upload minh họa khi demo KYC Coach.

## 3. Thứ tự demo đề xuất

| Thứ tự | Luồng | Thời lượng gợi ý | Vai trò chính |
|---:|---|---:|---|
| 1 | Đăng ký, thẩm định và đưa đối tác lên nền tảng | 7 phút | Coach - Admin - FM - Player |
| 2 | Tổ chức và vận hành Social Session | 9 phút | FM - Player - Hệ thống |
| 3 | Đặt sân và sử dụng sân | 6 phút | Player - FM - Hệ thống |
| 4 | Đặt Coach và vận hành khóa học | 10 phút | Player - Coach - FM - Hệ thống |
| 5 | Thanh toán, doanh thu và đối soát | 6 phút | Player - FM - Coach - Admin |
| 6 | Hủy lịch, sự cố, no-show và tranh chấp | 7 phút | Player - Coach - FM - Admin |

Tổng thời lượng đầy đủ khoảng 45 phút. Khi chỉ có 20-25 phút, thực hiện các bước có nhãn **Bắt buộc** và bỏ qua nhánh mở rộng.

---

## SC-01 - Đăng ký, thẩm định và đưa đối tác lên nền tảng

### Mục tiêu nghiệp vụ

Chứng minh FITLYO không đưa một Coach hoặc cụm sân lên marketplace ngay sau khi đăng ký. Hồ sơ phải được nộp, Admin thẩm định, sau đó đối tác mới được liên kết và xuất hiện trong chuỗi cung ứng dịch vụ.

### Vai trò và điểm chuyển giao

`Coach -> Admin -> Coach -> Field Manager -> Player`

### Điều kiện đầu vào

- Dữ liệu mẫu vừa được khôi phục.
- Chuẩn bị một file PDF/JPG/PNG dưới 10 MB để minh họa chứng chỉ.

### Các bước demo

#### Chặng A - Coach nộp hồ sơ xác minh

1. **Bắt buộc:** Đăng nhập Coach.
2. Mở **Xác minh** hoặc truy cập `/coach/verification`.
3. Cho người xem thấy ba nhóm dữ liệu: thông tin chuyên môn, chứng chỉ, khu vực và học phí.
4. Giữ dữ liệu Coach mẫu; chọn file minh họa tại phần chứng chỉ.
5. Nhấn **Gửi hồ sơ xác minh**.
6. Kiểm tra màn hình chuyển sang trạng thái **Hồ sơ đang được Ban quản trị thẩm định** và ghi nhận mã hồ sơ.

**Lời dẫn gợi ý:** “Coach chưa tự nhận tích xanh. Hệ thống tạo một hồ sơ PENDING để Admin kiểm tra chứng chỉ và thông tin chuyên môn.”

#### Chặng B - Admin thẩm định hồ sơ

1. Đăng xuất Coach và đăng nhập Super Admin.
2. Mở **Thẩm định hồ sơ đối tác** tại `/admin/kyc`.
3. Tìm hồ sơ vừa nộp bằng tên **HLV Lê Hoàng Dũng** hoặc email Coach.
4. Mở chứng từ đính kèm để cho thấy thao tác kiểm tra được mô phỏng.
5. Nhập hoặc giữ ghi chú kiểm duyệt.
6. **Bắt buộc:** Nhấn **Phê duyệt xác minh**.
7. Kiểm tra trạng thái hồ sơ chuyển sang đã duyệt.

**Nhánh mở rộng:** Chọn một hồ sơ PENDING có sẵn và demo **Yêu cầu bổ sung** hoặc **Từ chối**. Không thực hiện nếu cần dùng chính hồ sơ đó cho phần sau.

#### Chặng C - Đối tác được kích hoạt và liên kết

1. Đăng xuất Admin, đăng nhập Coach.
2. Quay lại `/coach/verification`, kiểm tra thông báo **Hồ sơ Coach đã được xác minh**.
3. Mở **Cụm sân liên kết** tại `/coach/venues`.
4. Cho thấy Coach có sân đang hoạt động, sân đang chờ duyệt và quyền gửi yêu cầu liên kết.
5. Đăng xuất Coach, đăng nhập Field Manager.
6. Mở **Huấn luyện viên liên kết** tại `/fm/coaches`.
7. Chọn tab **Chờ duyệt** và mở yêu cầu của một Coach đang chờ.
8. **Bắt buộc:** Nhấn **Chấp thuận**.
9. Kiểm tra Coach được chuyển sang danh sách đang liên kết.

#### Chặng D - Player nhìn thấy nguồn cung đã xác minh

1. Đăng xuất FM, đăng nhập Player.
2. Mở **Huấn luyện viên** tại `/player/coaches`.
3. Bật bộ lọc **Certified Coach**.
4. Mở hồ sơ chi tiết của một Coach có tích xác minh.

### Kết quả mong đợi

- Hồ sơ Coach đi từ chưa có hồ sơ sang `PENDING`, sau đó `APPROVED`.
- FM có thể quản lý liên kết Coach với cụm sân.
- Player chỉ tiếp cận nguồn cung đã được mô tả và xác minh trên marketplace.

### Bằng chứng nên chỉ trên màn hình

- Mã hồ sơ KYC và trạng thái PENDING/APPROVED.
- Nút **Phê duyệt xác minh** của Admin.
- Trạng thái liên kết Coach tại FM Portal.
- Tích Certified Coach trong danh bạ Player.

---

## SC-02 - Tổ chức và vận hành Social Session

### Mục tiêu nghiệp vụ

Chứng minh một slot trống được FM chuyển thành sản phẩm Social Session, Player tìm đúng kèo theo DUPR, thanh toán 100%, nhận QR, check-in, hoàn thành trận và cập nhật uy tín.

### Vai trò và điểm chuyển giao

`Field Manager -> Hệ thống -> Player -> Field Manager/QR -> Player -> Admin khi có báo cáo`

### Điều kiện đầu vào

- Player mẫu có DUPR 3.42.
- Chọn dải DUPR chứa 3.42, ví dụ 3.0-3.5 hoặc 3.0-4.0.
- Chọn một slot **Còn trống** trên lịch FM.

### Các bước demo

#### Chặng A - FM tạo Social Session

1. Đăng nhập Field Manager và mở `/fm/calendar`.
2. Chọn một ô **Còn trống**.
3. Nhấn **Mở kèo Social DUPR**.
4. Thiết lập:
   - DUPR tối thiểu: 3.0;
   - DUPR tối đa: 3.5;
   - thể thức: Đánh đôi;
   - số người: 4;
   - phí tham gia: 50.000đ/người;
   - giữ các tiện ích mặc định.
5. Cho thấy hệ thống tính tổng thu dự kiến và chênh lệch so với giá sân.
6. **Bắt buộc:** Nhấn **Xác nhận Công bố Kèo ngay**.
7. Kiểm tra ô lịch chuyển từ **Còn trống** sang **Kèo Social**.

**Lời dẫn gợi ý:** “FM không tạo kèo ở một module riêng; kèo được sinh trực tiếp từ công suất sân còn trống nên tránh bán trùng slot.”

#### Chặng B - Player tìm và tham gia

1. Đăng xuất FM, đăng nhập Player.
2. Mở **Buổi chơi** tại `/player/matches`.
3. Lọc theo DUPR phù hợp, khu vực và ngày nếu cần.
4. Mở kèo vừa công bố. Nếu kèo vừa tạo không hiện do ngày mẫu khác ngày hiện tại, chọn một Social Session có sẵn chứa DUPR 3.42 để tiếp tục demo giao dịch.
5. Kiểm tra phí, roster, số chỗ còn lại và chính sách hủy.
6. Nhấn **Thanh toán 100%**.
7. Chọn **Ví FITLYO** hoặc **Thanh toán mô phỏng**.
8. Chọn ô đồng ý điều kiện.
9. **Bắt buộc:** Nhấn nút thanh toán 100%.
10. Kiểm tra hệ thống chuyển thẳng đến vé QR.

#### Chặng C - Check-in và hoàn thành trận

1. Trên vé, cho thấy QR động, thông tin sân, thời gian và nhóm chơi.
2. **Bắt buộc:** Nhấn **Mô phỏng quét QR thành công**.
3. Kiểm tra trạng thái vé chuyển sang đã check-in.
4. Nhấn **Mô phỏng kết thúc trận**.
5. Nhấn **Đánh giá sau trận**.
6. Nhập tỉ số, đánh giá tinh thần thể thao và trình độ của các bạn chơi.
7. **Bắt buộc:** Nhấn **Xác nhận & gửi đánh giá**.
8. Kiểm tra hồ sơ Player được cộng 0.05 DUPR và 2 điểm uy tín.

#### Chặng D - Check-in phía sân, nếu cần trình bày vận hành

1. Đăng nhập FM và mở `/fm/checkin`.
2. Chọn một mã vé mẫu hoặc nhập `PKB-1310-8849`.
3. Nhấn **Đối soát mã**.
4. Nhấn **Xác nhận vào sân** hoặc **Mô phỏng mở cửa**.

Lưu ý: kiosk FM đang dùng bộ mã mẫu riêng, chưa xác minh trực tiếp QR vừa sinh từ Player Store.

### Kết quả mong đợi

- Một slot sân được chuyển thành Social Session.
- Player thanh toán đủ 100% và có vé QR.
- Trận đi qua các trạng thái tham gia, check-in, hoàn tất và đánh giá.
- DUPR và uy tín Player được cập nhật sau trận.

---

## SC-03 - Đặt sân và sử dụng sân

### Mục tiêu nghiệp vụ

Chứng minh Player xem tồn kho sân, bao trọn một slot, thanh toán 100%, nhận lịch; FM đồng thời nhìn thấy booking và không thể xóa trực tiếp một slot đã có giao dịch.

### Vai trò và điểm chuyển giao

`Field Manager -> Hệ thống -> Player -> Field Manager -> Hệ thống tài chính`

### Các bước demo

#### Chặng A - Player tìm và đặt sân

1. Đăng nhập Player.
2. Mở **Khám phá sân** tại `/player/venues`.
3. Chuyển giữa bản đồ và danh sách; có thể lọc **Trong bán kính 5km** hoặc **Có sân trong nhà**.
4. Nhấn **Xem lịch sân** tại một cụm sân.
5. Chọn ngày và một ô **TRỐNG - ĐẶT NGAY**.
6. Trong popup, chỉ rõ:
   - bao trọn sân 90 phút;
   - tổng giá trị booking;
   - thanh toán ngay 100%;
   - còn lại tại quầy bằng 0đ;
   - chính sách hoàn 100%/50%/0% theo mốc 12 giờ và 6 giờ.
7. Chọn Ví hoặc VietQR, đồng ý điều kiện.
8. **Bắt buộc:** Nhấn **Thanh toán 100%**.
9. Kiểm tra hệ thống chuyển đến **Lịch của tôi** và hiển thị booking sân mới.

#### Chặng B - FM kiểm tra booking

1. Ghi nhớ tên sân, slot và thời gian vừa đặt.
2. Đăng xuất Player, đăng nhập FM.
3. Mở `/fm/calendar` và tìm slot tương ứng.
4. Mở chi tiết slot để xem mã booking, trạng thái, thời điểm đặt và thông tin người đặt.
5. Chỉ cho người xem cảnh báo: slot đã có giao dịch không thể giải phóng trực tiếp; phải dùng quy trình hủy và hoàn tiền.

Nếu booking Player không xuất hiện đúng ngày FM đang xem, giải thích giới hạn dữ liệu ngày của prototype và mở một slot **Khách bao sân** có sẵn để minh họa cùng cấu trúc thông tin.

#### Chặng C - Vận hành hàng loạt của FM

1. Bật chế độ cập nhật nhiều slot.
2. Chọn hai slot còn trống hoặc bảo trì.
3. Nhấn **Cập nhật trạng thái & giá**.
4. Chọn **Bảo trì** hoặc **Khách vãng lai**, nhập dữ liệu bắt buộc và giá mới.
5. Nhấn **Xác nhận cập nhật**.
6. **Bắt buộc:** Nhấn **Hoàn tác** trong vòng 10 giây để chứng minh khả năng sửa sai vận hành.

### Kết quả mong đợi

- Player có booking đã trả đủ tiền trong lịch cá nhân.
- FM có thể truy vết người đặt và giao dịch của slot.
- Slot có giao dịch được bảo vệ khỏi thao tác chuyển thẳng về trống.
- FM có công cụ cập nhật hàng loạt nhưng vẫn có cơ chế hoàn tác.

---

## SC-04 - Đặt Coach và vận hành khóa học

### Mục tiêu nghiệp vụ

Chứng minh booking Coach không thu tiền ngay. Player gửi yêu cầu, Coach duyệt trong 12 giờ, Player thanh toán trong 15 phút, hệ thống khóa lịch và tự xếp khóa 8 buổi.

### Vai trò và điểm chuyển giao

`Player -> Coach -> Hệ thống -> Player -> Coach/Field Manager -> Hệ thống tài chính`

### Các bước demo

#### Chặng A - Player gửi yêu cầu

1. Đăng nhập Player và mở `/player/coaches`.
2. Chọn **HLV Lê Hoàng Dũng**.
3. Nhấn **ĐẶT LỊCH NGAY**.
4. Chọn **Khóa học - 8 buổi** để thể hiện quy trình lớn nhất.
5. Chọn ngày đầu tiên và một slot có trạng thái còn trống.
6. Cho thấy lịch dự kiến 8 buổi, tối đa 2 buổi/tuần.
7. Chỉ rõ thông báo **Chưa thu tiền**, Coach có 12 giờ duyệt.
8. **Bắt buộc:** Nhấn **Gửi Coach duyệt**.
9. Hệ thống chuyển đến **Huấn luyện của tôi** với trạng thái chờ Coach.
10. Ghi nhận số dư ví chưa thay đổi.

#### Chặng B - Coach duyệt yêu cầu

1. Đăng xuất Player, đăng nhập Coach.
2. Mở **Học viên của tôi** tại `/coach/bookings`.
3. Chọn booking vừa tạo, kiểm tra Player, lịch đầu, địa điểm và học phí.
4. **Bắt buộc:** Nhấn **Đồng ý giờ này**.
5. Kiểm tra trạng thái chuyển sang **Chờ Player thanh toán** và bộ đếm 15 phút xuất hiện.

**Nhánh mở rộng:** Dùng một yêu cầu khác để demo **Từ chối**; không từ chối booking đang dùng cho chuỗi chính.

#### Chặng C - Player thanh toán và nhận lịch

1. Đăng xuất Coach, đăng nhập lại Player.
2. Mở **Huấn luyện của tôi** tại `/player/coaching`.
3. Chọn booking đang chờ thanh toán.
4. Cho thấy bộ đếm 15 phút và hai phương thức Ví/VietQR.
5. **Bắt buộc:** Nhấn **Thanh toán 100%**.
6. Kiểm tra booking chuyển sang **Đã xác nhận** và số tiền còn lại bằng 0.
7. Mở **Lịch của tôi**, kiểm tra các buổi học được xếp.

#### Chặng D - Coach vận hành lớp

1. Đăng nhập Coach.
2. Mở **Điểm danh & đánh giá** tại `/coach/attendance`.
3. Chọn khóa học hoặc buổi học có sẵn.
4. Cập nhật điểm danh, tiêu chí kỹ thuật và phản hồi cho học viên.
5. Mở **Thu nhập & Ví** tại `/coach/wallet` để trình bày tiền đang giữ, chờ giải ngân và lịch sử giao dịch.

### Kết quả mong đợi

- Player gửi yêu cầu mà chưa bị trừ tiền.
- Coach tạo ra điểm kiểm soát duyệt/từ chối.
- Sau khi duyệt, booking chỉ được giữ 15 phút chờ thanh toán.
- Thanh toán thành công tạo lịch học và trạng thái xác nhận cho cả Player và Coach.

---

## SC-05 - Thanh toán, doanh thu và đối soát

### Mục tiêu nghiệp vụ

Chứng minh tiền đi qua các giai đoạn nạp ví, thanh toán dịch vụ, ghi nhận lịch/booking, hiển thị doanh thu đối tác và xử lý đối soát.

### Vai trò và điểm chuyển giao

`Player -> Hệ thống thanh toán -> FM/Coach -> Admin`

### Các bước demo

#### Chặng A - Player nạp ví

1. Đăng nhập Player.
2. Nhấn **Nạp tiền** trên header hoặc trong `/player/profile`.
3. Chọn 500.000đ hoặc nhập một số tiền khác.
4. Tạo VietQR mô phỏng.
5. Nhấn xác nhận đã chuyển khoản.
6. **Bắt buộc:** Kiểm tra số dư ví tăng và được giữ khi chuyển trang.

#### Chặng B - Player chi tiền

1. Mở `/player/vip` hoặc sử dụng booking từ SC-02/SC-03/SC-04.
2. Với VIP, chọn gói tháng, chọn Ví FITLYO và đồng ý điều khoản.
3. Nhấn **Thanh toán & kích hoạt ngay**.
4. Kiểm tra VIP được kích hoạt ngay và có thông báo không hoàn tiền.
5. Mở **Lịch của tôi** để chỉ trạng thái thanh toán của booking dịch vụ: tổng tiền, đã trả và còn lại 0đ.

#### Chặng C - FM theo dõi doanh thu

1. Đăng nhập FM.
2. Mở **Doanh thu & tỷ lệ lấp đầy** tại `/fm/reports`.
3. Giải thích doanh thu được phân theo Social, khách bao sân và lớp Coach.
4. Nhấn **Xuất file đối soát** để tải CSV.

#### Chặng D - Coach theo dõi và rút tiền

1. Đăng nhập Coach.
2. Mở `/coach/wallet`.
3. Chỉ rõ ba lớp số dư: khả dụng, đang giữ trong Escrow và đang chờ thanh toán.
4. Nhấn **Rút tiền**, chọn số tiền hợp lệ và xác nhận.
5. Kiểm tra yêu cầu rút được ghi nhận trong lịch sử giao dịch.

#### Chặng E - Admin giám sát

1. Đăng nhập Admin.
2. Mở `/admin/dashboard` để trình bày GMV, hội viên và tình trạng vận hành.
3. Mở `/admin/settings` để chỉ cấu hình phí Social, Coach và VIP.

### Kết quả mong đợi

- Player nhìn thấy số dư trước và sau giao dịch.
- Booking thể hiện đã thanh toán 100%, không còn phần trả tại quầy.
- FM và Coach có góc nhìn doanh thu/thu nhập riêng.
- Admin có góc nhìn quản trị phí và giao dịch toàn sàn.

### Giới hạn cần nói rõ

Dashboard FM, ví Coach và dashboard Admin hiện dùng dữ liệu mô phỏng riêng. Prototype chưa có một ledger backend duy nhất để chứng minh cùng một đồng tiền được đối soát xuyên cả bốn portal.

---

## SC-06 - Hủy lịch, sự cố, no-show và tranh chấp

### Mục tiêu nghiệp vụ

Chứng minh FITLYO không kết thúc trách nhiệm sau khi nhận tiền. Hệ thống phải xử lý hủy, hoàn tiền, bồi thường, báo cáo vi phạm và phán quyết Admin.

### Vai trò và điểm chuyển giao

`Player/Coach/FM -> Hệ thống chính sách -> Admin -> Ví và điểm uy tín`

### Các bước demo

#### Chặng A - Player hủy sân

1. Đăng nhập Player và mở `/player/schedule`.
2. Chọn booking sân đã tạo ở SC-03.
3. Nhấn **Hủy sân**.
4. Trước khi xác nhận, chỉ cho người xem mức hoàn dự kiến:
   - trước 12 giờ: hoàn 100%;
   - từ 6 đến 12 giờ: hoàn 50%;
   - dưới 6 giờ: không hoàn.
5. **Bắt buộc:** Nhấn **Xác nhận hủy**.
6. Kiểm tra booking chuyển sang lịch sử và tiền hoàn được cộng về Ví FITLYO nếu đủ điều kiện.

#### Chặng B - Coach hủy booking đã thanh toán

1. Đăng nhập Coach và mở `/coach/bookings`.
2. Chọn booking đã xác nhận từ SC-04.
3. Nhấn **Coach hủy lịch**.
4. Cho thấy chính sách hoàn 100% và voucher 10%, tối đa 100.000đ, hạn 30 ngày.
5. Xác nhận hủy.
6. Đăng nhập Player, mở `/player/coaching` và `/player/profile`.
7. Kiểm tra booking đã hoàn tiền và voucher bồi thường được hiển thị.

**Nhánh khóa học:** Coach chọn **Không thể xếp lại - Hủy buổi** tại một buổi trong khóa. Hệ thống hoàn `tổng học phí / 8` và cấp voucher.

#### Chặng C - Player báo cáo hành vi hoặc gian lận DUPR

1. Dùng một trận đã hoàn thành hoặc hoàn tất SC-02.
2. Trên màn hình đánh giá, chọn một báo cáo như **Cố tình khai khống trình độ DUPR**.
3. Nhập mô tả bằng chứng.
4. Gửi đánh giá.
5. Giải thích rằng báo cáo nghiệp vụ phải tạo hồ sơ cho Admin; prototype hiện mới mô phỏng nội dung báo cáo, chưa tự sinh bản ghi đồng bộ sang Admin Store.

#### Chặng D - Admin xử lý tranh chấp

1. Đăng nhập Admin.
2. Mở `/admin/disputes`.
3. Chọn một vụ việc đang mở trong dữ liệu mẫu.
4. Kiểm tra bên khiếu nại, bên bị khiếu nại, số tiền, timeline và bằng chứng.
5. Mở một bằng chứng để demo thao tác kiểm tra.
6. Chọn một quyết định:
   - **Hoàn tiền 100%**;
   - **Bác khiếu nại**; hoặc
   - **Chuyển pháp lý**.
7. **Bắt buộc:** Kiểm tra vụ việc chuyển sang trạng thái kết thúc tương ứng.

#### Chặng E - Sự cố sân và no-show

1. Đăng nhập FM, mở một slot đang có giao dịch.
2. Chỉ ra FM không thể chuyển trực tiếp slot này về trống hoặc bảo trì.
3. Giải thích quy trình đúng: xác định các booking bị ảnh hưởng, thông báo Player/Coach, điều chuyển sân nếu có, nếu không thì hoàn 100% và cấp voucher theo chính sách.
4. Với no-show, liên hệ lại màn hình QR/check-in: vé không được xác nhận đến sân sẽ chịu chính sách không hoàn và có thể ảnh hưởng điểm uy tín.

### Kết quả mong đợi

- Mức hoàn được tính trước khi người dùng xác nhận hủy.
- Coach/sân hủy dẫn đến hoàn tiền và voucher bồi thường.
- Khiếu nại có bằng chứng và quyết định rõ ràng từ Admin.
- Booking, thanh toán, ví và uy tín được mô tả như một quy trình xử lý thống nhất.

---

## 4. Ma trận truy vết màn hình

| Luồng | Màn hình/route chính |
|---|---|
| SC-01 | `/coach/verification`, `/admin/kyc`, `/coach/venues`, `/fm/coaches`, `/player/coaches` |
| SC-02 | `/fm/calendar`, `/player/matches`, `/player/matches/:id`, `/player/matches/:id/ticket`, `/player/matches/:id/review`, `/fm/checkin` |
| SC-03 | `/player/venues`, `/player/venues/:id`, `/player/schedule`, `/fm/calendar` |
| SC-04 | `/player/coaches`, `/player/coaching`, `/coach/bookings`, `/coach/attendance`, `/coach/wallet` |
| SC-05 | `/player/profile`, `/player/vip`, `/player/schedule`, `/fm/reports`, `/coach/wallet`, `/admin/dashboard`, `/admin/settings` |
| SC-06 | `/player/schedule`, `/player/coaching`, `/player/profile`, `/admin/disputes`, `/fm/calendar` |

## 5. Checklist trước khi trình bày

- [ ] `npm run dev` đang hoạt động.
- [ ] Đã nhấn **Làm mới data** đúng một lần.
- [ ] Đã thử đăng nhập cả bốn tài khoản mẫu.
- [ ] Có sẵn file JPG/PDF/PNG dưới 10 MB cho bước KYC.
- [ ] Player còn đủ số dư hoặc đã chuẩn bị bước nạp ví.
- [ ] Đã chọn kèo có DUPR chứa mức 3.42.
- [ ] Đã chọn slot sân/Coach không trùng lịch.
- [ ] Biết vị trí nút đăng xuất trên từng portal.
- [ ] Không làm mới trang dữ liệu giữa lúc chuyển vai trò nếu chưa cần.
- [ ] Sẵn sàng giải thích giới hạn mô phỏng và phần chưa có backend.

## 6. Câu kết thúc demo gợi ý

> FITLYO không chỉ cung cấp các màn hình riêng cho Player, Coach, chủ sân và Admin. Prototype đã mô phỏng được chuỗi nghiệp vụ từ kiểm định nguồn cung, tạo dịch vụ, giao dịch, thực hiện dịch vụ đến đối soát và xử lý ngoại lệ. Phần cần hoàn thiện cho MVP vận hành thật là backend giao dịch, dữ liệu dùng chung, payment callback, QR ký số và ledger đối soát xuyên portal.

