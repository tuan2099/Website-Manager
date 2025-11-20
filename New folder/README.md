# RBAC Activity Logs Backend

Backend Node.js + MySQL dùng Sequelize, hỗ trợ:

- Auth: đăng ký, đăng nhập, đăng xuất, refresh token, đổi mật khẩu.
- Bảng chính: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `activity_logs`, `refresh_tokens`.
- Cơ chế RBAC theo permission: mỗi endpoint khai báo permission, chỉ user có permission tương ứng mới gọi được.
- Hệ thống log hoạt động: ghi lại user, endpoint, method, payload tóm tắt, IP, user agent.
- Module Websites để quản lý website, lịch sử kiểm tra, tài nguyên domain/hosting/backup, DNS records, tags, team, phân quyền chi tiết theo từng website.
- Hệ thống monitoring: uptime check, SSL expiry, domain expiry, alert & notifications, webhooks stub.
- Teams & per-website permissions: phân quyền theo owner, team, website members (`view`/`edit`).
- API tokens, webhooks, dashboard metrics, import/export websites.

Xem file [`INSTALL.md`](./INSTALL.md) để biết cách cài đặt, cấu hình và chạy hệ thống.

---

## Kiến trúc & cấu trúc thư mục

- `src/server.js` – entry point, khởi động Express.
- `src/app.js` – khởi tạo Express app, mount routes.
- `src/config/database.js` – cấu hình Sequelize (MySQL).
- `src/database/models` – models Sequelize (User, Role, Permission, UserRole, RolePermission, ActivityLog, RefreshToken, Website, WebsiteCheck, WebsiteAlert, WebsiteNotificationSetting, Notification, WebsiteDnsRecord, Team, UserTeam, WebsiteMember, Tag, WebsiteTag, ApiToken, Webhook).
- `src/database/migrations` – migrations tạo bảng.
- `src/database/seeders` – seeder khởi tạo permissions (user/role/permission/activityLog/website) + role admin.
- `src/modules`
  - `auth` – module Auth (service, controller, routes).
  - `users` – module quản lý user.
  - `roles` – module quản lý role.
  - `permissions` – module quản lý permission.
  - `activityLogs` – module xem activity logs (phân trang).
  - `websites` – module quản lý website, DNS records, kiểm tra uptime/SSL/domain, backup notes, tags, import/export.
  - `teams` – quản lý team và user-team membership.
  - `apiTokens` – quản lý API token cho từng user.
  - `webhooks` – quản lý webhook để nhận thông báo sự kiện.
  - `dashboard` – cung cấp dashboard summary.
- `src/cron`
  - `sslCheckJob.js` – cron job kiểm tra SSL sắp hết hạn (mỗi ngày 01:00), tạo WebsiteCheck + Notification + webhook notification (stub).
  - `uptimeCheckJob.js` – cron job kiểm tra uptime mỗi 5 phút, lưu response_time_ms, tạo alert khi down X lần liên tiếp, Notification + webhook notification (stub).
  - `domainExpiryCheckJob.js` – cron job kiểm tra domain sắp hết hạn (mỗi ngày 02:00), tạo WebsiteCheck + WebsiteAlert + Notification + webhook notification (stub).
- `src/middlewares`
  - `authMiddleware.js` – xác thực JWT, gắn `req.user` cùng roles/permissions.
  - `permissionMiddleware.js` – `requirePermission(permissionName)` cho RBAC.
  - `activityLogger.js` – log activity sau mỗi request có user.
- `src/utils/jwt.js` – helper ký/verify access token & refresh token.

---

## Các tính năng chính

### Auth

- `POST /auth/register` – đăng ký user.
- `POST /auth/login` – đăng nhập, trả `accessToken` + `refreshToken`.
- `POST /auth/logout` – đăng xuất, xoá refresh token.
- `POST /auth/refresh` – cấp lại access token từ refresh token.
- `POST /auth/change-password` – đổi mật khẩu (yêu cầu đăng nhập, có log activity).

### RBAC & Permissions

- Bảng `permissions` lưu tên permission, ví dụ:
  - `user:list`, `user:view`, `user:update`, `user:assignRoles`
  - `role:list`, `role:create`, `role:update`, `role:assignPermissions`
  - `permission:list`, `permission:create`, `permission:update`
  - `activityLog:list`
  - `website:create`, `website:list`, `website:view`, `website:update`, `website:delete`, `website:checkNow`, `website:viewChecks`
  - `team:create`, `team:list`, `team:manageMembers`
  - `apiToken:manage`, `webhook:manage`, `dashboard:view`
- Bảng `roles` + `role_permissions` gán permissions cho từng role.
- Bảng `user_roles` gán role cho user.
- Middleware `requirePermission('tên_permission')` check quyền trước khi vào handler.

### Activity Logs

- Middleware `activityLogger` chạy sau mỗi response (event `finish`) nếu có `req.user`.
- Ghi dữ liệu vào bảng `activity_logs`:
  - `user_id`, `endpoint`, `method`, `payload` (đã ẩn các trường mật khẩu), `ip`, `user_agent`.
- Endpoint xem log:
  - `GET /activity-logs?page=1&limit=20` – yêu cầu permission `activityLog:list`.

### Endpoint demo quản lý

Tất cả các endpoint dưới đây yêu cầu:

- Header: `Authorization: Bearer <accessToken>`.
- User có role/permissions phù hợp.

#### Users (`/users`)

- `GET /users` – permission `user:list` – danh sách user.
- `GET /users/:id` – permission `user:view` – chi tiết user.
- `PUT /users/:id` – permission `user:update` – cập nhật `name`, `is_active`.
- `POST /users/:id/roles` – permission `user:assignRoles` – set roles cho user.

#### Roles (`/roles`)

- `GET /roles` – permission `role:list` – danh sách role + permissions.
- `POST /roles` – permission `role:create` – tạo role mới.
- `PUT /roles/:id` – permission `role:update` – cập nhật role.
- `POST /roles/:id/permissions` – permission `role:assignPermissions` – set permissions cho role.

#### Permissions (`/permissions`)

- `GET /permissions` – permission `permission:list`.
- `POST /permissions` – permission `permission:create`.
- `PUT /permissions/:id` – permission `permission:update`.

#### Activity Logs (`/activity-logs`)

- `GET /activity-logs?page=&limit=` – permission `activityLog:list` – trả dữ liệu + thông tin phân trang.

#### Websites (`/websites`)

Tất cả endpoint Websites yêu cầu token và permissions tương ứng:

- `POST /websites` – permission `website:create` – tạo website mới; `owner_user_id` lấy từ user hiện tại.
- `GET /websites` – permission `website:list` – danh sách website, hỗ trợ filter:
  - `status=online|degraded|offline|unknown`
  - `owner_user_id=<id>`
  - `team_id=<id>`
  - `monitoring_enabled=true|false`
  - `search=<từ_khóa>` (tìm trong name/domain)
  - `tag=<tên_tag>`
  - `registrar=<tên_registrar>`
  - `hosting_provider=<tên_provider>`
- `GET /websites/:id` – permission `website:view` – chi tiết website kèm 3 lần kiểm tra gần nhất; áp dụng middleware websiteAccess (owner/team/member).
- `PUT /websites/:id` – permission `website:update` – cập nhật thông tin website.
- `DELETE /websites/:id` – permission `website:delete` – xoá website.
- `POST /websites/:id/check-now` – permission `website:checkNow` – thực hiện kiểm tra "giả lập" (stub) kiểu `ssl` hoặc `uptime`:
  - Tạo 1 bản ghi `website_checks` với kết quả `ok|warning|error`.
  - Cập nhật trường `websites.status` tương ứng.
- `GET /websites/:id/checks?page=&limit=` – permission `website:viewChecks` – lịch sử kiểm tra có phân trang.
- `GET /websites/:id/stats?range=1h|24h` – permission `website:viewChecks` – thống kê uptime (avg response time, trạng thái theo khoảng).
- `GET /websites/:id/dns-records` – permission `website:view` – danh sách DNS lưu trữ.
- `POST /websites/:id/dns-records` – permission `website:update` – thêm DNS record (A/CNAME/MX...).
- `PUT /websites/:id/dns-records/:recordId` – permission `website:update` – cập nhật DNS record.
- `DELETE /websites/:id/dns-records/:recordId` – permission `website:update` – xoá DNS record.
- `POST /websites/:id/members` – permission `website:update` – gán user vào website với quyền `view|edit`.
- `DELETE /websites/:id/members/:userId` – permission `website:update` – bỏ quyền website cho user.
- `POST /websites/:id/tags` – permission `website:update` – gán tag cho website (tự tạo Tag nếu chưa có).
- `DELETE /websites/:id/tags/:tagId` – permission `website:update` – bỏ tag khỏi website.
- `GET /websites/export` – permission `website:list` – export danh sách websites (JSON) với các filter tương tự `GET /websites`.
- `POST /websites/import` – permission `website:create` – import websites từ JSON array.

Các trường bổ sung cho website:

- `domain_expiry_date`, `registrar`
- `hosting_plan`, `server_ip`
- `last_backup_at`, `backup_provider`, `backup_notes`
- Quan hệ `website_dns_records` (ghi chú DNS thủ công)
- Quan hệ `team`, `members` (WebsiteMember), `tags` (Tag/WebsiteTag)

#### Teams (`/teams`)

- `POST /teams` – permission `team:create` – tạo team.
- `GET /teams` – permission `team:list` – danh sách team + members.
- `POST /teams/:id/users` – permission `team:manageMembers` – thêm user vào team (role `member`/`owner` tuỳ bạn mở rộng).
- `DELETE /teams/:id/users/:userId` – permission `team:manageMembers` – xoá user khỏi team.

#### API Tokens (`/api-tokens`)

- `GET /api-tokens` – permission `apiToken:manage` – danh sách token của user hiện tại.
- `POST /api-tokens` – permission `apiToken:manage` – tạo token mới (random 32 bytes hex).
- `DELETE /api-tokens/:id` – permission `apiToken:manage` – revoke (đặt `is_active=false`).

#### Webhooks (`/webhooks`)

- `GET /webhooks` – permission `webhook:manage` – danh sách webhooks.
- `POST /webhooks` – permission `webhook:manage` – tạo webhook (`url`, `event`, optional `website_id`, `secret`).
- `PUT /webhooks/:id` – permission `webhook:manage` – cập nhật `url`, `event`, `secret`, `is_active`.
- `DELETE /webhooks/:id` – permission `webhook:manage` – xoá webhook.

Các events hỗ trợ (dùng trong field `event`):

- `uptime_down` – website down liên tiếp X lần.
- `ssl_expiring` – SSL sắp hết hạn (<= 15 ngày).
- `domain_expiry` – domain sắp hết hạn (<= 15 ngày).

Cron jobs sẽ tạo `notifications` với `channel='webhook'` để bạn có thể viết worker thực tế bắn HTTP sau.

#### Dashboard (`/dashboard`)

- `GET /dashboard/summary` – permission `dashboard:view` – thống kê nhanh:
  - `totalWebsites`
  - `offlineWebsites`
  - `sslExpiring`, `domainExpiring` (<= 15 ngày)
  - `openAlerts`
  - `checksLast24h`

---

## Ghi chú

- Xem `INSTALL.md` để biết quy trình:
  - Cài dependency.
  - Thiết lập MySQL + `.env`.
  - Chạy `migrate` + `seed`.
  - Tạo user admin và gán role `admin`.
  - Gọi thử các endpoint bằng Postman/Insomnia.
