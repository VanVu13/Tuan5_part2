# Session Auth API

**Phiên bản:** 1.0.0  
**Mô tả:** API đăng nhập, đăng ký, đăng xuất người dùng sử dụng session cookie với Node.js, Express, MongoDB và EJS.

## Công nghệ sử dụng
- Node.js
- Express
- MongoDB + Mongoose
- Express-session + Connect-mongo
- EJS + Express-ejs-layouts
- Swagger UI (OpenAPI 3.0) để document API

## Các API chính
### Authentication
| Method | Endpoint            | Mô tả                         | Bảo vệ |
|--------|-------------------|--------------------------------|--------|
| POST   | `/api/register`    | Đăng ký người dùng mới         | Không |
| POST   | `/api/login`       | Đăng nhập                     | Không |
| POST   | `/api/logout`      | Đăng xuất                     | Có |
| GET    | `/api/profile`     | Lấy thông tin user (protected)| Có |

## Cấu trúc thư mục
session-auth-api/
├── models/ # Mongoose models
├── routes/ # Express routes
├── views/ # EJS templates
├── .env # Biến môi trường
├── package.json
└── README.md

## Cài đặt và chạy dự án
1. Clone repo:
```
git clone <repo-url>
Vào thư mục dự án:
```
2. Vào thư mục dự án:
```
cd session-auth-api
```
4. Cài dependencies:
```
npm install
```
4. Tạo file .env với nội dung:
```
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/simpleAuth
SESSION_SECRET=secretKey123
```
6. Chạy server:
```
node server.js
```
7. Truy cập:
```
Web: http://localhost:3000/login
Swagger docs: http://localhost:3000/api-docs

