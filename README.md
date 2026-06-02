# SocialNetwork - Hệ Sinh Thái Mạng Xã Hội Đa Nền Tảng

Chào mừng bạn đến với **SocialNetwork**, một hệ thống mạng xã hội hiện đại, đa nền tảng tích hợp đầy đủ các tính năng giao tiếp thời gian thực bao gồm nhắn tin tức thời, cuộc gọi thoại/video chất lượng cao, chia sẻ khoảnh khắc, trò chơi tương tác và hệ thống thông báo đẩy thông minh.

Dự án được xây dựng với cấu trúc monorepo bao gồm **Mobile App (Flutter)**, **Web Client (Next.js)** và **RESTful API & Real-time WebSocket Server (Node.js/Express)**.

---

## Tính Năng Nổi Bật

### Nhắn Tin & Giao Tiếp Thời Gian Thực (Socket.io)
*   **Chat cá nhân & Chat nhóm:** Nhắn tin tức thời, gửi kèm hình ảnh, tệp tin và emoji.
*   **Trạng thái tin nhắn:** Hiển thị trạng thái đang soạn tin (*typing...*), đã gửi, và đã đọc.
*   **Âm thanh thông báo:** Phát âm thanh trực quan khi nhận được tin nhắn mới.

### Cuộc Gọi Thoại & Video Call (WebRTC)
*   **Kết nối Peer-to-Peer:** Gọi video và thoại trực tiếp giữa Web và Di động với độ trễ cực thấp bằng công nghệ **WebRTC**.
*   **Màn hình cuộc gọi thông minh:** Hiển thị giao diện cuộc gọi đến (Incoming), cuộc gọi đi (Outgoing) và trong cuộc gọi (In-call) với chất lượng HD.

### Trò Chơi Tương Tác Trực Tiếp
*   **Tic-Tac-Toe (Cờ Caro):** Chơi game trực tuyến thời gian thực ngay trong khung chat giữa hai người dùng để tăng tính tương tác.

### Thông Báo Đẩy Thông Minh (FCM & Local Notifications)
*   **Thông báo nền (Background):** Nhận thông báo cuộc gọi và tin nhắn mới ngay cả khi ứng dụng đã bị đóng hoàn toàn (Kill state) qua **Firebase Cloud Messaging (FCM)**.
*   **Thông báo nổi (Foreground):** Tự động chuyển đổi hiển thị thông báo cục bộ sinh động khi người dùng đang mở ứng dụng.

### Bảo Mật & Xác Thực
*   **Bảo mật tài khoản:** Mã hóa mật khẩu một chiều bằng `bcrypt`, bảo mật API bằng cơ chế `JSON Web Token (JWT)`.
*   **Xác thực nâng cao:** Hỗ trợ đăng nhập Google (`Google Sign-In`) và xác thực tài khoản/quên mật khẩu qua Email OTP gửi bằng `Nodemailer`.

### Trải Nghiệm Người Dùng Cao Cấp
*   **Giao diện tối (Dark Mode):** Chuyển đổi giao diện Dark/Light mượt mà.
*   **Đa ngôn ngữ (Multi-language):** Dễ dàng cấu hình chuyển đổi ngôn ngữ trong ứng dụng.
*   **Quản lý bộ nhớ đám mây:** Tải lên và tối ưu hóa hình ảnh/avatar trực tiếp lên đám mây **Cloudinary**.

---

## Cấu Trúc Thư Mục Dự Án

Hệ sinh thái dự án được phân chia thành 3 phần rõ rệt:

```
SocialNetwork/
├── Flutter/                   # Ứng dụng di động (Android / iOS)
│   └── socialnetwork_app/     # Dự án Flutter (State Management: Provider)
├── Nextjs/                    # Ứng dụng web (Responsive & Premium UI)
│   └── socialnetwork_web/     # Dự án Next.js (Tailwind v4, Framer Motion)
└── Nodejs/                    # Hệ thống Backend Server
    └── backend_socialnetwork/ # RESTful API, Socket.io Server & Firebase Admin SDK
```

---

## Công Nghệ Sử Dụng

### 1. Mobile App (Flutter)
*   **Framework:** Flutter SDK (`^3.11.3`), Dart Language.
*   **Quản lý trạng thái:** `Provider` (đơn giản, hiệu quả và tối ưu hiệu năng).
*   **Thời gian thực & WebRTC:** `socket_io_client`, `flutter_webrtc`.
*   **Thông báo đẩy:** `firebase_messaging`, `flutter_local_notifications`.
*   **Tính năng bổ sung:** `mobile_scanner` (Quét mã QR), `image_picker` (Chọn ảnh), `shared_preferences` (Lưu local cache).

### 2. Web Client (Next.js)
*   **Framework:** React 19 / Next.js 16.
*   **Ngôn ngữ:** TypeScript.
*   **Styling:** Tailwind CSS v4.
*   **Hiệu ứng mượt mà:** Framer Motion (Micro-animations).
*   **API Client:** Axios (Tích hợp interceptors để đính kèm JWT Token tự động).

### 3. Backend Server (Node.js)
*   **Framework:** Express.js (HTTP Server).
*   **Real-time engine:** Socket.io (WebSocket).
*   **Database:** MongoDB Atlas kết hợp ODM Mongoose.
*   **Cloud Storage:** Cloudinary & Multer.
*   **FCM Sender:** Firebase Admin SDK.
*   **Email Sender:** Nodemailer.

---

## Hướng Dẫn Cài Đặt & Chạy Dự Án

### 1. Chuẩn Bị Môi Trường
*   Đã cài đặt **Node.js** (Phiên bản khuyến nghị: >= 18)
*   Đã cài đặt **Flutter SDK** và cấu hình thiết bị giả lập (Emulator) hoặc máy thật.
*   Có tài khoản **MongoDB Atlas** và tài khoản **Cloudinary**.
*   Một dự án **Firebase** đã được cấu hình trên Firebase Console.

---

### 2. Cài Đặt & Chạy Backend Server (`Nodejs/backend_socialnetwork`)

1. Di chuyển vào thư mục backend:
   ```bash
   cd Nodejs/backend_socialnetwork
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Tạo file cấu hình môi trường `.env` trong thư mục gốc của backend:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   Email_USER=your_gmail_for_otp@gmail.com
   Email_PASS=your_gmail_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   DEFAULT_AVATAR_URL=your_default_avatar_url
   ```
4. Đặt file cấu hình Firebase Admin SDK Private Key của bạn vào thư mục `src/` và đặt tên là `firebase-service-account.json`.
5. Chạy server ở chế độ phát triển:
   ```bash
   npm run dev
   ```

---

### 3. Cài Đặt & Chạy Web Client (`Nextjs/socialnetwork_web`)

1. Di chuyển vào thư mục Web Client:
   ```bash
   cd Nextjs/socialnetwork_web
   ```
2. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi động máy chủ Next.js cục bộ:
   ```bash
   npm run dev
   ```
4. Truy cập giao diện tại: [http://localhost:3000](http://localhost:3000).

---

### 4. Cài Đặt & Chạy Mobile App (`Flutter/socialnetwork_app`)

1. Di chuyển vào thư mục Mobile App:
   ```bash
   cd Flutter/socialnetwork_app
   ```
2. Tải về các packages cần thiết:
   ```bash
   flutter pub get
   ```
3. Cấu hình Firebase Client:
   *   Đặt file cấu hình `google-services.json` tải từ Firebase Console vào thư mục `android/app/`.
4. Chạy ứng dụng trên thiết bị di động/giả lập:
   ```bash
   flutter run
   ```

---

## Quản Lý Bảo Mật & Thông Tin Nhạy Cảm (Git)
Dự án đã được cấu hình chặt chẽ bằng hệ thống `.gitignore` đa tầng. Tất cả thông tin nhạy cảm bên dưới **sẽ không bao giờ bị đẩy lên GitHub**:
*   File mật khẩu và API Keys (`.env`, `.env.local`).
*   File Firebase Private Keys (`firebase-service-account.json`).
*   Các thư mục thư viện tải về (`node_modules/`, `.dart_tool/`, `build/`).

---
