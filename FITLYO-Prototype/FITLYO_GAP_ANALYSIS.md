# FITLYO — Phân tích gap giữa prototype hiện tại và bộ tài liệu

> Ngày rà soát: 16/10/2026
> Phạm vi: mã nguồn prototype trong `FITLYO-Prototype`, PRD/SRS, tài liệu luồng nghiệp vụ và bộ Screen Specification trong `Documents/`.

## 1. Kết luận điều hành

Prototype hiện tại đã phủ giao diện của **34/36 màn hình được đặc tả** (xấp xỉ 94% về sự hiện diện của màn hình). Hai màn hình chưa có là `SCR_AUTH_05` và `SCR_AUTH_06`. Tuy nhiên, con số 94% chỉ phản ánh **đã có UI/route**, không phản ánh mức sẵn sàng vận hành thật.

Khoảng cách lớn nhất không nằm ở số lượng trang mà nằm ở kiến trúc và tính liên thông:

1. Dữ liệu đang được chia trong nhiều Zustand store và state cục bộ; cùng một sân, slot, người dùng hoặc khóa học có thể có trạng thái khác nhau giữa Player, Coach, Field Manager và Admin.
2. Authentication, thanh toán, Escrow, VietQR, Dynamic QR, GPS/bản đồ, chat và thông báo đều là prototype phía trình duyệt; chưa có backend xác thực hoặc dịch vụ tích hợp thật.
3. Phân quyền mới được chặn ở React Router. Người dùng thông thường không thể đi vào giao diện role khác qua route, nhưng chưa có API/server để kiểm tra quyền và quyền sở hữu dữ liệu.
4. Một số quy tắc nghiệp vụ trọng yếu chưa được thực thi: khóa slot nguyên tử, tự hủy phòng ở T-60, chính sách hoàn tiền theo thời điểm, 2FA, khóa brute-force, giới hạn Certified Coach, dời lịch khóa học và xử lý sân Inactive.
5. Có sai lệch dữ liệu 6 slot giữa các store và tài liệu; đây là lỗi nền tảng có thể gây đặt trùng hoặc hiển thị sai lịch nếu tiếp tục phát triển mà chưa chuẩn hóa.

**Đánh giá tổng quát:** prototype phù hợp để demo UX và kiểm chứng luồng nghiệp vụ. Chưa phù hợp để chạy pilot có giao dịch thật hoặc nhiều người dùng đồng thời.

## 2. Nguồn đối chiếu

- `Documents/FITLYO_PRD_Yeu_Cau_Phan_Mem - Publish.md`
- `Documents/FITLYO_Tai_Lieu_Luong_Nghiep_Vu.md`
- `Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec/FITLYO_Dac_Ta_Man_Hinh_SCR_AUTH.md`
- `Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec/FITLYO_Dac_Ta_Man_Hinh_SCR_MATCH.md`
- `Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec/FITLYO_Dac_Ta_Man_Hinh_SCR_VENUE.md`
- `Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec/FITLYO_Dac_Ta_Man_Hinh_SCR_USER.md`
- `Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec/FITLYO_Dac_Ta_Man_Hinh_SCR_COACH.md`
- `Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec/FITLYO_Dac_Ta_Man_Hinh_SCR_FM.md`
- `Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec/FITLYO_Dac_Ta_Man_Hinh_SCR_ADMIN.md`
- Route, page, component và store trong `src/`.

## 3. Quy ước đánh giá

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ | Đã có UI và tương tác chính tương đối sát tài liệu |
| 🟡 | Đã có nhưng còn thiếu trường, trạng thái, rule hoặc liên thông |
| 🔵 | Có luồng demo, nhưng dịch vụ thật đang được mô phỏng |
| 🔴 | Chưa có |
| ⚠️ | Hành vi hiện tại khác hoặc mâu thuẫn với tài liệu |

Mức ưu tiên:

- **P0:** ảnh hưởng bảo mật, tiền, quyền truy cập, trùng lịch hoặc tính nhất quán dữ liệu.
- **P1:** thiếu nghiệp vụ cốt lõi để hoàn thành hành trình người dùng.
- **P2:** báo cáo, UX nâng cao, trạng thái biên hoặc tối ưu kỹ thuật.

## 4. Ma trận bao phủ tổng thể

| Phân hệ | Số màn hình tài liệu | Có UI/route | Nhận định |
|---|---:|---:|---|
| Public & Authentication | 7 | 5 | Thiếu hồ sơ đăng ký Coach và Field Manager; auth thật/2FA chưa có |
| Social Matchmaking | 4 | 4 | Luồng demo khá đầy đủ; payment, QR, notification và rule thời gian chưa thật |
| Venue Discovery & Booking | 2 | 2 | Có tìm sân/đặt sân; bản đồ, GPS và chống overbooking đang mô phỏng |
| Player Profile & VIP | 3 | 3 | Có hồ sơ, VIP, lịch; lịch sử DUPR và subscription lifecycle còn thiếu |
| Coach & Coach Booking | 7 | 7 | Có portal và booking hai phía; liên thông dữ liệu và rule Certified chưa đầy đủ |
| Field Manager | 8 | 8 | Đủ page/modal; nhiều thao tác chỉ đổi state cục bộ hoặc dữ liệu demo |
| Admin | 5 | 5 | Đủ 5 màn hình; chưa thực thi thật lên tài khoản, ví, Escrow và cấu hình toàn hệ thống |
| **Tổng** | **36** | **34** | **Bao phủ UI cao, độ sẵn sàng production thấp** |

## 5. Gap chi tiết theo màn hình

### 5.1. Public và Authentication

| Mã | Hiện trạng prototype | Gap chính | Ưu tiên |
|---|---|---|---|
| `SCR_PUB_01` | ✅ Landing page có nhận diện FITLYO, nội dung sân/Coach/kèo, CTA và responsive | Nội dung/số liệu là tĩnh; một số CTA đối tác chưa dẫn đến onboarding tương ứng; chưa có SEO metadata/structured data được kiểm chứng | P2 |
| `SCR_AUTH_01` | 🟡 Login bằng 4 tài khoản mẫu; logout và điều hướng theo role hoạt động | Email/mật khẩu hard-code trong source; session có thể sửa trong localStorage; thiếu Google OAuth, Phone OTP login, quên mật khẩu, rate-limit và 2FA bắt buộc cho FM/Admin | P0 |
| `SCR_AUTH_02` | 🔵 Có form đăng ký | Chưa tạo tài khoản thật; chưa có backend validation, kiểm tra email/SĐT trùng, điều khoản có version và lưu consent | P1 |
| `SCR_AUTH_03` | 🔵 Có UI OTP 6 số | Không gửi/xác minh OTP thật; thiếu hạn 120 giây, giới hạn 5 lần sai và khóa 15 phút theo `BR-01`–`BR-03` | P0 |
| `SCR_AUTH_04` | 🟡 Có khảo sát DUPR nhiều bước | Chưa đồng bộ DUPR ID quốc tế; kết quả chỉ là dữ liệu prototype; chưa có versioning/cơ chế hiệu chỉnh bài khảo sát | P1 |
| `SCR_AUTH_05` | 🔴 Chưa có | Thiếu form nộp CCCD, chứng chỉ Coach, trạng thái hồ sơ và luồng gửi Admin duyệt | P1 |
| `SCR_AUTH_06` | 🔴 Chưa có | Thiếu form GPKD, hợp đồng mặt bằng, ảnh sân, tổng số sân và luồng gửi Admin duyệt | P1 |

### 5.2. Social Matchmaking

| Mã | Hiện trạng prototype | Gap chính | Ưu tiên |
|---|---|---|---|
| `SCR_MATCH_01` | ✅ Feed, tìm kiếm/lọc, thẻ kèo, tạo kèo và trạng thái cơ bản đã có | Dữ liệu không nhận đồng bộ đáng tin cậy từ FM; lọc khoảng cách không dùng GPS; thiếu realtime khi phòng vừa đầy/hủy | P0/P1 |
| `SCR_MATCH_02` | 🟡 Chi tiết roster, kiểm tra DUPR, chọn Ví/VietQR và giữ chỗ | Thanh toán/Escrow chỉ mô phỏng; không có idempotency/atomic lock; chưa kiểm tra xung đột toàn hệ thống tại server | P0 |
| `SCR_MATCH_03` | 🔵 Có vé, QR đổi chu kỳ UI, chỉ đường Google Maps, check-in và hủy vé | QR không được ký/xác minh bởi server; chat/gọi là toast; hủy luôn giả lập hoàn đủ, chưa tính mốc Free 12h/Premium 4h; chưa thu hồi token an toàn | P0 |
| `SCR_MATCH_04` | 🟡 Có đánh giá sau trận và cập nhật state | Chưa có chống tự đánh giá/đánh giá lặp, cửa sổ thời gian, moderation và thuật toán cập nhật DUPR/uy tín có thể audit | P1 |

**Sai lệch cần quyết định sản phẩm:** tài liệu RBAC/PRD ghi chỉ Field Manager và Admin được `Publish Social Match`, nhưng Player hiện có thể “Mở kèo” từ Match Feed và khi đặt sân. Nếu đây là tính năng mới “Player làm Host”, cần cập nhật PRD/RBAC. Nếu không, phải gỡ hoặc chặn bằng quyền phía server. **P0**.

### 5.3. Venue Discovery & Booking

| Mã | Hiện trạng prototype | Gap chính | Ưu tiên |
|---|---|---|---|
| `SCR_VENUE_01` | 🔵 Có Map/List, tìm kiếm, lọc khu vực/tiện ích và “Gần tôi” | Bản đồ và vị trí marker là mô phỏng; không có GPS/Maps SDK, geocoding, bán kính thật hoặc trạng thái slot realtime | P1 |
| `SCR_VENUE_02` | 🟡 Có chi tiết sân, tiện ích, ma trận 6 slot và checkout | Thiếu transaction khóa slot nguyên tử (`BR-08`); thanh toán mô phỏng; dữ liệu booking Player không cập nhật vào lịch FM; chưa có đánh giá sân đầy đủ và xử lý booking cạnh tranh | P0 |

### 5.4. Player Profile, VIP và Schedule

| Mã | Hiện trạng prototype | Gap chính | Ưu tiên |
|---|---|---|---|
| `SCR_USER_01` | 🟡 Có hồ sơ, DUPR, thống kê, ví và avatar | Upload ảnh chỉ mô phỏng; thiếu chỉnh sửa/kiểm chứng dữ liệu đầy đủ; lịch sử DUPR và nguồn thay đổi chưa có audit trail | P1 |
| `SCR_USER_02` | 🔵 Có bảng quyền lợi, gói tháng/năm, Ví/VietQR và trạng thái VIP | Không có subscription/billing thật, webhook, gia hạn, hết hạn, hóa đơn hoặc đồng bộ quyền VIP trên server | P0/P1 |
| `SCR_USER_03` | ✅ Có lịch kèo, sân và lịch Coach; liên kết đến vé/chi tiết | Thiếu notification nhắc lịch, timezone, đồng bộ calendar ngoài và xử lý tất cả trạng thái dời/hủy/bất khả kháng | P1 |

### 5.5. Coach Portal và Coach Booking

| Mã | Hiện trạng prototype | Gap chính | Ưu tiên |
|---|---|---|---|
| `SCR_COACH_01` | ✅ Dashboard/lịch dạy và KPI thu nhập đã có | Một phần lịch dựng từ dữ liệu mẫu; chưa nhận realtime từ booking/sân; đổi tuần chủ yếu là thông báo demo | P1 |
| `SCR_COACH_02` | 🟡 Tạo/sửa/công bố khóa học, chọn sân liên kết và slot | Chưa kiểm tra Certified Coach ở tầng nghiệp vụ; chưa khóa sân; khóa mới chưa chắc xuất hiện đồng nhất ở marketplace Player; thiếu lifecycle đầy đủ | P0/P1 |
| `SCR_COACH_03` | 🟡 Điểm danh, điểm kỹ năng, nhận xét và DUPR mới | Không có khóa chỉnh sửa sau chốt, lịch sử người sửa, xác nhận học viên hoặc cơ chế cập nhật DUPR đáng tin cậy | P1 |
| `SCR_COACH_04` | 🟡 Xem/gửi yêu cầu liên kết sân | Chưa đồng bộ hai chiều chắc chắn với `SCR_FM_05`; chưa thực thi hợp đồng/chiết khấu và quyền mở lớp theo sân | P0/P1 |
| `SCR_BOOK_01` | ✅ Có danh bạ Coach và bộ lọc cơ bản | Dữ liệu Coach/khóa học còn tĩnh; chưa có ranking, availability realtime và rule Free/Premium với Certified Coach | P1 |
| `SCR_BOOK_02` | ✅ Có hồ sơ riêng `/player/coaches/:coachId`, DUPR, kinh nghiệm, chứng chỉ, giá và sân hoạt động | Thiếu review/video thật; dữ liệu chứng chỉ chưa liên kết với hồ sơ KYC Admin và trạng thái hết hạn | P1 |
| `SCR_BOOK_03` | 🟡 Checkout gọn trong một dialog; có buổi lẻ/khóa 8 buổi, cọc 50%, lịch lặp và kiểm tra trùng | Payment là mô phỏng; xung đột chỉ trong dữ liệu trình duyệt; chưa khóa đồng thời slot Coach + Player + sân; thiếu chính sách dời tối đa 2 lần/báo trước 24h | P0 |

Các trang bổ sung `CoachProfilePage`, `CoachWalletPage`, `CoachBookingsPage` và `PlayerCoachingPage` hợp lý với luồng đã thống nhất, nhưng chưa được phản ánh đầy đủ trong Screen Specification. Cần cập nhật tài liệu để các trang này trở thành source of truth chính thức.

### 5.6. Field Manager

| Mã | Hiện trạng prototype | Gap chính | Ưu tiên |
|---|---|---|---|
| `SCR_FM_01` | ✅ Có ma trận sân/6 slot, đổi ngày, xem chi tiết và action theo trạng thái | Dữ liệu ngày khác vẫn là demo; thiếu realtime; thay đổi từ Player/Coach/Admin không hội tụ vào cùng một lịch | P0 |
| `SCR_FM_02` | 🟡 Có modal mở kèo và đẩy vào store FM | Kèo tạo từ FM không dùng cùng nguồn dữ liệu với Player feed; thiếu atomic lock và publish event/realtime | P0 |
| `SCR_FM_03` | 🟡 Có danh sách sân và bật bảo trì/mở lại | Thiếu thêm sân, loại/mặt sân, modal lịch bảo trì theo khoảng ngày/lý do; trạng thái đang nằm trong state cục bộ nên không cập nhật `SCR_FM_01`; chưa xử lý booking tương lai theo `BR-09` | P0 |
| `SCR_FM_04` | 🟡 Có thông tin cơ sở, giờ mở cửa, cọc và tiện ích | Thiếu bảng giá weekday/weekend theo 6 slot, album ảnh, quy định, bản đồ/preview mobile; submit chỉ toast và không cập nhật Player Venue | P0/P1 |
| `SCR_FM_05` | 🟡 Có danh sách và duyệt/tạm dừng Coach | Thiếu từ chối có lý do, contract modal, loại phí/chiết khấu và đồng bộ sang portal Coach/lịch sân | P1 |
| `SCR_FM_06` | 🟡 Có KPI, công suất và xuất CSV | Thiếu lọc khoảng ngày, heatmap/drilldown giao dịch, đối soát/rút tiền; tài liệu yêu cầu Excel/PDF trong khi prototype xuất CSV; số liệu chưa từ ledger thật | P1 |
| `SCR_FM_07` | 🔵 Có kiosk, mã mẫu như `PKB-1310-8849`, nhập tay, âm thanh, kết quả và xác nhận | Theo quyết định prototype, camera thật không triển khai; mở cửa/check-in chưa có thiết bị/API; chưa in phiếu thật; vé không được xác minh server-side | P0 nếu chạy thật |
| `SCR_FM_08` | 🔵 Có đầy đủ flow UI khách vãng lai, tiền mặt/VietQR/công nợ, phiếu K80 | Theo quyết định prototype, VietQR và in phiếu chỉ mô phỏng; thiếu POS/ledger, payment callback, máy in và đồng bộ booking server | P0 nếu chạy thật |

### 5.7. Admin

| Mã | Hiện trạng prototype | Gap chính | Ưu tiên |
|---|---|---|---|
| `SCR_ADMIN_01` | 🟡 Có queue KYC, hồ sơ, chứng từ và thao tác duyệt/yêu cầu bổ sung | File chỉ là metadata; xem file mô phỏng; quyết định duyệt chưa cấp/thu hồi quyền thật và chưa đồng bộ Coach/FM | P0 |
| `SCR_ADMIN_02` | 🟡 Có tìm kiếm, đổi role, cảnh báo, đóng băng ví và đình chỉ | Store Admin không persist; hành động không ảnh hưởng auth session/API; không có immutable audit log hoặc nguyên tắc least privilege | P0 |
| `SCR_ADMIN_03` | 🟡 Có ticket, bằng chứng, phán quyết hoàn tiền/bác/chuyển pháp lý | Không có ledger/Escrow thật, bằng chứng thật, workflow nhiều cấp và idempotency khi hoàn tiền | P0 |
| `SCR_ADMIN_04` | 🟡 Có cấu hình slot, hoa hồng, Escrow và audit panel | Cấu hình chỉ nằm trong memory; không áp dụng sang các store khác; audit log hiển thị là tĩnh; thiếu version/rollback và xác nhận 2FA | P0 |
| `SCR_ADMIN_05` | 🟡 Có dashboard GMV, hoa hồng, VIP, công suất và cảnh báo | Phần lớn KPI tĩnh; export mô phỏng; health API/QR không lấy từ observability thật; thiếu bộ lọc và drilldown | P1/P2 |

## 6. Gap kiến trúc và dữ liệu xuyên suốt

### 6.1. Các nguồn dữ liệu đang bị tách rời — P0

Hiện có ít nhất các nguồn state độc lập:

- `useAuthStore`: session và 4 tài khoản mẫu.
- `usePlayerStore`: hồ sơ Player, kèo, vé, lịch và venue phía Player; có persist localStorage.
- `useCoachBookingStore`: booking Coach và chat; có persist localStorage.
- `useFitlyoStore`: lịch FM, Coach, KYC, venue và dữ liệu dùng chung khác; phần lớn không persist.
- `useAdminStore`: user, dispute và cấu hình Admin; không persist.
- State cục bộ trong một số page như trạng thái sân tại `OwnerCourtsPage` và form `OwnerSettingsPage`.

Hậu quả cụ thể:

- FM publish một kèo chưa đảm bảo Player thấy cùng bản ghi đó.
- Player đặt sân chưa đảm bảo FM thấy slot bị khóa.
- Admin đổi cấu hình slot chưa làm thay đổi lịch của Player/FM/Coach.
- Admin khóa user hoặc đổi role không làm thay đổi tài khoản trong `useAuthStore`.
- FM duyệt Coach chưa đảm bảo portal Coach nhận quyền/sân liên kết.
- Refresh trang làm mất một số thay đổi nhưng giữ một số thay đổi khác, tạo trạng thái khó dự đoán.

### 6.2. Sai lệch chuẩn 6 slot — P0

Tài liệu quy định:

1. 06:00–07:30
2. 07:30–09:00
3. 15:30–17:00
4. 17:00–18:30
5. 18:30–20:00
6. 20:00–21:30

`useFitlyoStore` phần FM đang bám cấu hình trên. Trong khi `usePlayerStore`, `useAdminStore` và form Coach đang dùng Slot 3 = **09:00–10:30**, Slot 4 = **15:30–17:00**, đồng thời bỏ **17:00–18:30**. Cần chọn một cấu hình canonical trong database/config service và mọi phân hệ chỉ tham chiếu theo `slot_id`.

### 6.3. Authentication và RBAC — P0

- Mật khẩu mẫu nằm trong bundle frontend.
- Session localStorage không có chữ ký, thời hạn, refresh hoặc revoke.
- Route guard giúp UX đúng nhưng không phải ranh giới bảo mật.
- Chưa có backend ownership check: Coach chỉ sửa khóa của mình, FM chỉ sửa sân của mình, Player chỉ xem/sửa booking của mình.
- Chưa có 2FA bắt buộc cho Admin/FM, khóa brute-force, reset mật khẩu và audit đăng nhập.

### 6.4. Giao dịch, Escrow và chống trùng — P0

- Trừ/cộng ví là cập nhật object trên trình duyệt.
- VietQR là hình QR minh họa, không có bank/payment gateway callback.
- Không có payment intent, idempotency key, double-entry ledger hoặc đối soát.
- Không có transaction/unique constraint/distributed lock cho slot (`BR-08`).
- Kiểm tra trùng lịch Coach đã có giá trị demo nhưng không chống được hai trình duyệt/người dùng đặt cùng lúc.

### 6.5. Automation và realtime — P1

Chưa có job/event server cho:

- Tự hủy phòng thiếu người trước 60 phút (`BR-12`).
- Nhắc lịch, thay đổi sân, Coach duyệt/từ chối và payment status.
- Hết hạn VIP/chứng chỉ Coach.
- Giải ngân Escrow sau trận/buổi học.
- Notification in-app/email/SMS/push.
- Chat realtime và trạng thái đã đọc.

### 6.6. Quy tắc nghiệp vụ chưa đủ

- `BR-04`: hạn mức số sân sau KYC chưa được áp dụng.
- `BR-05`: chỉ sân `APPROVED` và active mới xuất hiện cho Player chưa được đảm bảo từ một nguồn dữ liệu chung.
- `BR-06`/`BR-07`/`BR-13`: giới hạn Uncertified và quyền Certified Coach chưa được enforce ở service.
- `BR-09`: đóng sân chưa điều chuyển/hoàn booking tương lai.
- `BR-11`: hủy Free 12h/Premium 4h chưa tính theo thời gian thật.
- `BR-12`: chưa tự giải tán phòng thiếu người.
- `BR-14`: tần suất/thời lượng khóa học chưa được validation đầy đủ.
- `BR-15`: chưa có yêu cầu dời lịch, tối đa 2 lần và mốc 24h.
- `BR-16`: chưa có bulk cancel/refund do bất khả kháng.
- `BR-17`: ngưỡng điểm uy tín chưa tự hạn chế matchmaking/đình chỉ.

## 7. Gap UI/UX, accessibility và hiệu năng

### Điểm đã đạt

- Đã áp dụng Be Vietnam Pro, logo FITLYO và palette `#143F42`, `#AFF0D3`, `#FFB697`, `#F8F6F0`.
- Có light/dark mode và lưu lựa chọn theme.
- Layout riêng theo role; muốn đổi role phải logout/login.
- Giao diện responsive, trạng thái chính dùng màu và nhãn, không chỉ dựa duy nhất vào màu.
- Ảnh minh họa trọng tâm đã chuyển sang chủ đề pickleball.

### Gap còn lại

- Chưa có kiểm thử WCAG có hệ thống: keyboard flow, focus trap, screen reader, contrast ở mọi state và reduced motion.
- Một số màn hình dữ liệu rộng vẫn cần cuộn ngang trên mobile; tài liệu định hướng mobile-first cho Player.
- Loading/error/empty/skeleton chưa được triển khai đủ “5 UI states” cho mọi màn hình.
- Nhiều số điện thoại, ngày tháng và nội dung demo hard-code; chưa có i18n/timezone.
- Build thành công nhưng bundle JS chính khoảng **1,018 kB** minified; Vite cảnh báo chunk trên 500 kB. Chưa lazy-load theo role/route.
- Ảnh JPEG khoảng 316–511 kB/ảnh; cần WebP/AVIF, responsive `srcset`, lazy loading và CDN cho production.

## 8. Kiểm thử và chất lượng

- `npm run build` tại thời điểm rà soát: **thành công**.
- Chưa thấy script unit test, integration test hoặc E2E trong `package.json`.
- Chưa có test tự động cho RBAC, thanh toán, hoàn tiền, overbooking, QR replay, lịch lặp, timezone và migration localStorage.
- MSW có trong dự án nhưng phần lớn luồng mới thao tác trực tiếp store, chưa mô phỏng ranh giới API nhất quán.
- Chưa có CI quality gate được thể hiện trong phạm vi mã nguồn đã rà soát.

## 9. Các quyết định prototype đã được xác nhận

Những mục dưới đây là chủ đích demo, không nên ghi nhận như lỗi UI:

- Authentication dùng tài khoản mẫu và localStorage, không có backend.
- Player payment, VietQR, Dynamic QR, GPS/Google Maps và cập nhật DUPR là mô phỏng.
- `SCR_FM_07` dùng mã mẫu như `PKB-1310-8849`, không dùng camera thật.
- `SCR_FM_08` mô phỏng đầy đủ UI; VietQR và in phiếu không tích hợp thiết bị thật.
- Coach portal hiện dành cho Coach đã được duyệt — HLV Lê Hoàng Dũng.
- Booking Coach cọc 50%; khóa 8 buổi chọn buổi đầu rồi tự xếp 7 buổi còn lại với tần suất 2 buổi/tuần.
- Chặn trùng với booking Coach khác và lịch hiện có của Player ở mức prototype.
- Liên hệ Player–Coach bằng chat nội bộ; đã bỏ Zalo.

Các quyết định này cần được đưa vào PRD/Screen Spec phiên bản mới để tránh tài liệu và prototype tiếp tục lệch nhau.

## 10. Backlog khuyến nghị

### Giai đoạn P0 — tạo nền tảng đúng và an toàn

1. Chốt lại quyền “Player tạo Social Match” và cập nhật RBAC/PRD trước khi code tiếp.
2. Chuẩn hóa một bảng `slot_templates` canonical; sửa sai lệch Slot 3/4 ở Player, Coach và Admin.
3. Thiết kế domain model/database chung cho User, Venue, Court, Slot, Match, Booking, Course, Wallet, Ledger, KYC và Dispute.
4. Xây Auth API, password hashing, OTP, 2FA, session/token revoke và server-side RBAC/ownership.
5. Xây Booking service có database transaction, unique constraint/atomic lock và idempotency.
6. Xây payment/Escrow ledger; VietQR/gateway callback; refund và reconciliation.
7. Hợp nhất dữ liệu giữa 4 portal qua API/event; loại bỏ các bản sao domain data trong nhiều store.
8. Bổ sung `SCR_AUTH_05` và `SCR_AUTH_06`; nối KYC với Admin và quyền account thực tế.

### Giai đoạn P1 — hoàn thiện hành trình nghiệp vụ

1. Realtime slot/match/booking và notification service.
2. Tự hủy match T-60, hủy theo mốc Free/Premium, bất khả kháng và no-show.
3. Course lifecycle, dời lịch tối đa 2 lần, thông báo 24h và giải ngân theo buổi.
4. FM court maintenance theo khoảng ngày; xử lý booking tương lai.
5. Pricing weekday/weekend, ảnh/quy định venue và đồng bộ sang Player.
6. Coach certification expiry, marketplace visibility và review/video.
7. Admin audit log bất biến, KYC document storage và dispute evidence workflow.

### Giai đoạn P2 — chất lượng và tăng trưởng

1. Hoàn thiện 5 UI states trên mọi màn hình và accessibility audit.
2. Lazy-load theo role/route, tối ưu ảnh và giảm bundle.
3. Báo cáo thật, Excel/PDF, filter/drilldown và observability dashboard.
4. SEO landing page, analytics funnel và A/B testing CTA.
5. Unit/integration/E2E test cùng CI gate.

## 11. Tiêu chí để chuyển từ prototype sang pilot

Chỉ nên chạy pilot với người dùng thật khi tối thiểu đạt các điều kiện sau:

- Không còn dữ liệu domain bị chia rời giữa các portal.
- Auth/RBAC/ownership được kiểm tra ở backend.
- Booking không thể overbook trong kiểm thử đồng thời.
- Mọi thay đổi tiền có ledger, idempotency và audit trail.
- QR được ký, có thời hạn, chống replay và xác minh server-side.
- Chính sách hủy/hoàn/no-show/bất khả kháng chạy bằng thời gian thật.
- Có test E2E cho 4 hành trình: đặt kèo, đặt sân, đặt Coach và xử lý tranh chấp.
- Có logging, monitoring, backup và quy trình xử lý sự cố.

---

## Phụ lục — Các file mã nguồn chính đã rà soát

- Routing và guard: `src/routes/index.tsx`, `src/components/auth/RoleGuard.tsx`, `src/store/useAuthStore.ts`
- Player: `src/pages/player/*`, `src/store/usePlayerStore.ts`
- Coach booking/chat: `src/components/player/CoachBookingDialog.tsx`, `src/pages/CoachBookingsPage.tsx`, `src/pages/player/PlayerCoachingPage.tsx`, `src/store/useCoachBookingStore.ts`
- Field Manager: `src/pages/CourtCalendarPage.tsx`, `src/pages/Owner*.tsx`, `src/pages/CheckInKioskPage.tsx`, `src/components/modals/*`
- Coach: `src/pages/Coach*.tsx`
- Admin: `src/pages/admin/*`, `src/store/useAdminStore.ts`
- Branding/theme: `src/index.css`, `src/components/brand/BrandLogo.tsx`, `src/assets/brand/*`, `src/assets/fonts/*`
