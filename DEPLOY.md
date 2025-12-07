# 部署指南 (Deployment Guide)

## 1. 后端部署 (Render)

本系统后端推荐部署在 [Render](https://render.com)（免费且支持 Node.js + SQLite/Postgres）。

### 步骤
1. 将代码推送到 GitHub。
2. 在 Render Dashboard 点击 **New +** -> **Web Service**。
3. 选择你的 GitHub 仓库 `racket-service-system`。
4. 配置如下：
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. **Environment Variables** (环境变量):
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (任意长随机字符串，如 `my-super-secret-jwt-key`)
   - `DATABASE_URL`: (若使用 Postgres，请填入连接串；若使用默认 SQLite 则无需配置)

部署完成后，Render 会提供一个 URL（例如 `https://racket-service.onrender.com`）。请记录此地址。

---

## 2. 前端部署 (Vercel)

前端推荐部署在 [Vercel](https://vercel.com)。

### 步骤
1. 登录 Vercel，点击 **Add New...** -> **Project**。
2. 导入 GitHub 仓库 `racket-service-system`。
3. **Framework Preset**: 选择 `Vite`。
4. **Root Directory**: 点击 Edit，选择 `client` 目录。
5. **Environment Variables** (环境变量):
   - `VITE_API_BASE_URL`: 填入上方 Render 后端的地址 (例如 `https://racket-service.onrender.com/api`)
     > 注意：末尾加上 `/api`
6. 点击 **Deploy**。

### 验证
部署完成后，访问 Vercel 提供的域名：
- 首页应能正常加载。
- 尝试注册/登录，确保能连通后端 API。
