# 阅读助手 (Reading Assistant)

**阅读助手**是一款记录与管理个人阅读进度的应用。支持登录后云端同步书籍与进度、评分与简评、以及封面上传。

## ✨ 功能

- 书籍管理：添加、编辑、删除书籍，状态与进度可视化
- 评分与简评：读完后为书籍打分并添加简短评价
- 封面上传：支持手动上传或通过 ISBN 自动抓取封面
- 访客模式：无需登录即可本地体验（数据保存在浏览器）

## 🚀 开发与运行

### 环境要求
- [Node.js](https://nodejs.org/) (>= 18)
- npm 或 yarn

### 本地启动
1. 克隆仓库
   ```bash
   git clone https://github.com/redbanchk/ReadingAssistant.git
   cd ReadingAssistant
   ```
2. 安装依赖
   ```bash
   npm install
   ```
3. 配置环境变量（前端）
   在项目根目录创建 `ReadingAssistant/.env.local`，写入 Supabase 项目信息：
   ```env
   VITE_SUPABASE_URL=你的Supabase项目URL
   VITE_SUPABASE_ANON_KEY=你的Supabase匿名Key
   ```
4. 启动开发服务器
   ```bash
   npm run dev
   ```
   打开 `http://localhost:3000`

## 🔐 账号与登录
- 注册：输入邮箱与密码创建账号
- 登录：使用邮箱与密码直接登录
- 若开启了“邮件确认”，首次注册需在邮箱中确认后才能登录（可在 Supabase 控制台关闭以实现注册即登录）

## ⚙️ Supabase 设置

### 数据库表
项目使用 `books` 表存储书籍信息，并开启 RLS。表结构与策略见 `ReadingAssistant/supabaseClient.ts` 顶部注释。

### 存储桶（封面）
创建公开读取的 `covers` 存储桶用于封面文件：
```sql
insert into storage.buckets (id, name, public)
values ('covers','covers', true)
on conflict (id) do nothing;

-- 公共读取
do $$ begin
  create policy "Public read covers" on storage.objects
    for select using (bucket_id = 'covers');
exception when duplicate_object then null; end $$;

-- 登录用户上传/更新/删除自己文件
do $$ begin
  create policy "Authenticated upload covers" on storage.objects
    for insert with check (bucket_id = 'covers' and auth.role() = 'authenticated');
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated update own covers" on storage.objects
    for update using (bucket_id = 'covers' and auth.uid() = owner)
    with check (bucket_id = 'covers' and auth.uid() = owner);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "Authenticated delete own covers" on storage.objects
    for delete using (bucket_id = 'covers' and auth.uid() = owner);
exception when duplicate_object then null; end $$;
```

封面上传代码位置：`ReadingAssistant/components/BookForm.tsx:83–94`

## 📧 邮件提醒功能

### Edge Function
- 位置：`supabase/functions/send-reminders/index.ts`
- 行为：每次调用按上海时区判断是否“到达设定时分”，满足策略后发送邮件并更新 `last_reminded_at` 去重。
- Secrets（在 Supabase Functions → Secrets 配置）：
  - `RESEND_API_KEY`（必填）
  - `EMAIL_FROM`（可选，默认 `onboarding@resend.dev`）
  - `EMAIL_FROM_NAME`（可选，默认 `Reading Assistant`）
- 鉴权：`verify_jwt = true`，平台或带 `Authorization: Bearer <token>` 的请求可调用。

### 定时触发（两种方案）
1) Dashboard 的 Schedules（推荐，若界面已开放）：为 `send-reminders` 添加 `* * * * *`（每分钟）。
2) 数据库侧后备调度（无 Schedules 时使用）：在 SQL 编辑器执行，确保携带认证头：
   ```sql
   create extension if not exists pg_cron;
   create extension if not exists pg_net;
   select cron.schedule('readassistant_send_reminders_every_minute', '* * * * *', $$
     select net.http_post(
       url := 'https://<PROJECT_ID>.supabase.co/functions/v1/send-reminders',
       headers := '{"Content-Type":"application/json","Authorization":"Bearer <ANON_KEY>"}',
       body := '{}'::jsonb
     );
   $$);
   ```
   - `<PROJECT_ID>`：项目 ID（例如 `yqyosawsesrjhfvfdcws`）
   - `<ANON_KEY>`：在 `Settings → API` 获取，作为 Bearer 令牌用于函数鉴权

### 字段与策略约定
- `reminder_enabled:boolean`
- `reminder_mode:text`（`daily` / `every_x_days` / `weekly`）
- `reminder_hour:int`、`reminder_minute:int`
- `reminder_interval_days:int`（仅 `every_x_days`）
- `reminder_days_of_week:int[]`（仅 `weekly`；1–7 表示周一到周日）
- `last_reminded_at:timestamptz`（发送成功后更新）
- 策略：到达设定时分后，当天只发一次；`weekly` 仅在匹配星期；`every_x_days` 按自然日间隔。

### 联调与验证
- 手动触发（用于测试）：
  ```bash
  curl --request POST 'https://<PROJECT_ID>.supabase.co/functions/v1/send-reminders' \
    --header 'Authorization: Bearer <ANON_KEY>' \
    --header 'Content-Type: application/json' \
    --data '{}'
  ```
- 在 `Edge Functions → Invocations` 观察每分钟的 `POST | 200`；到点后检查 `books.last_reminded_at` 更新与邮件实际送达。

## 🛠️ 技术栈
- 前端：React + Vite
- UI：Tailwind CSS
- 后端服务：Supabase（Auth、Postgres、Storage）
- 部署：Vercel

## 🤝 贡献
欢迎提交 Issue 或 Pull Request。

## 📄 许可证
本项目使用 [MIT License](LICENSE)。
