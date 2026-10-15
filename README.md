# FITLYO - Nền Tảng Thể Thao Pickleball Thông Minh
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
