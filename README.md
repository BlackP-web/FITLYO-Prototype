<<<<<<< HEAD
﻿# FITLYO - Nền Tảng Thể Thao Pickleball Thông Minh
> **Dự án Khởi nghiệp Đổi mới Sáng tạo (EXE101) - Đại học FPT TP. Hồ Chí Minh**  
> *Hệ sinh thái kết nối người chơi Pickleball, chủ sân thể thao và huấn luyện viên chuyên nghiệp tại TP. Thủ Đức.*

---

## 📌 GIỚI THIỆU DỰ ÁN
**FITLYO** giải quyết 3 bài toán lớn nhất của phong trào Pickleball hiện nay:
1. **Thiếu bạn chơi ngang trình:** Ứng dụng thuật toán ghép trận tự động dựa trên xếp hạng **DUPR** chuẩn quốc tế (sai số $\pm0.25$).
2. **Nạn bỏ kèo / Bùng cọc:** Cơ chế **Ký quỹ Giữ chỗ (Escrow Deposit)** bảo vệ 100% tiền cọc, tự động xử phạt thành viên vắng mặt không lý do.
3. **Quy chuẩn hóa 6 Khung Giờ 90 Phút:** Số hóa toàn bộ lịch sân theo 6 khung giờ chuẩn (06:00 - 21:30), nhận diện tự động **Khung Giờ Vàng (Slot 5: 18:30 - 20:00)** để tối ưu công suất lấp đầy.

---

## 📚 HỆ THỐNG TÀI LIỆU DỰ ÁN (DOCUMENTS CATALOG)

Toàn bộ tài liệu phân tích nghiệp vụ, PRD và đặc tả màn hình được lưu trữ tại thư mục [`Documents/`](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents):

### 1. Tài liệu Yêu cầu & Luồng nghiệp vụ
- 📄 [FITLYO_PRD_Yeu_Cau_Phan_Mem.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_PRD_Yeu_Cau_Phan_Mem.md): Tài liệu Đặc tả Yêu cầu Phần mềm (PRD v1.0.0).
- 📄 [FITLYO_Tai_Lieu_Luong_Nghiep_Vu.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Tai_Lieu_Luong_Nghiep_Vu.md): Đặc tả 8 luồng nghiệp vụ chi tiết (WF-01 đến WF-08) kèm sơ đồ Mermaid.

### 2. Hệ thống Tài liệu Đặc tả Chi tiết Màn hình (Screen Specifications)
- 📑 [FITLYO_Dac_Ta_Man_Hinh_Screen_Spec.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_Screen_Spec.md): Tổng quan kiến trúc giao diện & Site map.
- 🏸 [FITLYO_Dac_Ta_Man_Hinh_SCR_FM.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_SCR_FM.md): Phân hệ Quản lý Cụm sân (Field Manager - `SCR_FM_01` đến `SCR_FM_08`).
- ⚡ [FITLYO_Dac_Ta_Man_Hinh_SCR_MATCH.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_SCR_MATCH.md): Phân hệ Kèo Đấu & Ghép Trận DUPR (`SCR_MATCH_01` đến `SCR_MATCH_04`).
- 🎓 [FITLYO_Dac_Ta_Man_Hinh_SCR_COACH.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_SCR_COACH.md): Phân hệ Huấn Luyện Viên & Đặt Lịch PT (`SCR_COACH_01`–`04`, `SCR_BOOK_01`–`03`).
- 🏟️ [FITLYO_Dac_Ta_Man_Hinh_SCR_VENUE.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_SCR_VENUE.md): Phân hệ Khám Phá Cụm Sân & Ma Trận 6 Slot (`SCR_VENUE_01` – `SCR_VENUE_02`).
- 👤 [FITLYO_Dac_Ta_Man_Hinh_SCR_USER.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_SCR_USER.md): Phân hệ Hồ Sơ Người Chơi, DUPR & VIP (`SCR_USER_01` – `SCR_USER_03`).
- 🛡️ [FITLYO_Dac_Ta_Man_Hinh_SCR_ADMIN.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_SCR_ADMIN.md): Phân hệ Quản Trị Hệ Thống Sàn & Thẩm Định (`SCR_ADMIN_01` – `SCR_ADMIN_05`).
- 🌐 [FITLYO_Dac_Ta_Man_Hinh_SCR_AUTH.md](file:///D:/FPTU/Term%207/EXE101/FITLYO/Documents/FITLYO_Dac_Ta_Man_Hinh_SCR_AUTH.md): Phân hệ Landing Page, Xác Thực & Onboarding (`SCR_PUB_01`, `SCR_AUTH_01`–`06`).

---

## 💻 BẢN PROTOTYPE TƯƠNG TÁC (FRONTEND PROTOTYPE)

Thư mục [`FITLYO-Prototype/`](file:///D:/FPTU/Term%207/EXE101/FITLYO/FITLYO-Prototype) chứa mã nguồn prototype hoàn chỉnh:
- **Công nghệ:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons, Radix UI.
- **Tính năng nổi bật:** Chuyển đổi linh hoạt giữa các vai trò (Player, VIP, Field Manager, Coach, Admin), mô phỏng ma trận 6 slot thời gian thực, bảng tin ghép kèo DUPR, và vé điện tử Dynamic QR Code.

### Hướng dẫn chạy thử nghiệm Prototype:
```bash
cd FITLYO-Prototype
npm install
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173/`
=======
# FITLYO - Fitness & Wellness Prototype

Ứng dụng mẫu (Prototype) cho nền tảng rèn luyện thể hình và quản lý sức khỏe toàn diện FITLYO.

## 🛠 Tech Stack

| Thành phần | Công nghệ | Mục đích |
| :--- | :--- | :--- |
| **Frontend Framework** | **React + Vite** | Xây dựng giao diện hiệu năng cao, Fast Refresh & HMR |
| **Programming Language** | **TypeScript** | Type-safety, kiểm soát kiểu dữ liệu và giảm thiểu lỗi |
| **CSS Framework** | **Tailwind CSS v4** | Styling hiện đại, responsive layout với `@tailwindcss/vite` |
| **UI Components** | **shadcn/ui** | Button, Dialog, Table, Form, Dropdown, Card, Input, Label |
| **Icons** | **Lucide React** | Hệ thống icon sắc nét, đồng bộ cho toàn bộ giao diện |
| **Routing** | **React Router (v7)** | Điều hướng hoàn chỉnh giữa 12 màn hình chức năng |
| **State Management** | **Zustand** | Quản lý state toàn cục (User profile, Workouts, Sidebar...) |
| **Mock Data / API** | **MSW (Mock Service Worker)** | Giả lập REST API qua Service Worker trên trình duyệt |
| **Form Validation** | **React Hook Form + Zod** | Quản lý form linh hoạt và xác thực dữ liệu chặt chẽ |

---

## 📱 Cấu trúc 12 Màn hình (Routes)

1. `/` - **Dashboard Tổng quan**: Thống kê chỉ số (Calories, thời lượng tập, streak), bảng bài tập hôm nay, AI Coach tips, Dialog bắt đầu nhanh.
2. `/workouts` - **Kho Bài tập**: Lọc danh sách bài tập theo thể loại (HIIT, Strength, Cardio, Yoga), xem chi tiết bài tập dạng modal.
3. `/workouts/create` - **Tạo Bài tập mới**: Form tạo bài tập tích hợp validation với **React Hook Form + Zod**, lưu trữ trực tiếp vào Zustand & mock API.
4. `/nutrition` - **Chế độ Dinh dưỡng**: Theo dõi tỷ lệ Macros (Protein, Carbs, Fat) và nhật ký bữa ăn trong ngày.
5. `/progress` - **Theo dõi Tiến độ**: Lịch sử đo lường InBody hàng tuần, tỷ lệ mỡ, khối lượng cơ xương.
6. `/schedule` - **Lịch tập & Nhắc nhở**: Lịch tuần trực quan, trạng thái hoàn thành và đồng bộ nhắc nhở.
7. `/community` - **Cộng đồng & Thử thách**: Thử thách tháng, phần thưởng và bảng tin tương tác hội viên.
8. `/trainers` - **Đội ngũ Huấn luyện viên**: Danh sách PT kèm chứng chỉ, đánh giá sao và chức năng đặt lịch.
9. `/store` - **Cửa hàng & Gói thành viên**: So sánh các gói hội viên (Starter, Fitlyo Plus, VIP 1:1).
10. `/reports` - **Báo cáo & Thống kê**: Biểu đồ phân bổ giờ tập và điểm kỷ luật (Consistency Score).
11. `/profile` - **Hồ sơ Cá nhân**: Cập nhật chỉ số cơ thể, mục tiêu thể hình với validation và đồng bộ MSW.
12. `/settings` - **Cài đặt Hệ thống**: Quản lý thông báo, kết nối thiết bị đeo (Apple Watch, Garmin), bảo mật.

---

## 📂 Cấu trúc Thư mục

```text
FITLYO-Prototype/
├── public/
│   └── mockServiceWorker.js       # MSW worker script
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      # Khung layout chung với Header & Sidebar
│   │   │   ├── Header.tsx         # Thanh điều hướng trên, chuông thông báo & menu tài khoản
│   │   │   └── Sidebar.tsx        # Menu cạnh trái điều hướng 12 màn hình
│   │   └── ui/                    # Thư viện UI shadcn/ui
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── table.tsx
│   ├── lib/
│   │   └── utils.ts               # Hàm cn (clsx + tailwind-merge)
│   ├── mocks/
│   │   ├── browser.ts             # Cấu hình MSW worker
│   │   └── handlers.ts            # Định nghĩa các mock endpoints (/api/user, /api/workouts...)
│   ├── pages/                     # 12 trang ứng dụng FITLYO
│   │   ├── CommunityPage.tsx
│   │   ├── CreateWorkoutPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NutritionPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ProgressPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── SchedulePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── StorePage.tsx
│   │   ├── TrainersPage.tsx
│   │   └── WorkoutsPage.tsx
│   ├── routes/
│   │   └── index.tsx              # Cấu hình React Router (createBrowserRouter)
│   ├── store/
│   │   └── useAppStore.ts         # Global store với Zustand
│   ├── types/
│   │   └── index.ts               # Định nghĩa kiểu dữ liệu TypeScript
│   ├── App.tsx
│   ├── index.css                  # Cấu hình CSS Variables & Tailwind v4
│   └── main.tsx                   # Khởi tạo React & MSW
├── components.json                # Cấu hình chuẩn shadcn/ui
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## 🚀 Hướng dẫn Chạy Ứng dụng

### 1. Cài đặt Dependencies (nếu chưa cài)
```bash
npm install
```

### 2. Chạy môi trường Phát triển (Dev Server)
```bash
npm run dev
```
Trình duyệt sẽ mở tại `http://localhost:5173`. MSW sẽ tự động kích hoạt trong console với thông báo:
`[MSW] Mocking enabled.`

### 3. Kiểm tra Build Production
```bash
npm run build
```
>>>>>>> a5ba340 (Initial deploy)
