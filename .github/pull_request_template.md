## 📌 Mô tả thay đổi (Description)
<!-- Tóm tắt ngắn gọn các thay đổi trong PR này (Ví dụ: Thêm màn hình SCR_FM_01, fix bug...). -->

## 🔗 Liên kết màn hình / Nghiệp vụ (Screen Mapping)
- Mã màn hình (nếu có): SCR_...
- Route URL tương ứng: /...

---

## 🛡️ Bảng kiểm chất lượng (Quality Checklist)

### 1. Dành cho người tạo PR (Author Checklist)
- [ ] **Kiểm tra Dead Code:** Đã chạy 
pm run check trong FITLYO-Prototype và không có file mồ côi / file rác không được sử dụng.
- [ ] **Kiểm tra Route:** Tất cả các màn hình mới đã được khai báo và kết nối vào FITLYO-Prototype/src/routes/index.tsx.
- [ ] **Độ dài file:** Không có file nào dài bất thường (> 500 dòng). Các component lớn đã được chia nhỏ.
- [ ] **Kiểm tra Build:** Đã chạy 
pm run build thành công, không có lỗi TypeScript hay Vite bundler.

### 2. Dành cho người duyệt PR (Reviewer - 2 Câu hỏi vàng)
- [ ] **Câu hỏi 1:** Có thay đổi trong outes/index.tsx tương ứng với các màn hình mới được thêm không? *(Nếu làm màn hình mới mà không có route -> từ chối merge)*.
- [ ] **Câu hỏi 2:** Trong tab *Files changed*, có file nào dài bất thường (> 500 dòng) hoặc file nháp chưa xóa không?
