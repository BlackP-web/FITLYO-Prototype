# FITLYO — Phân tích Minimum Viable Product từ prototype hiện tại

> Ngày phân tích: 21/10/2026  
> Phạm vi: mã nguồn prototype, luồng nghiệp vụ, bộ Screen Specification và báo cáo gap hiện có trong repository.  
> Trạng thái tài liệu: đề xuất chiến lược MVP; các mức giá mới là giả thuyết cần kiểm chứng, không phải cam kết thương mại.  
> Cập nhật chính sách ngày 22/10/2026: Social Session, đặt sân, Coach và VIP đều thanh toán 100%; không còn cọc 50%. Coach chỉ thanh toán sau khi Coach duyệt và có thời hạn 15 phút.

## 1. Kết luận điều hành

FITLYO hiện đã chứng minh tốt **hình dạng sản phẩm** và **khả năng kể câu chuyện end-to-end** cho bốn nhóm người dùng: Player, Coach, Field Manager và Admin. Prototype có landing page, phân quyền theo role, tìm kèo theo DUPR, đặt sân, đặt Coach, thanh toán 100%, QR, lịch vận hành sân 10 slot, KYC, Escrow, tranh chấp và báo cáo.

Tuy nhiên, đây chưa phải một MVP có thể thu tiền thật. Phần đã hoàn thiện chủ yếu là UI và tương tác trong trình duyệt; authentication, booking đồng thời, thanh toán, Escrow, VietQR, Dynamic QR, thông báo và dữ liệu liên portal chưa được bảo đảm bởi backend.

**Đề xuất định vị MVP:**

> FITLYO giúp người chơi pickleball tại TP. Thủ Đức tìm đúng buổi chơi theo trình độ, xác nhận booking bằng thanh toán minh bạch và check-in rõ ràng; đồng thời giúp cụm sân lấp đầy slot và vận hành lịch trên một nguồn dữ liệu chung.

Coach Marketplace là hướng tăng trưởng tốt nhưng nên là **MVP 1.1**, sau khi vòng lặp Player–Match–Venue–Deposit–Check-in hoạt động ổn định. VIP, AI nâng cao, dự báo nhu cầu và app native nên để sau khi đã chứng minh retention.

### 1.1. Đánh giá nhanh

| Hạng mục | Prototype chứng minh | Sẵn sàng chạy pilot thật | Nhận định |
|---|---:|---:|---|
| Uses | 8/10 | 5/10 | Nhiều hành trình đã nhìn thấy và bấm được, nhưng chưa có dịch vụ thật phía sau |
| Specs / hiệu năng | 5/10 | 3/10 | Build thành công; bundle lớn, chưa có API/SLA/concurrency test |
| Interface | 8/10 | 6/10 | Nhận diện mạnh, portal rõ; một số trang dày và dữ liệu demo chưa nhất quán |
| Packaging | 7/10 | 5/10 | Responsive web phù hợp giai đoạn đầu; chưa phải PWA/offline và chưa tích hợp thiết bị |
| Price | 6/10 | 4/10 | Đã có cấu trúc giá; chưa có willingness-to-pay, CAC, take-rate và unit economics thật |
| Special Features / defensibility | 7/10 | 4/10 | Ý tưởng hệ sinh thái mạnh; lợi thế dữ liệu/mạng lưới chưa hình thành |
| Support | 4/10 | 2/10 | Có UI xử lý tranh chấp nhưng chưa có SLA, công cụ CS và quy trình trực vận hành |

**Kết luận:** prototype phù hợp để demo, usability test và bán ý tưởng cho đối tác sân. Để trở thành MVP pilot, cần thu hẹp phạm vi và đầu tư trước vào backend giao dịch, dữ liệu chung, vận hành hỗ trợ và đo lường.

## 2. Đánh giá theo tiêu chí CP2

### 2.1. CP2 chấm điều gì

Theo tiêu chí đã được xác nhận:

> **CP2 đánh giá việc các chức năng của prototype có trả lời đúng những market pains đã nêu hay không, và prototype đã hoàn tất giải pháp cho các market pains đó đến mức nào.**

Do đó, “có nhiều màn hình” không đồng nghĩa với đạt CP2. Muốn đạt CP2, mỗi market pain phải có:

1. Chức năng trực tiếp xử lý nguyên nhân của pain.
2. Một hành trình người dùng có thể hoàn thành từ đầu đến cuối.
3. Trạng thái thành công, thất bại và ngoại lệ hợp lý.
4. Bằng chứng trong prototype cho thấy giải pháp hoạt động, không chỉ là nội dung mô tả.

### 2.2. Các market pains đang được FITLYO tuyên bố

Dựa trên phần giới thiệu dự án và tài liệu nghiệp vụ, FITLYO đang tập trung vào ba pain chính:

| Mã pain | Market pain | Hệ quả với thị trường |
|---|---|---|
| MP-01 | Người chơi khó tìm bạn/kèo ngang trình | Mất thời gian tìm nhóm, trận đấu lệch trình, trải nghiệm kém và khó duy trì chơi thường xuyên |
| MP-02 | Bỏ kèo, no-show và thiếu cơ chế thanh toán minh bạch | Người chơi và sân mất niềm tin, slot bị lãng phí, phát sinh tranh chấp tiền |
| MP-03 | Lịch sân và nguồn cầu bị phân mảnh, khó lấp đầy slot | Chủ sân quản lý thủ công, Player không biết chỗ trống thật, dễ đặt trùng hoặc bỏ lỡ slot |

Coach Booking, KYC Coach và khóa học là một pain/vertical bổ sung có giá trị, nhưng hiện chưa được trình bày nhất quán như một trong ba market pains cốt lõi. Nếu nhóm muốn dùng Coach làm luận điểm chính khi bảo vệ CP2, cần bổ sung pain statement và bằng chứng khảo sát tương ứng.

### 2.3. Ma trận truy vết Market Pain → Chức năng → Mức hoàn tất

| Market pain | Chức năng trả lời pain | Bằng chứng trong prototype | Phần chưa hoàn tất | Kết luận CP2 |
|---|---|---|---|---|
| **MP-01: Khó tìm kèo ngang trình** | Hồ sơ DUPR; khảo sát DUPR ban đầu; feed kèo; lọc theo DUPR/khu vực/ngày/slot; hiển thị số người và khoảng trình; đánh giá sau trận | Player có thể đăng nhập, xem kèo phù hợp với DUPR 3.42, lọc danh sách, mở chi tiết, tham gia và đánh giá trình độ sau trận | DUPR chưa được xác minh/sync thật; ranking chủ yếu là dữ liệu và rule tĩnh; chưa đo match quality; chưa realtime khi phòng vừa đầy | **Đúng pain, giải pháp UI gần đầy đủ; giải pháp vận hành mới hoàn tất một phần** |
| **MP-02: Bỏ kèo/no-show** | Thanh toán 100%; Ví/VietQR; Escrow; chính sách hủy; Dynamic QR; điểm uy tín; đánh giá/no-show; Admin dispute/refund | Prototype trình bày tổng phí trước xác nhận, tạo vé QR, mô phỏng check-in, hủy và xử lý tranh chấp ở Admin | Không có payment gateway, ledger, giữ tiền hoặc refund thật; QR chưa ký/chống replay; policy chưa chạy bằng clock server; chưa tự phạt no-show | **Trả lời rất đúng pain về mặt thiết kế, nhưng chưa hoàn tất giải pháp cốt lõi** |
| **MP-03: Lịch sân phân mảnh/slot trống** | Lịch chuẩn 10 slot; ma trận FM; trạng thái Available/Social/Coach/Private/Maintenance; FM publish Social Match; Player khám phá/đặt sân; báo cáo công suất | FM có thể xem lịch 06:00–21:00, mở kèo, xem người đặt và báo cáo; Player có thể xem sân/slot và thực hiện checkout | Player và FM chưa dùng database chung; chưa khóa slot nguyên tử; không có realtime; cấu hình Admin chưa áp dụng xuyên hệ thống; booking cạnh tranh chưa được xử lý | **Đúng pain và thể hiện tốt workflow, nhưng chưa khép kín dữ liệu end-to-end** |

### 2.4. Điểm CP2 hiện tại

| Tiêu chí chấm | Đánh giá | Lý do |
|---|---:|---|
| Chức năng có bám market pains không? | **8,5/10** | Ba nhóm feature chính liên kết khá trực tiếp với ba pain đã tuyên bố |
| Prototype có cho thấy solution flow không? | **8/10** | Có thể đi qua Player, FM và Admin để hiểu giải pháp |
| Prototype có hoàn tất giải pháp CP2 không? | **4/10** | Các mắt xích quan trọng nhất về tiền, locking, realtime và dữ liệu chung vẫn là mô phỏng |
| Bằng chứng validation thị trường | **3/10** | Chưa thấy dữ liệu interview, khảo sát pain severity, task test hoặc KPI pilot trong repository |
| Mức sẵn sàng bảo vệ trước giảng viên | **6,5/10** | Câu chuyện tốt nhưng cần trình bày trung thực “solution validated bằng prototype”, chưa gọi là “solution hoàn tất” |

### 2.5. Kết luận CP2

**FITLYO trả lời đúng market pains, nhưng chưa hoàn tất giải pháp CP2 ở cấp MVP vận hành thật.**

Prototype hiện chứng minh được:

- Nhóm hiểu pain và đã ánh xạ pain sang chức năng phù hợp.
- Luồng UX đủ rõ để người dùng hình dung cách giải pháp hoạt động.
- Các vai trò Player–FM–Admin đã xuất hiện trong cùng một service blueprint.

Prototype chưa chứng minh được:

- Kèo thực sự cân bằng hơn nhờ DUPR.
- Thanh toán trước và chính sách hủy thực sự làm giảm no-show.
- Lịch chung thực sự làm tăng tỷ lệ lấp đầy sân.
- Payment, Escrow, QR và chống đặt trùng hoạt động trong điều kiện nhiều người dùng.

Khi thuyết trình, nên nói:

> “Prototype đã hoàn tất việc mô phỏng end-to-end ba giải pháp cho ba market pains. Nhóm chưa tuyên bố đã giải quyết hoàn toàn các pain ngoài thị trường; giai đoạn MVP pilot sẽ kiểm chứng bằng tỷ lệ kèo đúng trình, no-show rate và slot utilization.”

## 3. Phạm vi MVP đề xuất

### 3.1. Must-have để hoàn tất giải pháp CP2

1. Đăng ký/đăng nhập Player và Field Manager; Admin vận hành nội bộ.
2. Một nguồn dữ liệu canonical cho Venue, Court, 10 slot 90 phút, Match, Booking và Payment.
3. Player tìm/lọc buổi chơi theo khu vực, thời gian và khoảng DUPR.
4. Field Manager publish Social Match từ slot còn trống.
5. Giữ slot nguyên tử, chống hai người đặt cùng một chỗ.
6. Thanh toán 100% có callback, trạng thái rõ và ledger đối soát.
7. Chính sách hủy, hoàn tiền và no-show chạy theo thời gian thật.
8. QR có chữ ký, hết hạn và được xác minh phía server.
9. Lịch cá nhân Player và ma trận sân FM cùng đọc một booking.
10. Thông báo xác nhận, thay đổi, hủy và nhắc lịch.
11. Admin tra cứu giao dịch, hỗ trợ hoàn tiền và xử lý tranh chấp cơ bản.
12. Analytics cho funnel: xem kèo → giữ chỗ → thanh toán → check-in → quay lại.

### 3.2. Nên để MVP 1.1

- Danh bạ Coach đã xác minh, lịch Coach, buổi lẻ và khóa 8 buổi.
- Liên kết Coach–cụm sân và chia doanh thu.
- Điểm danh/đánh giá học viên.
- KYC Coach và Field Manager hoàn chỉnh.
- Báo cáo doanh thu nâng cao cho đối tác.

### 3.3. Không nên là điều kiện ra mắt MVP

- App iOS/Android native.
- AI Coach hoặc chatbot tổng quát.
- Dự báo giá động tự động.
- Bảo hiểm tích hợp sâu.
- Gamification/coin phức tạp.
- Dashboard Admin quá nhiều KPI chưa có dữ liệu thật.
- Cửa thông minh, máy in phiếu và camera QR chuyên dụng.
- VIP subscription trước khi chứng minh người dùng quay lại thường xuyên.

## 4. Uses — Sản phẩm làm được gì

### 4.1. Guest

| Use case | Hiện trạng | MVP cần đạt |
|---|---|---|
| Hiểu giá trị FITLYO | Landing page đã có nội dung sân, kèo, Coach | Một thông điệp chính, CTA “Tìm buổi chơi”, SEO và dữ liệu động |
| Xem sân/kèo/Coach | Có nội dung khám phá | Chỉ hiển thị dữ liệu active và còn hiệu lực |
| Đăng ký | Có UI đăng ký/OTP/DUPR seed | Tạo tài khoản thật, OTP thật, consent có version |

### 4.2. Player

| Use case | Hiện trạng | MVP cần đạt |
|---|---|---|
| Tìm kèo theo DUPR, khu vực, ngày và slot | Có feed và bộ lọc | Kết quả realtime, không hiển thị slot hết hạn |
| Xem chi tiết và số chỗ | Có roster, phí, chính sách | Số chỗ lấy từ server, cập nhật khi có người giữ chỗ |
| Thanh toán/tham gia | Ví và VietQR mô phỏng | Payment intent, idempotency, callback và biên nhận |
| Nhận vé/check-in | Dynamic QR mô phỏng | QR ký số, TTL ngắn, chống replay |
| Hủy/hoàn | Có thông điệp chính sách | Rule tự động, ledger hoàn tiền và thông báo |
| Đánh giá sau trận | Có UI và cập nhật state | Chống đánh giá lặp, audit và moderation |
| Đặt sân riêng | Có khám phá/chi tiết/checkout | Khóa slot nguyên tử và đồng bộ sang FM |
| Đặt Coach | Luồng UI khá đầy đủ | Nên triển khai ở MVP 1.1 |

### 4.3. Field Manager

| Use case | Hiện trạng | MVP cần đạt |
|---|---|---|
| Xem lịch 10 slot 06:00–21:00 | Có ma trận vận hành rõ | Realtime, sticky headers và dữ liệu theo ngày thật |
| Mở Social Match | Có flow publish | Ghi vào cùng nguồn dữ liệu Player và khóa court slot |
| Quản lý sân/bảo trì | Có UI cơ bản | Khoảng thời gian bảo trì và xử lý booking tương lai |
| Check-in QR | Có kiosk mã mẫu | Xác minh server dưới 3 giây và audit nhân viên |
| Khách vãng lai | Có flow FM08 | Ghi booking/thu tiền vào ledger và xuất phiếu thật ở giai đoạn sau |
| Đối soát doanh thu | Có KPI demo | Drilldown theo booking, phí, hoàn tiền và settlement |

### 4.4. Coach

Prototype đã chứng minh các use case: xem lịch, nhận booking, chat học viên, tạo khóa học, điểm danh/đánh giá, liên kết sân, cập nhật hồ sơ và xem ví. Đây là một vertical có giá trị, nhưng triển khai production đồng thời với core marketplace sẽ làm tăng đáng kể độ phức tạp của lịch, thanh toán và tranh chấp. Khuyến nghị phát hành sau khi core booking ổn định.

### 4.5. Admin

Prototype đã có Dashboard, KYC, User/RBAC, Dispute/Escrow và Global Settings. MVP thật chỉ cần ưu tiên:

- Tra cứu user/booking/payment.
- Duyệt/tạm khóa venue.
- Xem bằng chứng và xử lý refund.
- Cấu hình phí/chính sách có version.
- Audit log bất biến.

Dashboard GMV, health và biểu đồ chỉ có ý nghĩa sau khi lấy từ telemetry thật.

## 5. Specs — Mức hiệu năng và chất lượng cần đạt

### 5.1. Hiện trạng kỹ thuật đo được

Lệnh `npm run build` ngày 21/10/2026 chạy thành công:

- 2.134 modules được transform.
- JS ứng dụng chính: khoảng **1.060 kB minified / 281 kB gzip**.
- JS MSW/browser: khoảng **392 kB minified / 152 kB gzip**.
- CSS: khoảng **155 kB minified / 22 kB gzip**.
- Mỗi ảnh pickleball hiện khoảng **316–511 kB**.
- Vite cảnh báo chunk lớn hơn 500 kB.
- Chưa có script unit, integration hoặc E2E test trong `package.json`.

Build này chấp nhận được cho demo trên Wi-Fi, nhưng chưa tối ưu cho mobile 4G và chưa chứng minh hiệu năng giao dịch.

### 5.2. Performance budget cho MVP pilot

| Chỉ số | Mục tiêu đề xuất |
|---|---:|
| LCP | ≤ 2,5 giây tại p75 trên mobile 4G |
| INP | ≤ 200 ms tại p75 |
| CLS | ≤ 0,1 |
| Initial JS | ≤ 200–250 kB gzip cho landing/Player entry |
| Ảnh card | WebP/AVIF, thông thường ≤ 150 kB |
| API đọc feed/lịch | p95 ≤ 500 ms |
| API giữ chỗ/booking | p95 ≤ 800 ms, phản hồi cuối ≤ 2 giây |
| Xác minh QR | ≤ 3 giây kể cả mạng di động yếu |
| Uptime pilot | ≥ 99,5% theo tháng |
| Error rate giao dịch | < 0,5% không tính lỗi người dùng |

### 5.3. Tính đúng dữ liệu

- Không được overbook khi nhiều người cùng đặt một slot.
- Mỗi payment callback và refund phải idempotent.
- Tổng ledger phải cân bằng; không sửa trực tiếp số dư ví.
- Player, FM, Coach và Admin phải thấy cùng một Booking ID/trạng thái.
- Tất cả thời gian lưu UTC, hiển thị theo Asia/Ho_Chi_Minh.
- Giá đã xác nhận của booking không được thay đổi khi FM cập nhật bảng giá tương lai.

### 5.4. Bảo mật tối thiểu

- Mật khẩu hash phía server; không chứa credential demo trong production bundle.
- OTP có TTL, giới hạn số lần thử và rate limit.
- 2FA bắt buộc cho Admin và Field Manager.
- Server-side RBAC và ownership check; route guard phía React không được xem là ranh giới bảo mật.
- Upload KYC vào private object storage, URL có hạn và có malware scanning.
- Mã hóa khi truyền/lưu, audit log cho tiền và thao tác Admin.
- Kiểm tra nghĩa vụ bảo vệ dữ liệu cá nhân và lưu trữ hồ sơ theo quy định áp dụng trước pilot.

### 5.5. Khả năng chịu tải ban đầu

MVP chưa cần thiết kế cho quy mô toàn quốc. Mức pilot hợp lý:

- 5–10 cụm sân.
- 30–50 courts.
- 1.000–3.000 tài khoản Player đăng ký.
- 100–300 người dùng hoạt động/ngày.
- Chịu được ít nhất 20 yêu cầu đồng thời tranh một slot mà vẫn chỉ có đúng một kết quả hợp lệ.

### 5.6. Quality gate trước pilot

- E2E bắt buộc: đăng ký, đặt kèo, thanh toán, QR, hủy/hoàn, FM publish và Admin refund.
- Unit test cho pricing, lịch 10 slot, conflict detection và cancellation policy.
- Integration test cho payment callback, idempotency và notification.
- Monitoring lỗi frontend/backend, latency, queue, payment và QR.
- Backup/restore đã diễn tập; có runbook sự cố.

## 6. Interface — Khách dùng thế nào và UI phức tạp tới đâu

### 6.1. Kiến trúc trải nghiệm đề xuất

| Persona | Thiết bị chính | Mức phức tạp phù hợp |
|---|---|---|
| Guest/Player | Mobile web trước, desktop sau | Thấp; một tác vụ chính mỗi màn hình |
| Coach | Mobile + laptop | Trung bình; lịch, booking, học viên, ví |
| Field Manager | Tablet/laptop tại quầy | Trung bình–cao; ma trận sân và thao tác nhanh |
| Admin | Desktop | Cao nhưng phải có filter, audit và confirm rõ |

### 6.2. Điểm interface đã tốt

- Brand FITLYO rõ, màu sắc nhất quán và có light/dark mode.
- Portal tách theo role; không đổi vai trò tùy tiện trong cùng session.
- Player feed và hồ sơ Coach có hierarchy dễ hiểu.
- Ma trận sân FM giúp nhận biết trạng thái nhanh.
- Booking Coach hiển thị tổng học phí thanh toán 100% và tóm tắt chi phí rõ.
- Admin KYC và Dispute đã mô phỏng được tư duy vận hành thực tế.

### 6.3. Phần cần giảm phức tạp

1. Landing page có quá nhiều mục tiêu; chọn CTA chính “Tìm buổi chơi”.
2. Card Coach đang gần như lặp lại trang chi tiết; rút còn dữ liệu so sánh cốt lõi.
3. Booking Coach một màn hình phù hợp desktop nhưng quá dày cho mobile; dùng progressive disclosure và sticky summary.
4. Ma trận FM cần sticky row/column, current-time marker và responsive tablet.
5. Ẩn mã `SCR_*`, credential mẫu và nội dung “prototype” khỏi production.
6. Ngày/giờ phải sinh động; không hard-code “Hôm nay” hoặc lịch quá hạn.
7. Chuẩn hóa 5 state cho mọi màn hình: loading, empty, error, ideal và edge/conflict.

### 6.4. Nguyên tắc UX của MVP

- Người mới hoàn tất tìm và giữ một chỗ trong tối đa 3 phút.
- Tối đa 5 bước từ feed đến xác nhận thanh toán.
- Luôn hiển thị tổng tiền, số tiền phải thanh toán, điều kiện hoàn và thời hạn thanh toán trước CTA cuối.
- Khi xung đột, giải thích slot nào bị trùng và đưa ra 3 lựa chọn gần nhất.
- Mọi booking có một mã duy nhất và một trang trạng thái duy nhất.
- Không dùng chỉ màu sắc để thể hiện trạng thái.
- Đạt WCAG 2.1 AA cho luồng cốt lõi: keyboard, focus, label, contrast và screen reader.

## 7. Packaging — Hình thức sản phẩm

### 7.1. Gói sản phẩm phù hợp nhất

**Giai đoạn MVP: Responsive Web SaaS + PWA nhẹ**

- Player truy cập bằng link, không bắt cài app trước khi đặt lần đầu.
- FM dùng dashboard web trên laptop/tablet tại quầy.
- Admin dùng desktop web.
- Có thể thêm “Add to Home Screen”, push notification và cache shell sau khi core web ổn định.

### 7.2. Vì sao chưa cần app native

- Web giảm ma sát acquisition và rút ngắn thời gian thử nghiệm.
- Core value là booking/coordination, chưa cần cảm biến hoặc API native đặc thù.
- Native iOS/Android làm tăng chi phí release, QA và support trước khi có retention.

Chỉ nên đầu tư app native khi đạt một trong các tín hiệu: tỷ lệ quay lại tháng cao, push notification có tác động rõ, hoặc người dùng thường xuyên dùng QR/check-in và lịch cá nhân.

### 7.3. Phần vật lý

MVP không cần bán thiết bị. Tại quầy chỉ cần điện thoại/tablet có camera. Máy in phiếu K80, kiosk riêng, mở cửa/bật đèn tự động là add-on sau. Điều này giữ mô hình asset-light và giảm chi phí onboarding sân.

### 7.4. Mô hình phân phối

- B2C: Player tự đăng ký qua landing/referral/community.
- B2B2C: onboarding từng cụm sân để tạo thanh khoản cục bộ.
- Supply-first theo cụm địa lý: tập trung 1–2 phường/khu vực trước thay vì phủ mỏng toàn TP.HCM.
- Mỗi sân là một điểm phân phối Player qua QR tại quầy, vé và chương trình Social Match.

## 8. Price — Chiến lược giá và mức giá đề xuất

### 8.1. Giá đang thể hiện trong prototype

| Hạng mục | Giá/cơ chế hiện tại |
|---|---:|
| Player Free | 0đ |
| FITLYO VIP tháng | 99.000đ/tháng |
| FITLYO VIP năm | 899.000đ/năm |
| Phí giao dịch Free | 2,5%; VIP được miễn |
| Hoa hồng Social Match | 5% |
| Hoa hồng Coach | 10% |
| Thanh toán Coach | 100% sau khi Coach duyệt; thời hạn 15 phút |
| Coach mẫu | 300.000–450.000đ/buổi |
| Khóa học landing | 1.600.000–3.600.000đ |
| Kèo mẫu | Thanh toán khoảng 35.000–55.000đ/người |
| Giá sân hiển thị landing | Khoảng 100.000–200.000đ, nhưng đơn vị thời lượng chưa luôn rõ |

### 8.2. Tham chiếu giá công khai

Các nguồn công khai chỉ dùng làm mốc tham khảo, không phải nghiên cứu thị trường đầy đủ:

- Một Social Match trên Reclub công khai mức 100.000đ/người cho 3 giờ và gói 800.000đ/10 buổi: [Old Quarter Club trên Reclub](https://discover.reclub.co/discover/meet/13Z5HQ).
- Một dịch vụ huấn luyện 1:1 tại TP.HCM công khai 590.000đ buổi đánh giá 90 phút và 4.800.000đ/8 buổi, chưa gồm sân: [5P Pickleball](https://daykempickleball.com/blog/hoc-phi-pickleball-1-kem-1-tphcm.html).
- Một Coach tại TP.HCM niêm yết 550.000đ/giờ, chưa gồm sân: [Pickleball Saigon](https://pickleballhochiminh.com/huan-luyen-pickleball/).
- Một nguồn ngành xây dựng sân tổng hợp khoảng thuê sân 150.000–300.000đ/giờ; cần khảo sát trực tiếp tại Thủ Đức trước khi dùng làm benchmark: [Mazone Việt Nam](https://mazone.vn/chi-phi-lam-san-pickleball-hoan-chinh-2026/).

Như vậy, giá Coach mẫu 300.000–450.000đ của FITLYO có thể tạo cảm giác dễ tiếp cận, nhưng phải ghi rõ **60 hay 90 phút, đã gồm sân hay chưa**. Giá kèo 35.000–55.000đ/người phù hợp chiến lược thâm nhập nếu bao gồm sân/bóng, nhưng cần kiểm tra unit economics ở từng slot. Giá sân 100.000–200.000đ cũng cần ghi rõ “mỗi giờ” hay “mỗi slot 90 phút”.

### 8.3. Pricing architecture đề xuất cho MVP

#### Player

- Tài khoản: miễn phí.
- Không thu phí đăng ký.
- Phí nền tảng nên gộp minh bạch vào checkout, thử nghiệm **3–5% và có mức trần 10.000–15.000đ/booking**.
- Không nên vừa thu 2,5% nạp/rút ví vừa thu service fee mà không giải thích; người dùng sẽ cảm giác bị thu phí hai lần.

#### Field Manager

- Onboarding và phần mềm lịch cơ bản: miễn phí trong pilot.
- FITLYO hưởng 3–5% trên booking do nền tảng mang đến.
- Booking walk-in do sân tự nhập: miễn phí hoặc phí SaaS cố định, không tính commission.
- Khi chứng minh được giá trị, thử gói **FM Pro 299.000–499.000đ/cụm/tháng** cho báo cáo, phân quyền nhân viên, CRM và xuất đối soát.

#### Coach

- Tạo hồ sơ: miễn phí.
- Commission **10%** trên booking do FITLYO mang đến là giả thuyết hợp lý so với giá trị lịch, thu phí và tìm học viên.
- Không thu commission với học viên Coach tự mang vào nếu chỉ dùng lịch; thay bằng gói SaaS sau này.

#### VIP

- 99.000đ/tháng và 899.000đ/năm chỉ hợp lý khi mạng lưới sân đủ dày và lợi ích tiết kiệm đo được.
- Trong pilot, đề xuất không đưa VIP làm trọng tâm; có thể thử **Founding VIP 59.000–69.000đ/tháng**, sau đó test 99.000đ khi người dùng có thể tiết kiệm tối thiểu tương đương phí hội viên.
- Gói năm chỉ bán sau khi retention 90 ngày đủ tốt; tránh thu dài hạn khi nguồn cung chưa ổn định.

### 8.4. Lý do cạnh tranh

FITLYO không nên cạnh tranh chỉ bằng giá rẻ. Lý do người dùng chấp nhận phí phải là:

1. Slot và số chỗ đáng tin cậy.
2. Kèo đúng trình, giảm trải nghiệm “out trình”.
3. Khoản thanh toán có trạng thái và chính sách hoàn rõ.
4. QR/check-in giảm tranh cãi tại sân.
5. Khi có sự cố, có một bên xử lý và bằng chứng đầy đủ.

### 8.5. Van Westendorp đề xuất

Chưa có dữ liệu khảo sát để kết luận giá tối ưu. Nên khảo sát tối thiểu 100 Player thường xuyên chơi và hỏi bốn câu cho gói VIP:

1. Giá nào rẻ đến mức bạn nghi ngờ chất lượng?
2. Giá nào là rẻ/hợp lý?
3. Giá nào bắt đầu đắt nhưng vẫn cân nhắc?
4. Giá nào quá đắt và chắc chắn không mua?

Test các mốc 39k, 59k, 79k, 99k, 129k và 149k/tháng. Phân nhóm theo tần suất chơi 1, 2–3 và 4+ buổi/tuần. Không chỉ hỏi ý định; nên chạy fake-door hoặc pre-order hoàn tiền để đo hành vi thật.

Với FM và Coach, không dùng chung bảng hỏi Player. Phỏng vấn trực tiếp ít nhất 15–20 đối tác mỗi nhóm về:

- Chi phí hiện tại để quản lý lịch và thu phí.
- Doanh thu tăng thêm FITLYO tạo ra.
- Mức commission tối đa chấp nhận.
- Ưu tiên commission hay subscription cố định.

## 9. Special Features — Lợi thế cạnh tranh và mức AI-proof

### 9.1. Những feature thực sự hỗ trợ các market pains trong CP2

| Feature | Giá trị với market pains | Mức khó sao chép hiện tại |
|---|---|---|
| Ghép kèo theo DUPR | Giảm lệch trình, tăng chất lượng buổi chơi | Thấp–trung bình; UI/logic có thể bị sao chép |
| Lịch chuẩn 10 slot 90 phút | Tạo ngôn ngữ chung giữa Player và sân | Trung bình nếu nhiều sân cùng áp dụng |
| Thanh toán/Escrow và no-show policy | Tăng độ chắc chắn, giảm bỏ kèo | Trung bình; cần vận hành và ledger đáng tin |
| QR check-in + audit | Tạo bằng chứng hoàn thành dịch vụ | Trung bình |
| Reputation + lịch sử hành vi | Giảm rủi ro đối tác/người chơi | Cao dần theo dữ liệu tích lũy |
| Liên kết Venue–Coach–Player | Tạo hệ sinh thái cung–cầu ba phía | Cao khi đã có mật độ mạng lưới địa phương |
| KYC và dispute operations | Xây dựng niềm tin | Cao hơn UI vì cần con người/quy trình/đối tác |

### 9.2. AI-proof là gì trong trường hợp FITLYO

AI có thể nhanh chóng sao chép:

- Nội dung landing page.
- Chatbot tư vấn.
- UI tìm kiếm/lọc.
- Gợi ý Coach hoặc kèo dựa trên rule đơn giản.
- Mô tả khóa học và báo cáo tổng hợp.

AI khó thay thế hơn:

- Nguồn cung sân đã ký và lịch khả dụng thật.
- Mật độ người chơi trong một bán kính/khung giờ.
- Dữ liệu check-in, no-show, refund và kết quả trận có xác minh.
- Trust graph giữa Player, Coach và Venue.
- KYC, giải quyết tranh chấp và quan hệ vận hành địa phương.
- Khả năng bảo đảm booking/tiền/QR đồng nhất ngoài đời thật.

Vì vậy, **AI không phải moat chính**. Moat phải là dữ liệu giao dịch có xác minh, density của marketplace, uy tín vận hành và quan hệ đối tác sân. Đây cũng là cách FITLYO trở nên AI-proof: AI có thể tạo một giao diện giống FITLYO, nhưng không tự tạo được mạng lưới sân, thanh khoản theo slot và lịch sử tin cậy.

### 9.3. AI nên dùng sau khi có dữ liệu

1. Xếp hạng kèo theo khả năng người dùng tham gia và độ cân bằng.
2. Dự báo slot trống để FM mở Social Match đúng lúc.
3. Phát hiện bất thường về DUPR, no-show và gian lận thanh toán.
4. Tóm tắt bằng chứng tranh chấp cho Admin, nhưng không tự ra phán quyết cuối.
5. Gợi ý lịch thay thế khi có xung đột.
6. Phân loại ticket hỗ trợ và đề xuất câu trả lời.

Không nên quảng bá “AI matching” trước khi có ground-truth về kết quả trận, mức hài lòng và hành vi quay lại.

## 10. Support — Mức hỗ trợ vượt trội

Trong marketplace thể thao có thanh toán trước và lịch thời gian thực, support không phải phần phụ; support là một phần của sản phẩm niềm tin.

### 10.1. Mô hình hỗ trợ đề xuất cho pilot

| Tình huống | Kênh | SLA phản hồi đầu | Mục tiêu xử lý |
|---|---|---:|---:|
| Không check-in được tại sân | Nút trợ giúp trong vé + hotline quầy | ≤ 2 phút | ≤ 10 phút |
| Đã trừ tiền nhưng chưa có booking | In-app urgent support | ≤ 10 phút | ≤ 2 giờ hoặc hoàn tự động |
| Sân đóng/mưa/sự cố | In-app workflow + FM xác nhận | ≤ 10 phút | Quyết định đổi lịch/hoàn trong 2 giờ |
| Tranh chấp/no-show | Ticket có upload bằng chứng | ≤ 2 giờ | ≤ 48 giờ |
| KYC Coach/FM | Portal + email | ≤ 4 giờ làm việc | Kết quả/bổ sung trong 24 giờ |
| Hỏi đáp thông thường | Help Center/chat/email | ≤ 2 giờ trong khung hỗ trợ | ≤ 24 giờ |

Khung hỗ trợ pilot đề xuất: **06:00–22:00 hằng ngày** cho sự cố booking/check-in; ticket thông thường xử lý theo giờ làm việc.

### 10.2. Điều làm support vượt trội

- Nút “Tôi đang ở sân và cần trợ giúp” ngay trong vé.
- Agent thấy đầy đủ Booking ID, payment, QR logs, timeline và chính sách áp dụng; không bắt khách kể lại từ đầu.
- Tự hoàn tiền với lỗi rõ ràng, không yêu cầu khách chờ xét duyệt thủ công nhiều ngày.
- Proactive notification khi sân bảo trì, mưa hoặc Coach đổi lịch.
- Một trang trạng thái booking duy nhất cho Player, FM và Support.
- Sau khi đóng ticket, hỏi CSAT một câu và lưu nguyên nhân gốc.
- FM/Coach có người onboarding trong 7 ngày đầu, không chỉ nhận link tài liệu.

### 10.3. Chỉ số support cần đo

- First Response Time và Time to Resolution.
- Contact rate trên 100 booking.
- Tỷ lệ refund tự động/thủ công.
- Tỷ lệ ticket mở lại.
- CSAT sau ticket.
- Top 10 nguyên nhân liên hệ.
- Tỷ lệ check-in thành công lần đầu.
- Chi phí support trên mỗi booking.

## 11. KPI để chứng minh MVP thực sự giải quyết CP2

### North Star Metric

**Số Successful Play Sessions mỗi tuần**: booking đã thanh toán, đủ người và check-in thành công.

### KPI cốt lõi

| Nhóm | KPI đề xuất |
|---|---|
| Liquidity | Tỷ lệ tìm thấy ít nhất một kèo phù hợp trong 7 ngày |
| Conversion | View match → giữ chỗ → thanh toán → check-in |
| Match quality | Điểm hài lòng sau trận và tỷ lệ phản hồi “đúng trình” |
| Reliability | No-show rate, cancellation rate, failed payment, overbooking |
| Supply | Slot utilization và incremental bookings do FITLYO mang đến |
| Retention | D7, D30 và số buổi/người/tháng |
| Trust | Dispute rate, thời gian refund, QR first-pass success |
| Economics | GMV, take rate, contribution margin/booking, support cost/booking |

### Ngưỡng pilot tham khảo trước khi mở rộng khu vực

- ≥ 70% người tìm kiếm thấy ít nhất một kèo phù hợp trong 7 ngày.
- ≥ 60% booking đã thanh toán check-in thành công.
- No-show < 8%, sau đó hướng đến < 5%.
- Overbooking do lỗi hệ thống = 0.
- QR first-pass success ≥ 95%.
- Dispute < 2% booking.
- ≥ 30% Player có booking thứ hai trong 30 ngày.
- Đối tác sân xác nhận FITLYO tạo booking tăng thêm, không chỉ chuyển booking cũ sang hệ thống.

## 12. Khoảng cách từ prototype đến MVP pilot

| Năng lực | Hiện trạng | Điều kiện MVP | Ưu tiên |
|---|---|---|---|
| UI/route | Bao phủ rộng bốn role | Rút gọn theo core journey | P1 |
| Auth | Account hard-code/localStorage | Backend auth, OTP, 2FA, revoke | P0 |
| Data | Nhiều Zustand store | Database/domain model chung | P0 |
| Booking | Kiểm tra trong browser | Transaction + unique lock | P0 |
| Payment/Escrow | Mô phỏng | Gateway callback + ledger + refund | P0 |
| QR | Hình/logic demo | Token ký, TTL, chống replay | P0 |
| Notification | Chủ yếu toast | Email/SMS/push/in-app event | P1 |
| Support | Chưa có console/ticket thật | Ticket + SLA + runbook | P0/P1 |
| Analytics | KPI tĩnh | Event instrumentation và funnel thật | P1 |
| Test | Chưa có test script | Unit/integration/E2E + CI | P0 |
| Performance | Main chunk > 1 MB | Route-based code split và tối ưu ảnh | P1 |

Ngoài ra, repository hiện có hai dấu hiệu cần dọn trước khi lập CI:

- `README.md` còn marker merge conflict (`<<<<<<<`, `=======`, `>>>>>>>`).
- Có một thư mục `FITLYO-Prototype/` lồng bên trong repository chứa bản sao mã nguồn/tài liệu, dễ gây nhầm source of truth.

## 13. Lộ trình triển khai đề xuất

### Phase 0 — Chốt bài toán và đo lường

- Chốt market pains, bằng chứng nghiên cứu và tiêu chí thành công dùng cho CP2.
- Chọn một khu vực pilot và 5–10 sân.
- Chốt policy hủy/no-show/refund.
- Chốt pricing experiment và event taxonomy.

### Phase 1 — Transaction foundation

- Backend auth/RBAC.
- Database canonical và 10-slot config.
- Booking lock/idempotency.
- Payment, ledger, refund.
- Audit log và notification nền tảng.

### Phase 2 — Core marketplace pilot

- Player feed/search/booking.
- FM calendar/publish/check-in.
- Admin support/refund.
- Analytics và operational dashboard.
- E2E/monitoring/load test.

### Phase 3 — Coach MVP 1.1

- Coach KYC và marketplace.
- Availability và booking thanh toán 100% sau khi Coach duyệt.
- Khóa 8 buổi, conflict detection và chat.
- Coach–venue settlement.

### Phase 4 — Monetization expansion

- VIP sau khi có retention và mật độ sân.
- FM Pro.
- AI ranking/demand forecast/fraud detection dựa trên dữ liệu thật.

## 14. Quyết định Go / No-Go

### Có thể làm ngay

- Usability test với Player/FM/Coach.
- Phỏng vấn willingness-to-pay.
- Demo cho sân và tuyển đối tác pilot.
- Đo task completion, time-on-task và lỗi UX.
- Dùng prototype để chốt nghiệp vụ và chính sách.

### Chưa nên làm

- Thu tiền thật.
- Cam kết Escrow bảo vệ tiền thật.
- Cho nhiều người đặt cùng một slot.
- Dùng QR prototype làm bằng chứng giao dịch.
- Bán gói VIP năm.
- Mở rộng toàn TP.HCM trước khi có thanh khoản cục bộ.

### Điều kiện Go-live pilot

1. Booking concurrent không overbook trong load test.
2. Payment/refund có ledger và idempotency.
3. Player và FM cùng thấy một trạng thái booking.
4. QR ký số, hết hạn và có audit.
5. Auth/RBAC/ownership kiểm tra ở backend.
6. E2E các hành trình cốt lõi chạy trong CI.
7. Có monitoring, backup, on-call và support SLA.
8. Có ít nhất 5 sân cam kết cung cấp lịch thật và một nhóm Player đủ tạo thanh khoản theo khu vực.

## 15. Kết luận cuối

FITLYO không thiếu tính năng; rủi ro lớn nhất là **quá nhiều tính năng trước khi chứng minh vòng lặp cốt lõi**. Prototype đã đủ tốt để cho thấy tầm nhìn hệ sinh thái, nhưng MVP nên tập trung vào một lời hứa có thể kiểm chứng:

> Người chơi tìm được buổi chơi phù hợp và giữ chỗ đáng tin cậy; sân có thêm booking và giảm slot trống/no-show.

Nếu FITLYO làm tốt vòng lặp này, Coach, VIP và AI sẽ trở thành các lớp mở rộng hợp lý. Nếu vòng lặp này chưa có thanh khoản hoặc chưa đáng tin cậy, thêm AI, dashboard hay app native sẽ không giúp prototype chứng minh đã giải quyết CP2.
