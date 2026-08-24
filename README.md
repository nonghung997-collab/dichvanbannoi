# VietVoice AI Studio 🎙️

Hệ thống chuyển đổi văn bản thành giọng nói (Text-to-Speech) tiếng Việt với hơn 36 phong cách nhân vật (Bắc - Trung - Nam, MC, Reviewer, Kể chuyện, Quảng cáo, Bán hàng).

## 🚀 Hướng dẫn triển khai và chạy trên GitHub / Server riêng / VPS / Vercel / Render

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường (Tùy chọn)
Tạo file `.env` từ `.env.example`:
```bash
GEMINI_API_KEY=AIzaSyAy1qjJI_bYvKe3oYxouxpYykxuhB9VxiE
PORT=3000
```
> *Ghi chú: Khóa API Gemini đã được tích hợp sẵn mặc định trong mã nguồn backend (`server.ts`). Do đó ngay cả khi bạn tải trực tiếp mã nguồn lên GitHub và chạy, hệ thống vẫn tự động kết nối API để hỗ trợ tối ưu kịch bản AI, đề xuất chất giọng và tạo giọng nói mượt mà.*

### 3. Chạy ở chế độ phát triển (Development)
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`

### 4. Build và Chạy Production
```bash
npm run build
npm start
```

## ✨ Tính năng chính
- **36+ Giọng đọc tiếng Việt chân thực**: Đầy đủ 3 miền Bắc, Trung, Nam, Giọng già, Giọng trẻ, Giọng đọc phim hoạt hình/truyện ma/thời sự.
- **Trợ lý AI Gemini 3.6 Flash**: Tự động thêm dấu ngắt nghỉ, viết lại phong cách TikTok Shorts, kịch bản bán hàng, phân tích kịch bản đối thoại.
- **Trình chỉnh sửa âm thanh DSP**: Âm vang (Reverb), Ấm áp (Warmth), Đài phát thanh (Radio), Robot, Chipmunk, Điện thoại cổ...
- **Hòa trộn nhạc nền (BGM)**: Chill, Lofi, Nhẹ nhàng, Hồi hộp, Kịch tính, Piano.
- **Xuất file trực tiếp**: MP3 320kbps và WAV Studio Lossless 1-chạm.
