# 部署指南 (Deployment Guide)

## 1. 后端部署 (Zeabur)

本系统后端推荐部署在 [Zeabur](https://zeabur.com)（支持 Node.js + 自动数据库初始化）。

### 步骤
1. 将代码推送到 GitHub。
2. 在 Zeabur 控制台点击 **Create Project** -> **Create Service** -> **Git**。
3. 选择你的 GitHub 仓库 `racket-service-system`。
4. **Environment Variables** (环境变量):
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (任意长随机字符串，如 `my-super-secret-jwt-key`)
   - `NPM_CONFIG_PRODUCTION`: `false` (重要：确保能安装 TypeScript 依赖)
5. Zeabur 会自动识别 `server` 目录并开始构建。
6. 构建完成后，在 **Networking** 选项卡中绑定一个域名（例如 `your-app.zeabur.app`）。

---

## 2. 前端部署 (Vercel)

前端推荐部署在 [Vercel](https://vercel.com)。

### 步骤
1. 登录 Vercel，点击 **Add New...** -> **Project**。
2. 导入 GitHub 仓库 `racket-service-system`。
3. **Framework Preset**: 选择 `Vite`。
4. **Root Directory**: 点击 Edit，选择 `client` 目录。
5. **Environment Variables** (环境变量):
   - `VITE_API_BASE_URL`: 填入上方 Zeabur 后端的完整地址 (例如 `https://your-app.zeabur.app/api`)
     > 注意：必须包含 `https://` 且末尾加上 `/api`
6. 点击 **Deploy**。

### 验证
部署完成后，访问 Vercel 提供的域名：
- 首页应能正常加载。
- 尝试提交订单，应显示成功。
- 访问 `/merchant` 登录后台，能看到订单数据。
