# TÀI LIỆU ĐẶC TẢ CHI TIẾT MÀN HÌNH - PHÂN HỆ LANDING PAGE, XÁC THỰC & ONBOARDING (SCR_PUB_xx & SCR_AUTH_xx)
**Dự án:** Nền Tảng Thể Thao FITLYO Pickleball (EXE101 - FPT University)  
**Phiên bản:** 2.0  
**Tác giả:** Đội ngũ Phân tích & Thiết kế Giao diện FITLYO  
**Phân hệ:** Public Landing, Authentication & Partner Onboarding (`SCR_PUB_xx` & `SCR_AUTH_xx`)  
**Ngày cập nhật:** 14/10/2026  
**Môi trường áp dụng:** Mobile Web Responsive (375px - 430px) & Web App Desktop (1280px+)

---

## MỤC LỤC TÀI LIỆU
1. [TỔNG QUAN KIẾN TRÚC & SƠ ĐỒ ĐIỀU HƯỚNG PHÂN HỆ AUTH & PUB](#1-tổng-quan-kiến-trúc--sơ-đồ-điều-hướng-phân-hệ-auth--pub)
   - 1.1. Vai trò & Mục tiêu kinh doanh của Phân hệ Landing & Xác thực
   - 1.2. Sơ đồ luồng điều hướng tổng thể (Auth & Onboarding Flow)
   - 1.3. Bảng danh mục màn hình nhóm SCR_PUB_xx & SCR_AUTH_xx
2. [ĐẶC TẢ CHI TIẾT TỪNG MÀN HÌNH](#2-đặc-tả-chi-tiết-từng-màn-hình)
   - 2.1. `SCR_PUB_01`: Trang chủ Giới thiệu Nền tảng FITLYO (Public Landing Page)
   - 2.2. `SCR_AUTH_01`: Màn hình Đăng nhập (Sign In Modal / Page)
   - 2.3. `SCR_AUTH_02`: Màn hình Đăng ký Tài khoản (Sign Up Modal / Page)
   - 2.4. `SCR_AUTH_03`: Xác thực Số điện thoại & Nhập mã OTP (Phone OTP Verification)
   - 2.5. `SCR_AUTH_04`: Khảo sát Trình độ Ban đầu & Tính điểm DUPR Khởi tạo (Initial Skill Survey & DUPR Seed)
   - 2.6. `SCR_AUTH_05`: Đăng ký Nộp hồ sơ Trở thành Huấn luyện viên (Coach Application & Certification Submission)
   - 2.7. `SCR_AUTH_06`: Đăng ký Nộp hồ sơ Trở thành Chủ sân / Cụm sân (Field Manager Application & Venue Onboarding)
3. [MA TRẬN PHÂN QUYỀN TRÊN GIAO DIỆN AUTH & PUB (RBAC ON UI MATRIX)](#3-ma-trận-phân-quyền-trên-giao-diện)
4. [QUY CHUẨN DESIGN TOKENS & TRẠNG THÁI MÀU SẮC](#4-quy-chuẩn-design-tokens--trạng-thái-màu-sắc)

---

## 1. TỔNG QUAN KIẾN TRÚC & SƠ ĐỒ ĐIỀU HƯỚNG PHÂN HỆ AUTH & PUB

### 1.1. Vai trò & Mục tiêu kinh doanh của Phân hệ Landing & Xác thực
Phân hệ Landing & Xác thực là "cửa ngõ đầu tiên" tiếp cận người dùng và đối tác kinh doanh, quyết định tỷ lệ chuyển đổi (Conversion Rate) của toàn nền tảng FITLYO:
1. **Truyền tải Giá trị Cốt lõi (Value Proposition):** Landing Page (`SCR_PUB_01`) giới thiệu giải pháp độc quyền 3 trong 1: Ghép kèo Social DUPR cân bằng trình độ, Ma trận đặt sân 6 slot 90 phút cố định, và Ký quỹ an toàn Escrow chống bùng cọc.
2. **Quy trình Onboarding Siêu tốc & Tránh Giả mạo:** Đăng ký bằng số điện thoại kèm mã OTP SMS 6 số bảo mật (`SCR_AUTH_03`), giúp xác thực định danh và hạn chế tình trạng spam tạo tài khoản ảo.
3. **Thuật toán Khởi tạo DUPR Ban đầu (DUPR Seed Survey):** Với người chơi chưa có hồ sơ DUPR quốc tế, bài kiểm tra trắc nghiệm 5 câu hỏi tình huống kỹ thuật (`SCR_AUTH_04`) giúp ước lượng điểm khởi điểm chuẩn xác (ví dụ 2.25 hoặc 2.75) để có thể tham gia thi đấu ngay.
4. **Cổng Đăng ký Đối tác Chuyên nghiệp (Self-service Partner Applications):** Cung cấp biểu mẫu trực tuyến cho Huấn luyện viên (`SCR_AUTH_05`) và Chủ sân (`SCR_AUTH_06`) nộp hồ sơ giấy phép trực tiếp vào hàng đợi thẩm định của Ban Quản trị (`SCR_ADMIN_01`).

---

### 1.2. Sơ đồ luồng điều hướng tổng thể (Auth & Onboarding Flow)

```mermaid
flowchart TD
    GuestVisitor(["Khách vãng lai truy cập fitlyo.vn"]) --> SCR_PUB_01["SCR_PUB_01: Landing Page Giới thiệu"]
    
    SCR_PUB_01 -->|Bấm Nút 'Đăng nhập'| SCR_AUTH_01["SCR_AUTH_01: Màn hình Đăng nhập"]
    SCR_PUB_01 -->|Bấm Nút 'Bắt đầu ngay'| SCR_AUTH_02["SCR_AUTH_02: Màn hình Đăng ký"]
    SCR_PUB_01 -->|Bấm 'Hợp tác làm HLV'| SCR_AUTH_05["SCR_AUTH_05: Đăng ký Hồ sơ Huấn luyện viên"]
    SCR_PUB_01 -->|Bấm 'Hợp tác Chủ cụm sân'| SCR_AUTH_06["SCR_AUTH_06: Đăng ký Cụm sân Đối tác"]
    
    SCR_AUTH_02 -->|Nhập SĐT & Mật khẩu| SCR_AUTH_03["SCR_AUTH_03: Xác thực OTP SMS qua điện thoại"]
    SCR_AUTH_03 -->|Xác thực OTP thành công| CheckDUPR{"Đã có DUPR chưa?"}
    
    CheckDUPR -->|Chưa có điểm DUPR| SCR_AUTH_04["SCR_AUTH_04: Khảo sát Trắc nghiệm Tính DUPR Khởi tạo"]
    CheckDUPR -->|Đã có mã DUPR quốc tế| LinkDUPR["Nhập DUPR ID & Tự động đồng bộ"]
    
    SCR_AUTH_04 -->|Hoàn thành khảo sát (vd: Đạt DUPR 2.50)| OnboardingDone["Tạo hồ sơ thành công -> Chuyển vào SCR_MATCH_01"]
    LinkDUPR --> OnboardingDone
    
    SCR_AUTH_05 -->|Nộp bằng cấp IPTPA & CCCD| AdminQueueCoach["Gửi vào SCR_ADMIN_01 để thẩm định"]
    SCR_AUTH_06 -->|Nộp GPKD & Quy mô cụm sân| AdminQueueVenue["Gửi vào SCR_ADMIN_01 để thẩm định"]
```

---

### 1.3. Bảng danh mục màn hình nhóm SCR_PUB_xx & SCR_AUTH_xx

| Mã màn hình | Tên màn hình chức năng | Loại giao diện | Điểm vào chính (Entry Point) | Điểm thoát chính (Exit Point) |
| :--- | :--- | :--- | :--- | :--- |
| **`SCR_PUB_01`** | Trang chủ Giới thiệu Nền tảng FITLYO | Full Landing Page | Truy cập URL gốc `fitlyo.vn` | `SCR_AUTH_01`, `SCR_AUTH_02`, `SCR_MATCH_01` |
| **`SCR_AUTH_01`** | Màn hình Đăng nhập Hệ thống | Modal / Clean Page | Header Landing, Nút hành động yêu cầu quyền | `SCR_AUTH_02`, Quên mật khẩu, Dashboard |
| **`SCR_AUTH_02`** | Màn hình Đăng ký Tài khoản | Clean Form Page | Bấm "Đăng ký", Link từ `SCR_AUTH_01` | `SCR_AUTH_03` (Nhập OTP) |
| **`SCR_AUTH_03`** | Xác thực Số điện thoại & Nhập OTP | Security Pin Code Screen | Sau khi submit `SCR_AUTH_02` | `SCR_AUTH_04` (Khảo sát DUPR) |
| **`SCR_AUTH_04`** | Khảo sát Trình độ & Tính DUPR Khởi tạo | Multi-step Quiz Wizard | Sau khi hoàn tất xác thực OTP | Cấp điểm DUPR, Điều hướng vào Feed Kèo |
| **`SCR_AUTH_05`** | Đăng ký Hồ sơ Huấn luyện viên | Multi-step Partner Form | Footer Landing, Menu Hợp tác Coach | Chờ duyệt (`SCR_ADMIN_01`) |
| **`SCR_AUTH_06`** | Đăng ký Hồ sơ Chủ cụm sân | Multi-step Partner Form | Footer Landing, Menu Đối tác Chủ sân | Chờ duyệt (`SCR_ADMIN_01`) |

---

## 2. ĐẶC TẢ CHI TIẾT TỪNG MÀN HÌNH

---

### 2.1. `SCR_PUB_01`: Trang chủ Giới thiệu Nền tảng FITLYO (Public Landing Page)

#### 1. Thông tin chung (Overview)
- **Mã màn hình:** `SCR_PUB_01`
- **Tên màn hình:** Trang chủ Giới thiệu Nền tảng FITLYO
- **Phân hệ:** Trang Chủ Công Cộng (`SCR_PUB`)
- **Đối tượng sử dụng:** Khách vãng lai, người chơi pickleball tiềm năng, chủ sân và huấn luyện viên tại TP. Thủ Đức.
- **Mục tiêu cốt lõi:** Trưng bày giao diện trực quan, giải thích mô hình hoạt động độc đáo (Ghép Kèo DUPR, Khung giờ 6 Slot, Bảo lãnh Escrow) và kêu gọi hành động (Call To Action - CTA) đăng ký trải nghiệm.

#### 2. Wireframe Bố cục Giao diện (Layout Wireframe)
```text
+-----------------------------------------------------------------------------------+
| [FITLYO]    Kèo Đấu DUPR    Đặt Sân 6 Slot    Huấn Luyện Viên     [ĐĂNG NHẬP] [THAM GIA]|
+-----------------------------------------------------------------------------------+
| HERO SECTION:                                                                     |
| "NỀN TẢNG THỂ THAO PICKLEBALL THÔNG MINH ĐẦU TIÊN TẠI TP. THỦ ĐỨC"                 |
| Ghép trận cân bằng DUPR - Chuẩn hóa 6 Slot 90 Phút - Ký quỹ Escrow Chống Bùng Cọc |
|                                                                                   |
| [ TÌM KÈO ĐẤU GẦN BẠN NGAY ]            [ KHÁM PHÁ CỤM SÂN & ĐẶT SLOT ]            |
| (Hình ảnh 3D Quả bóng Pickleball Neon & Ma trận 6 Slot chuyển động sinh động)    |
+-----------------------------------------------------------------------------------+
| 3 GIÁ TRỊ VƯỢT TRỘI CỦA FITLYO:                                                   |
| [ 1. GHÉP KÈO DUPR CHUẨN ]   [ 2. 6 SLOT 90 PHÚT CHUẨN ]   [ 3. KÝ QUỸ ESCROW ]   |
| Không lo lệch trình. Thuật   Khung giờ cố định từ 06:00    Bảo lãnh tiền cọc 100%.|
| toán lọc ±0.25 điểm DUPR     đến 21:30. Tối ưu Giờ Vàng.   Bùng kèo phạt 100% cọc.|
+-----------------------------------------------------------------------------------+
| DANH MỤC CỤM SÂN ĐỐI TÁC TIÊU BIỂU TẠI THỦ ĐỨC:                                   |
| [D-Pickleball Thảo Điền - 4 Sân]  [Saigon Rackets Hiệp Phú]  [An Khánh Pickleball]|
+-----------------------------------------------------------------------------------+
| DÀNH CHO ĐỐI TÁC HỢP TÁC:                                                         |
| [ Trở thành Huấn Luyện Viên FITLYO ]        [ Đưa Cụm Sân Lên Nền Tảng FITLYO ]   |
+-----------------------------------------------------------------------------------+
```

---

### 2.2. `SCR_AUTH_01`: Màn hình Đăng nhập (Sign In Modal / Page)

#### 1. Thông tin chung (Overview)
- **Mã màn hình:** `SCR_AUTH_01`
- **Tên màn hình:** Màn hình Đăng nhập
- **Phân hệ:** Xác thực Người dùng (`SCR_AUTH`)
- **Mục tiêu cốt lõi:** Cho phép người dùng đăng nhập bằng Số điện thoại + Mật khẩu hoặc Đăng nhập nhanh 1 chạm bằng Google OAuth.

#### 2. Wireframe Bố cục Giao diện (Layout Wireframe)
```text
+-------------------------------------------------------------+
| [X]                     FITLYO ĐĂNG NHẬP                    |
+-------------------------------------------------------------+
| Chào mừng bạn trở lại với cộng đồng Pickleball FITLYO!      |
|                                                             |
| Số điện thoại:                                              |
| [ 0912 345 678                                            ] |
|                                                             |
| Mật khẩu:                                                   |
| [ ••••••••••••                                       (xem) ]|
|                                                             |
| [ ] Ghi nhớ đăng nhập                 [ Quên mật khẩu? ]     |
|                                                             |
| [                  ĐĂNG NHẬP HỆ THỐNG                     ] |
|                                                             |
| ------------------------ HOẶC ----------------------------- |
| [ G Tiếp tục bằng Tài khoản Google                        ] |
|                                                             |
| Chưa có tài khoản? [ Đăng ký tài khoản mới ngay > ]         |
+-------------------------------------------------------------+
```

---

### 2.3. `SCR_AUTH_02`: Màn hình Đăng ký Tài khoản (Sign Up Modal / Page)

#### 1. Thông tin chung (Overview)
- **Mã màn hình:** `SCR_AUTH_02`
- **Tên màn hình:** Màn hình Đăng ký Tài khoản
- **Phân hệ:** Xác thực Người dùng (`SCR_AUTH`)
- **Mục tiêu cốt lõi:** Thu thập thông tin cơ bản tối giản (Họ tên, Số điện thoại, Mật khẩu) và kiểm tra tính hợp lệ trước khi gửi mã xác thực OTP qua SMS.

#### 2. Wireframe Bố cục Giao diện (Layout Wireframe)
```text
+-------------------------------------------------------------+
| [< Quay lại]            ĐĂNG KÝ THÀNH VIÊN                  |
+-------------------------------------------------------------+
| Họ và tên hiển thị (*):                                     |
| [ Nguyễn Văn An                                           ] |
|                                                             |
| Số điện thoại di động (*):                                  |
| [ 0987 654 321                                            ] |
| (Mã OTP xác thực sẽ được gửi qua SMS đến số này)            |
|                                                             |
| Tạo mật khẩu (*):                                           |
| [ ••••••••••••                                       (xem) ]|
| (Tối thiểu 8 ký tự, bao gồm chữ và số)                      |
|                                                             |
| [*] Tôi đồng ý với [Điều khoản dịch vụ] & [Chính sách Escrow]|
|                                                             |
| [             TIẾP TỤC: NHẬN MÃ XÁC THỰC OTP               ] |
|                                                             |
| Đã có tài khoản? [ Đăng nhập ngay > ]                       |
+-------------------------------------------------------------+
```

---

### 2.4. `SCR_AUTH_03`: Xác thực Số điện thoại & Nhập mã OTP (Phone OTP Verification)

#### 1. Thông tin chung (Overview)
- **Mã màn hình:** `SCR_AUTH_03`
- **Tên màn hình:** Xác thực Số điện thoại & Nhập mã OTP
- **Phân hệ:** Xác thực Người dùng (`SCR_AUTH`)
- **Mục tiêu cốt lõi:** Xác thực quyền sở hữu số điện thoại bằng ô nhập mã PIN 6 chữ số, có đồng hồ đếm ngược gửi lại mã sau 60 giây.

#### 2. Wireframe Bố cục Giao diện (Layout Wireframe)
```text
+-------------------------------------------------------------+
| [< Quay lại]              XÁC THỰC MÃ OTP                   |
+-------------------------------------------------------------+
| Mã xác thực 6 số đã được gửi đến số điện thoại:             |
|                  (+84) 0987 654 321                         |
|                                                             |
| Vui lòng nhập mã OTP để kích hoạt tài khoản:                |
|           [ 8 ]  [ 4 ]  [ 2 ]  [ 1 ]  [ 9 ]  [ 0 ]           |
|                                                             |
| Chưa nhận được mã? Gửi lại sau: ( 42s )                     |
|                                                             |
| [                  XÁC NHẬN & TIẾP TỤC                    ] |
+-------------------------------------------------------------+
```

---

### 2.5. `SCR_AUTH_04`: Khảo sát Trình độ Ban đầu & Tính điểm DUPR Khởi tạo (Initial Skill Survey & DUPR Seed)

#### 1. Thông tin chung (Overview)
- **Mã màn hình:** `SCR_AUTH_04`
- **Tên màn hình:** Khảo sát Trình độ Ban đầu & Tính điểm DUPR Khởi tạo
- **Phân hệ:** Xác thực & Onboarding (`SCR_AUTH`)
- **Mục tiêu cốt lõi:** Dành cho thành viên mới chưa có mã DUPR quốc tế. Thực hiện trắc nghiệm 5 câu hỏi nhanh về kinh nghiệm thể thao vợt (Tennis, Cầu lông, Bóng bàn), khả năng kiểm soát bóng Dink, và chiến thuật di chuyển để tính toán điểm DUPR hạt giống (Seed Rating) ban đầu (ví dụ: 2.25 đến 3.00).

#### 2. Wireframe Bố cục Giao diện (Layout Wireframe)
```text
+-------------------------------------------------------------+
| [Bỏ qua khảo sát]      KHẢO SÁT TRÌNH ĐỘ DUPR     [Câu 2 / 5] |
+-------------------------------------------------------------+
| [========                   ] 40% Tiến độ hoàn thành        |
|                                                             |
| CÂU 2: BẠN KIỂM SOÁT KỸ THUẬT "DINKING TRÊN LƯỚI" NHƯ THẾ NÀO?|
|                                                             |
| ( ) A. Chưa hiểu rõ khái niệm Dinking, thường đánh bóng bổng  |
|        (Trình độ Newbie 1.5 - 2.0)                          |
|                                                             |
| (•) B. Có thể giữ bóng qua lại 3 - 5 nhịp, thỉnh thoảng lỗi |
|        (Trình độ Cơ bản 2.5)                                |
|                                                             |
| ( ) C. Kiểm soát điểm rơi tốt, đổi hướng bóng theo ý muốn   |
|        (Trình độ Trung cấp 3.0 - 3.5)                       |
|                                                             |
| ( ) D. Đấu lưới nhịp độ nhanh, thành thạo tấn công Volley    |
|        (Trình độ Nâng cao 4.0+)                             |
|                                                             |
| [< Câu trước]                             [ TIẾP THEO >]    |
|                                                             |
| KẾT QUẢ DỰ KIẾN KHI HOÀN TẤT:                               |
| [ Huy hiệu DUPR Khởi Điểm: 2.50 ] - Tự động mở khóa Kèo 2.5 |
+-------------------------------------------------------------+
```

---

### 2.6. `SCR_AUTH_05`: Đăng ký Nộp hồ sơ Trở thành Huấn luyện viên (Coach Application & Certification Submission)

#### 1. Thông tin chung (Overview)
- **Mã màn hình:** `SCR_AUTH_05`
- **Tên màn hình:** Đăng ký Nộp hồ sơ Trở thành Huấn luyện viên
- **Phân hệ:** Onboarding Đối tác (`SCR_AUTH`)
- **Mục tiêu cốt lõi:** Cho phép HLV đăng ký thông tin cá nhân, tải lên ảnh chụp bằng cấp chứng chỉ quốc tế (IPTPA / PPR / DUPR Certified), liên kết hồ sơ DUPR thi đấu, và chọn các khu vực có thể nhận lớp tại TP. Thủ Đức.

#### 2. Wireframe Bố cục Giao diện (Layout Wireframe)
```text
+-------------------------------------------------------------+
| [< Trang chủ]           ĐĂNG KÝ HỒ SƠ HUẤN LUYỆN VIÊN       |
+-------------------------------------------------------------+
| BƯỚC 1: THÔNG TIN HLV & CHUYÊN MÔN:                         |
| Họ và tên (*): [ Lê Hoàng Dũng                            ] |
| Số điện thoại: [ 0903 123 456                             ] |
| Điểm DUPR thi đấu hiện tại: [ 4.85 ]                        |
|                                                             |
| BƯỚC 2: TẢI LÊN BẰNG CẤP & CHỨNG CHỈ UY TÍN (*):            |
| Loại chứng chỉ: [ IPTPA Level 2 Instructor ▼ ]              |
| [ TẢI LÊN ẢNH CHỨNG CHỈ (PDF/JPG) - IPTPA_Level2_Dung.pdf ] |
|                                                             |
| BƯỚC 3: KHU VỰC & HỌC PHÍ DỰ KIẾN:                          |
| Khu vực nhận dạy: [*] Thảo Điền  [*] An Phú  [*] Hiệp Phú   |
| Học phí đề xuất PT 1-1 / 90p: [ 450.000 ] VNĐ               |
|                                                             |
| [XÁC NHẬN NỘP HỒ SƠ THẨM ĐỊNH (BAN QUẢN TRỊ DUYỆT TRONG 24H)]|
+-------------------------------------------------------------+
```

---

### 2.7. `SCR_AUTH_06`: Đăng ký Nộp hồ sơ Trở thành Chủ sân / Cụm sân (Field Manager Application & Venue Onboarding)

#### 1. Thông tin chung (Overview)
- **Mã màn hình:** `SCR_AUTH_06`
- **Tên màn hình:** Đăng ký Nộp hồ sơ Trở thành Chủ sân / Cụm sân
- **Phân hệ:** Onboarding Đối tác (`SCR_AUTH`)
- **Mục tiêu cốt lõi:** Cho phép chủ đầu tư / quản lý cụm sân khai báo tên cụm sân, địa chỉ số nhà, số lượng sân con, loại mặt sân, tải lên giấy phép đăng ký kinh doanh và thông tin tài khoản ngân hàng để ký quỹ.

#### 2. Wireframe Bố cục Giao diện (Layout Wireframe)
```text
+-------------------------------------------------------------+
| [< Trang chủ]           ĐĂNG KÝ CỤM SÂN PICKLEBALL ĐỐI TÁC  |
+-------------------------------------------------------------+
| 1. THÔNG TIN CỤM SÂN:                                       |
| Tên cụm sân (*): [ Cụm Sân D-Pickleball Thảo Điền         ] |
| Địa chỉ chi tiết: [ 12 Võ Trường Toản, P. Thảo Điền, Thủ Đức] |
| Quy mô số sân  : [ 4 Sân trong nhà máy lạnh               ] |
| Tiện ích có sẵn: [*] Bãi xe hơi [*] Tắm nóng lạnh [*] Căngtin|
|                                                             |
| 2. HỒ SƠ PHÁP LÝ & KINH DOANH (*):                          |
| Tên người đại diện: [ Nguyễn Văn Đức                      ] |
| Số CCCD / GPKD    : [ 0317892xxx                          ] |
| [ TẢI LÊN GIẤY PHÉP KINH DOANH / HỢP ĐỒNG THUÊ ĐẤT (PDF)  ] |
|                                                             |
| 3. TÀI KHOẢN NGÂN HÀNG ĐỐI SOÁT DOANH THU:                  |
| Ngân hàng: [ Techcombank ▼ ]  Số TK: [ 190345678888       ] |
|                                                             |
| [ GỬI HỒ SƠ ĐĂNG KÝ CỤM SÂN (ADMIN SẼ LIÊN HỆ KIỂM ĐỊNH)   ] |
+-------------------------------------------------------------+
```

---

## 3. MA TRẬN PHÂN QUYỀN TRÊN GIAO DIỆN AUTH & PUB (RBAC ON UI MATRIX)

| Hành động trên Giao diện | Khách vãng lai | Người chơi đã đăng nhập | Huấn luyện viên | Chủ sân (FM) | Quản trị viên (Admin) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Xem Landing Page (`SCR_PUB_01`) | Toàn quyền | Xem & Chuyển Dashboard | Xem & Chuyển Dashboard | Xem & Chuyển Dashboard | Xem |
| Đăng nhập (`SCR_AUTH_01`) | Thực hiện đăng nhập | Đã đăng nhập | Đã đăng nhập | Đã đăng nhập | Đăng nhập Admin |
| Đăng ký & Nhận OTP (`SCR_AUTH_02`, `03`)| Tạo tài khoản mới | Không hiển thị | Không hiển thị | Không hiển thị | Không hiển thị |
| Làm Khảo sát DUPR (`SCR_AUTH_04`)| Khi vừa đăng ký xong| Đã có điểm DUPR | Miễn khảo sát | Không áp dụng | Cấu hình câu hỏi |
| Đăng ký làm HLV (`SCR_AUTH_05`) | Đăng ký mới | Nộp hồ sơ thăng cấp | Hồ sơ của mình | Không áp dụng | Thẩm định (`SCR_ADMIN_01`)|
| Đăng ký Cụm Sân (`SCR_AUTH_06`) | Đăng ký mới | Nộp hồ sơ mở sân | Không áp dụng | Hồ sơ cụm sân mình | Thẩm định (`SCR_ADMIN_01`)|

---

## 4. QUY CHUẨN DESIGN TOKENS & TRẠNG THÁI MÀU SẮC

- **Hero Tennis Green:** `#16A34A` (Green-600) - Tông màu chủ đạo thể thao, nút kêu gọi hành động CTA chính.
- **Electric Neon Accent:** `#84CC16` (Lime-500) - Điểm nhấn quả bóng Pickleball chuyển động trên hero.
- **OTP Input Focus Ring:** `#2563EB` (Blue-600) - Viền nổi bật cho ô nhập mã xác thực OTP 6 số.
- **Success Verification:** `#10B981` (Emerald-500) - Huy hiệu xác nhận số điện thoại và bằng cấp hợp lệ.
