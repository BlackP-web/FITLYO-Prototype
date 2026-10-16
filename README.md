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
