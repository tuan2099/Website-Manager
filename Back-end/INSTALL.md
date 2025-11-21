### 8.5. Websites (mở rộng)

- `POST /websites`
- `GET /websites`
- `GET /websites/:id`
- `PUT /websites/:id`
- `DELETE /websites/:id`
- `POST /websites/:id/check-now`
- `GET /websites/:id/checks?page=&limit=`
- `GET /websites/:id/stats?range=1h|24h`
- DNS records:
  - `GET /websites/:id/dns-records`
  - `POST /websites/:id/dns-records`
  - `PUT /websites/:id/dns-records/:recordId`
  - `DELETE /websites/:id/dns-records/:recordId`

Các cron job mặc định (tự chạy khi `npm run dev`):

- SSL expiry check: 01:00 hằng ngày (`src/cron/sslCheckJob.js`).
- Domain expiry check: 02:00 hằng ngày (`src/cron/domainExpiryCheckJob.js`).
- Uptime check: mỗi 5 phút (`src/cron/uptimeCheckJob.js`).
# Hướng dẫn cài đặt & chạy

## 1. Yêu cầu hệ thống

- Node.js >= 16
- npm
- MySQL server đang chạy (local hoặc remote)

## 2. Clone / copy source code

Đặt source code vào thư mục bạn muốn (hiện tại là `New folder`).

## 3. Cài đặt dependency

Trong thư mục project:

```bash
npm install
```

## 4. Cấu hình môi trường (`.env`)

File `.env` (đã được tạo sẵn) cần được chỉnh lại cho đúng:

```env
# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=rbac_demo
DB_USER=root
DB_PASS=your_password_here

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# APP
PORT=3000
```

Ghi chú:

- `DB_NAME` phải là database đã tồn tại trong MySQL (hãy tạo trước bằng `CREATE DATABASE rbac_demo;` nếu chưa có).
- `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` nên là chuỗi random đủ mạnh.

## 5. Chạy migrations & seed

### 5.1. Tạo bảng (migrations)

```bash
npx sequelize db:migrate
```

Lệnh này sẽ tạo các bảng:

- `users`
- `roles`
- `permissions`
- `user_roles`
- `role_permissions`
- `activity_logs`
- `refresh_tokens`
- `websites`
- `website_checks`
- `website_dns_records`
- `website_alerts`
- `website_notification_settings`
- `notifications`
- `teams`
- `user_teams`
- `website_members`
- `tags`
- `website_tags`
- `api_tokens`
- `webhooks`

### 5.2. Seed dữ liệu mặc định

```bash
npx sequelize db:seed:all
```

Seeder sẽ tạo:

- Các permissions mặc định (tối thiểu):
  - `user:list`, `user:view`, `user:update`, `user:assignRoles`
  - `role:list`, `role:create`, `role:update`, `role:assignPermissions`
  - `permission:list`, `permission:create`, `permission:update`
  - `activityLog:list`
  - `website:create`, `website:list`, `website:view`, `website:update`, `website:delete`, `website:checkNow`, `website:viewChecks`
  - `team:create`, `team:list`, `team:manageMembers`
  - `apiToken:manage`, `webhook:manage`, `dashboard:view`
- Role `admin` với đầy đủ các permissions trên (bảng `role_permissions`).

## 6. Chạy server

```bash
npm run dev
```

Server sẽ chạy trên port trong biến `PORT` (mặc định 3000):

- Health check: `GET http://localhost:3000/health` → `{ "status": "ok" }`

## 7. Tạo user admin và gán role

### 7.1. Đăng ký user

Gửi request:

```http
POST /auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "123456",
  "name": "Admin"
}
```

Lưu lại `id` của user được tạo (ví dụ `1`).

### 7.2. Đăng nhập để lấy token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "123456"
}
```

Response trả về:

```json
{
  "user": { "id": 1, "email": "admin@example.com", "name": "Admin" },
  "accessToken": "...",
  "refreshToken": "..."
}
```

Lưu `accessToken` để dùng cho các request sau.

### 7.3. Gán role `admin` cho user

Role `admin` đã được tạo sẵn trong seeder. Bạn có thể:

- Xem trực tiếp trong DB (bảng `roles`), hoặc
- Tạm thởi truy cập `GET /roles` với token đủ quyền.

Giả sử `adminRoleId = 1`, gán role cho user id `1`:

```http
POST /users/1/roles
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "roleIds": [1]
}
```

Từ lúc này, user này sẽ có đầy đủ quyền admin.

## 8. Gọi thử các endpoint chính

Tất cả các endpoint (trừ `/auth/*` và `/health`) đều yêu cầu:

- Header: `Authorization: Bearer <accessToken>`.
- User có permissions tương ứng.

### 8.1. Users

- `GET /users` – danh sách users.
- `GET /users/:id` – chi tiết user.
- `PUT /users/:id` – cập nhật `name`, `is_active`.
- `POST /users/:id/roles` – set roles cho user.

### 8.2. Roles

- `GET /roles`
- `POST /roles`
- `PUT /roles/:id`
- `POST /roles/:id/permissions`

### 8.3. Permissions

- `GET /permissions`
- `POST /permissions`
- `PUT /permissions/:id`

### 8.4. Activity logs

- `GET /activity-logs?page=1&limit=20`

Khi bạn gọi các endpoint quản lý ở trên, middleware `activityLogger` sẽ tự động ghi bản ghi vào bảng `activity_logs` với:

- `user_id`
- `endpoint`
- `method`
- `payload` (đã ẩn các field mật khẩu)
- `ip`
- `user_agent`

### 8.5. Teams, Website permissions, Tags, API tokens, Webhooks, Dashboard

Ngoài các endpoint đã liệt kê ở trên, hệ thống còn hỗ trợ:

- Quản lý teams (`/teams`): tạo team, thêm/xoá user khỏi team, dùng cho phân quyền website theo team.
- Quản lý quyền website chi tiết (`/websites/:id/members`): gán user vào website với quyền `view`/`edit`.
- Quản lý tags (`/websites/:id/tags` + filter `tag=` trong `GET /websites`).
- Import/export websites (`GET /websites/export`, `POST /websites/import`).
- API tokens (`/api-tokens`): tạo/revoke token cho user hiện tại.
- Webhooks (`/webhooks`): đăng ký URL nhận thông báo khi website down/SSL hoặc domain sắp hết hạn.
- Dashboard (`/dashboard/summary`): xem tổng quan số lượng website, số đang offline, số ssl/domain sắp hết hạn, số alert đang open, số checks 24h gần nhất.

Các endpoint này đều yêu cầu token và permissions tương ứng như mô tả trong README.

## 9. Ghi chú debug

- Nếu `db:migrate` hoặc `db:seed:all` lỗi, kiểm tra lại:
  - Thông tin kết nối DB trong `.env`.
  - Database `DB_NAME` đã được tạo chưa.
- Nếu API trả `401 Unauthorized`:
  - Kiểm tra header `Authorization: Bearer <accessToken>`.
  - Kiểm tra token còn hạn hay không (có thể dùng `/auth/refresh`).
- Nếu API trả `403 Forbidden`:
  - User không có permission tương ứng → kiểm tra role & permissions của user.
