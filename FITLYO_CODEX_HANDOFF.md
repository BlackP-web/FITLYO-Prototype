# FITLYO — Bàn giao bộ nhớ cho Codex mới

**Cập nhật:** 12/11/2026  
**Repo:** `/Users/nguyendaiphat/Desktop/exe101-fitlyo-prototype/FITLYO-Prototype`  
**Ngôn ngữ làm việc ưu tiên:** Tiếng Việt

Tài liệu này gom bối cảnh sản phẩm, quyết định nghiệp vụ, yêu cầu đã trao đổi, cấu trúc code và trạng thái repo để một Codex khác có thể tiếp tục mà không phải đoán. Đây là bản tổng hợp, không phải bản sao toàn bộ transcript.

## 1. FITLYO là gì

FITLYO là prototype web cho hệ sinh thái pickleball tại TP. Thủ Đức, thuộc dự án khởi nghiệp đổi mới sáng tạo EXE101 của FPT University TP.HCM. Sản phẩm nối người chơi với Social Match theo trình độ, sân và huấn luyện viên; đồng thời cung cấp công cụ vận hành sân và quản trị marketplace.

Ba market pains mà tài liệu dự án nhắm tới:

1. Khó tìm người chơi/trận đấu có trình độ tương đương.
2. Bỏ kèo, no-show và thiếu minh bạch trong thanh toán, hủy/hoàn.
3. Lịch sân phân mảnh, khó biết chỗ trống thật và lấp đầy công suất.

Coach Marketplace là vertical bổ sung quan trọng. Phân tích MVP hiện có đề xuất ưu tiên vòng lặp Player–Match–Venue–Payment–Check-in trước khi mở rộng sản phẩm thật.

## 2. Người dùng và phạm vi sản phẩm

- **Player:** khám phá Social Match, lọc DUPR, đặt sân, đặt Coach, thanh toán, nhận vé/QR, xem lịch, đánh giá trận và quản lý hồ sơ/VIP.
- **Coach:** xác minh hồ sơ, quản lý lịch dạy, tiếp nhận booking, tạo khóa học, điểm danh, liên kết cụm sân và theo dõi ví/doanh thu.
- **Field Manager (FM/chủ sân):** quản lý sân và lịch slot, mở Social Match, xử lý booking, mời/duyệt liên kết Coach, check-in và xem báo cáo.
- **Admin/Super Admin:** dashboard, KYC, người dùng, tranh chấp, chính sách/cấu hình.

Ứng dụng là React 19 + TypeScript + Vite + Tailwind CSS v4, React Router v7, Zustand, MSW được cài trong dependencies, Radix UI và Lucide. Các route chính nằm trong `src/routes/index.tsx`; store chính gồm `src/store/useFitlyoStore.ts`, các store player, coach booking, payment, admin và cross-role.

## 3. Các quyết định nghiệp vụ quan trọng đã thống nhất

### Thanh toán và giữ chỗ

- Bản cập nhật chính sách ngày 22/10/2026 chuẩn hóa Social Session, đặt sân, Coach và VIP sang **thanh toán 100%**; không còn cọc 50%.
- Social Session và đặt sân được thanh toán khi xác nhận.
- Booking Coach: Player gửi yêu cầu trước, Coach có tối đa 12 giờ để duyệt/từ chối; sau khi duyệt Player có 15 phút thanh toán 100%. Quá hạn thì booking hết hạn và slot được mở lại.
- FITLYO VIP thanh toán 100% và kích hoạt ngay.
- VietQR/nạp ví, payment, refund, ledger/Escrow và QR hiện là mô phỏng. Không mô tả là giao dịch tiền thật.

### Lịch sân

- Tài liệu cập nhật gần nhất mô tả **10 slot liên tục, mỗi slot 90 phút, 06:00–21:00**.
- Không cho FM đổi thẳng slot đã có booking/Coach/Social Match sang trống; phải đi qua hủy và xử lý tiền/trạng thái tương ứng.
- Các tài liệu cũ còn ghi 6 slot hoặc cọc 50%; xem chúng là nội dung lỗi thời nếu mâu thuẫn với cập nhật 22/10/2026 và code hiện tại.

### Coach và liên kết sân — yêu cầu cụ thể của người dùng

- Coach mới sau xác minh phải bắt đầu với dữ liệu nghiệp vụ rỗng: không có sẵn liên kết sân, khóa học, học viên, giao dịch hay doanh thu từ tài khoản mẫu.
- Coach gửi yêu cầu liên kết phải gửi đúng cụm sân và phải nhìn thấy yêu cầu ở FM quản lý cụm sân đó. FM duyệt/từ chối, kết quả đồng bộ ngược về Coach.
- Chiều ngược lại cũng cần hoạt động: FM tìm Coach đã xác minh bằng SĐT hoặc họ tên, gửi lời mời; Coach nhận được và chấp nhận/từ chối; FM nhìn thấy kết quả.
- Không tự kích hoạt liên kết ngay sau khi tìm Coach. Hai chiều yêu cầu/liên kết là các trạng thái riêng.
- Sau khi duyệt, Coach chỉ được mở khóa học tại cụm sân đã liên kết.
- Người dùng yêu cầu lịch Coach hiển thị cùng ngày với Player và FM; booking của Player phải xuất hiện ở đúng ngày/slot trên lịch Coach, kèm thông tin cần thiết và trạng thái chờ duyệt/chờ thanh toán/đã xác nhận. Theo một lần bàn giao trước, lịch Coach đã được báo cáo là ngày động 35 ngày từ hôm nay; hãy kiểm tra code trước khi coi con số đó vẫn đúng.
- Một lần triển khai trước đã dùng `localStorage` và event `storage` để mô phỏng đồng bộ giữa các tab. Điều này không phải đồng bộ backend hay đa thiết bị.

## 4. Các luồng end-to-end chính được người dùng yêu cầu

Người dùng muốn liệt kê **luồng nghiệp vụ đủ lớn, đi qua nhiều role và khép kín quy trình**, không chia thành danh sách chức năng theo từng actor. Sáu luồng tổng hợp trước đó:

1. Đăng ký, thẩm định và đưa đối tác lên nền tảng — Coach/FM → Admin → Coach/FM → Player.
2. Tổ chức và vận hành Social Session — FM → Player → check-in → đánh giá/hoàn tất; xử lý thiếu người/no-show nếu có.
3. Đặt sân và sử dụng sân — FM quản lý tồn kho → Player chọn và trả 100% → FM/check-in → hoàn tất hoặc hủy/hoàn.
4. Đặt Coach và vận hành khóa học — Player yêu cầu → Coach duyệt → Player trả trong 15 phút → lịch Coach/Player/sân cập nhật → điểm danh/đánh giá.
5. Thanh toán, doanh thu và đối soát — nạp ví → thanh toán dịch vụ → ghi nhận giao dịch → doanh thu/hoàn tiền → Admin đối soát. Trong prototype đây là hành trình mô phỏng.
6. Hủy lịch, sự cố, no-show và tranh chấp — Player/Coach/FM/hệ thống khởi tạo → chính sách hoặc Admin xử lý → lịch, tiền, uy tín và thông báo cập nhật.

Đăng nhập, QR, nạp ví và thông báo là các bước hỗ trợ trong luồng, không nên trình bày như macro-flow độc lập. Xem kịch bản demo hiện có: `output/docs/FITLYO_Kich_Ban_Demo_6_Luong_Nghiep_Vu_Chinh.md`.

## 5. Sự thật về mức độ hoàn thiện

Đây là prototype tương tác để demo/usability test, không phải MVP giao dịch thật. Tài liệu và code hiện mô tả mô phỏng client-side, thường qua Zustand/localStorage. Không có backend/database chung, booking lock nguyên tử, thanh toán ngân hàng, escrow/ledger thật, xác minh QR có chữ ký, OTP thật hay đồng bộ DUPR thật. Một số trang báo cáo/tranh chấp dùng data mẫu.

Không được gọi tính năng là production-ready chỉ vì đã có route/UI. Khi trình bày kết quả, phân biệt rõ:

- Có màn hình/flow demo.
- Trạng thái được lưu cục bộ hoặc chia sẻ giữa tab trên một browser.
- Tích hợp backend/thanh toán/đồng bộ thật (chưa có theo tài liệu hiện có).

## 6. Bối cảnh từ các cuộc trò chuyện đã tìm thấy

Đã xem chat hiện tại cùng hai chat Codex đã lưu trữ gắn với repo này: **“Liệt kê các luồng nghiệp vụ chính”** và **“Kiểm tra quyền push code”**. Trong chat luồng nghiệp vụ, người dùng yêu cầu gộp workflow nhỏ thành luồng macro xuyên vai trò và đã tạo kịch bản demo 6 luồng. Trong chat phát triển gần đây, người dùng cụ thể hóa đồng bộ lịch Coach–Player–FM và hai chiều yêu cầu/mời liên kết Coach–sân.

Không tìm thấy bằng chứng trong lịch sử được đọc rằng user đã cho phép push/commit code. Một chat có tiêu đề “Kiểm tra quyền push code” nhưng chỉ tiêu đề không phải sự cho phép push. Không push/commit trừ khi người dùng yêu cầu rõ ràng. Nếu làm việc với repo, bảo toàn mọi thay đổi đang có.

## 7. Tài liệu trong repo và cách ưu tiên khi mâu thuẫn

Thứ tự ưu tiên đề xuất:

1. Yêu cầu mới nhất, nói rõ của người dùng.
2. Code hiện tại và trạng thái UI thực tế.
3. `FITLYO_PROTOTYPE_UPDATE_2026-10-22.md` cho policy mới nhất đã được ghi nhận.
4. `FITLYO_MVP_ANALYSIS.md` cho định vị, pain mapping và khuyến nghị MVP.
5. `FITLYO_GAP_ANALYSIS.md`, `Documents/FITLYO_Tai_Lieu_Luong_Nghiep_Vu.md`, và screen specs làm nguồn chi tiết nghiệp vụ.
6. README và tài liệu cũ hơn — cần kiểm tra ngày và đối chiếu trước khi dùng.

Lưu ý: README hiện có hai phiên bản trộn trong cùng file với marker merge conflict `<<<<<<<`, `=======`, `>>>>>>>`. Phần trên nói về pickleball, phần dưới là mô tả fitness/wellness cũ. Đừng lấy phần dưới làm mô tả sản phẩm hiện tại. Gap analysis và các spec còn dấu vết policy 6 slot/cọc 50%, nên xử lý cẩn trọng.

## 8. Trạng thái working tree tại lúc bàn giao

Repo đang ở branch `main`, tracking `origin/main`, nhưng có nhiều thay đổi chưa commit và hai file bị xóa. Không phải tất cả thay đổi đều do task bàn giao này tạo ra; hãy xem `git status` trước khi chỉnh sửa, build hoặc dọn dẹp. Bảo toàn thay đổi đó, không reset/checkout/clean và không xóa `dist`, `node_modules` hay file tạm nếu chưa hiểu tác động.

Các file đang modified/deleted tại thời điểm tạo bản này:

- Components: `src/components/layout/AppLayout.tsx`, `src/components/layout/Header.tsx`.
- Deleted: `src/components/payment/WalletTopUpDialog.tsx`, `src/store/useWalletTopUpStore.ts`.
- Payment policies/pages: `src/lib/paymentPolicies.ts`, `src/pages/CoachBookingsPage.tsx`, `src/pages/CourtCalendarPage.tsx`, `src/pages/MatchDetailPage.tsx`, `src/pages/OwnerReportsPage.tsx`, `src/pages/SCR_AUTH_02.tsx`, `src/pages/admin/AdminUsersPage.tsx`.
- Player pages: `src/pages/player/CourtBookingDetailPage.tsx`, `MatchDetailPage.tsx`, `MatchTicketPage.tsx`, `PlayerCoachingPage.tsx`, `PlayerProfilePage.tsx`, `PlayerSchedulePage.tsx`, `VenueDetailPage.tsx`, `VipMembershipPage.tsx`.
- Stores: `src/store/useAdminStore.ts`, `useCoachBookingStore.ts`, `useCrossRoleStore.ts`, `useFitlyoStore.ts`, `usePaymentStore.ts`, `usePlayerStore.ts`, `useSupportChatStore.ts`.
- Types: `src/types/coachBooking.ts`, `src/types/payment.ts`, `src/types/player.ts`.
- Build cache: `node_modules/.tmp/tsconfig.app.tsbuildinfo` modified.

Không biết từ snapshot này các thay đổi trên đang triển khai nhiệm vụ nào hoặc đã được kiểm tra chưa. Hãy đọc diff và hỏi người dùng nếu cần thay đổi/xóa chúng.

## 9. Hướng dẫn làm việc cho Codex mới

1. Bắt đầu bằng `git status --short -b`; giữ mọi thay đổi chưa commit.
2. Trước mỗi tính năng, xác định actor khởi tạo, actor nhận, entity/state chung, trạng thái trước/sau và ngoại lệ; đối chiếu route/store/types thật.
3. Với yêu cầu liên role, kiểm tra cả hai phía và các trạng thái sau khi refresh, đăng xuất/đăng nhập, đổi ngày, đổi tab; không chỉ sửa UI của người gửi.
4. Khi có khác biệt tài liệu, dùng thứ tự ưu tiên ở mục 7. Nếu lựa chọn ảnh hưởng policy/money/booking và chưa rõ, hỏi người dùng thay vì tự suy luận.
5. Ưu tiên tiếng Việt, trả lời thẳng, giữ đúng phạm vi yêu cầu. Người dùng muốn kết quả cụ thể/đầy đủ, không chỉ lời khuyên hoặc danh sách dở dang.
6. Ghi rõ khi thứ gì được mô phỏng. Không nói đã chạy build/test nếu chưa chạy. Không tự chạy test/build trừ khi người dùng yêu cầu hoặc có chỉ dẫn phù hợp trong task.
7. Không commit/push nếu chưa được yêu cầu rõ ràng.

## 10. Câu hỏi còn mở — không tự điền đáp án

- README nên được làm sạch và thay bằng mô tả FITLYO Pickleball hiện tại hay người dùng muốn giữ lịch sử fitness cũ ở nơi khác?
- Các store/policy nào trong các thay đổi chưa commit ở mục 8 phản ánh hướng thiết kế hiện tại sau các sửa đổi gần đây?
- Các tài liệu nghiệp vụ/spec cũ nên được cập nhật đồng loạt từ 6 slot/cọc 50% sang 10 slot/thanh toán 100% trong đợt riêng nào?
- Mục tiêu kế tiếp của dự án là tiếp tục hoàn thiện prototype, chuẩn bị demo/CP2, hay bắt đầu thiết kế backend MVP? Không được coi khuyến nghị trong MVP analysis là quyết định đã chốt.

## 11. Skill đi kèm

Skill dự án nằm tại [`skills/fitlyo-project/SKILL.md`](skills/fitlyo-project/SKILL.md). Nó hướng dẫn Codex cách nạp bối cảnh và xử lý thay đổi FITLYO nhất quán. Đây là bản trong repo; để dùng như skill tự động toàn cục trên một cài đặt Codex khác, cài/copy thư mục skill này vào thư mục skills của cài đặt đó.
