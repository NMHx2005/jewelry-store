# Jewelry Store — Hướng dẫn Deploy

## Cấu trúc dự án

```
jewelry-store/
├── backend/    → Node.js + Express (deploy lên Render)
└── frontend/   → React + Vite (deploy lên Vercel)
```

---

## 1. Chuẩn bị GitHub

```bash
cd jewelry-store
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

> File `.env` đã được thêm vào `.gitignore` — **không bao giờ commit file `.env`**.

---

## 2. Deploy Backend lên Render

1. Vào [render.com](https://render.com) → **New Web Service**
2. Kết nối repo GitHub, chọn thư mục **`backend/`**
3. Cấu hình:
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Root Directory:** `backend`
4. Vào tab **Environment** → thêm các biến sau:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://...` |
| `JWT_SECRET` | *(chuỗi bí mật dài)* |
| `JWT_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | *(từ Cloudinary)* |
| `CLOUDINARY_API_KEY` | *(từ Cloudinary)* |
| `CLOUDINARY_API_SECRET` | *(từ Cloudinary)* |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `TELEGRAM_BOT_TOKEN` | *(từ BotFather)* |
| `TELEGRAM_CHAT_ID` | *(chat ID của bạn)* |

5. Deploy → sau khi xong sẽ có URL dạng `https://jewelry-store-backend.onrender.com`

---

## 3. Deploy Frontend lên Vercel

1. Vào [vercel.com](https://vercel.com) → **New Project**
2. Import repo GitHub, chọn thư mục **`frontend/`**
3. Cấu hình:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Vào **Settings → Environment Variables** → thêm:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://jewelry-store-backend.onrender.com/api` |

5. Deploy → Vercel tự tạo URL dạng `https://your-app.vercel.app`

---

## 4. Cập nhật sau khi có domain

Sau khi có URL của cả 2 dịch vụ:

- **Render:** Cập nhật biến `FRONTEND_URL` = URL Vercel
- **Vercel:** Cập nhật biến `VITE_API_URL` = URL Render + `/api`
- Redeploy cả 2

---

## 5. Tài khoản mặc định (sau khi seed)

```
Admin:    admin@jewelry.com / 123456
Customer: customer@jewelry.com / 123456
```

Để chạy seed trên production:
```bash
# Từ máy local, trỏ MONGO_URI vào Atlas production
npm run seed
```

---

## 6. Chạy local

```bash
# Backend
cd backend
cp .env.example .env   # điền thông tin thực
npm install
npm run dev            # http://localhost:5001

# Frontend
cd frontend
cp .env.example .env   # điền VITE_API_URL
npm install
npm run dev            # http://localhost:5173
```
