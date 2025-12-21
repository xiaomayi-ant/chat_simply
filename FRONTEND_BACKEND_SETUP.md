# 前后端连接配置指南

## 问题分析

之前前端无法连接到后端的原因：
1. ❌ 前端还在使用旧的 Next.js API 路由 (`/api/chat`)，该路由尝试调用 OpenAI API
2. ❌ 前端没有配置后端 API 地址
3. ❌ 前端没有处理后端返回的 SSE 格式响应

## 已修复的问题

✅ 修改了 `pages/index.tsx`，现在直接调用后端 FastAPI API
✅ 实现了 SSE 格式的流式响应处理
✅ 添加了错误处理和状态显示

## 配置步骤

### 1. 前端配置

在 `chatbot-ui-lite` 项目根目录创建 `.env.local` 文件：

```bash
cd /Users/sumoer/Desktop/pycode/chatbot-ui-lite
cp .env.local.example .env.local
```

编辑 `.env.local`，设置后端API地址：

```env
# 开发环境：后端运行在 http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000

# 生产环境：替换为实际的后端API地址
# NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

**注意**：
- Next.js 中，只有以 `NEXT_PUBLIC_` 开头的环境变量才能在客户端访问
- `.env.local` 文件不会被提交到 Git（已在 `.gitignore` 中）

### 2. 后端配置

在 `insight-agent` 项目根目录创建 `.env` 文件：

```bash
cd /Users/sumoer/Desktop/pycode/insight-agent
cp .env.example .env
```

编辑 `.env`，填入实际的配置值：

```env
# DashScope (Qwen) 配置（必需）
DASHSCOPE_API_KEY=your_dashscope_api_key
QWEN_MODEL=qwen-turbo
QWEN_TEMPERATURE=0.0

# VikingDB 配置（必需）
VIKINGDB_AK=your_vikingdb_access_key
VIKINGDB_SK=your_vikingdb_secret_key
VIKINGDB_HOST=your_vikingdb_host
VIKINGDB_COLLECTION_NAME=your_collection_name

# CORS 配置（可选，默认允许 localhost:3000）
# CORS_ORIGINS=http://localhost:3000
```

### 3. 启动服务

#### 启动后端（终端1）

```bash
cd /Users/sumoer/Desktop/pycode/insight-agent
python main.py
```

后端应该运行在 `http://localhost:8000`

#### 启动前端（终端2）

```bash
cd /Users/sumoer/Desktop/pycode/chatbot-ui-lite
npm run dev
```

前端应该运行在 `http://localhost:3000`

### 4. 测试连接

1. 打开浏览器访问 `http://localhost:3000`
2. 在聊天框中输入消息
3. 应该能看到后端返回的流式响应

## API 调用流程

```
前端 (localhost:3000)
  ↓ POST /v1/chat/stream
后端 FastAPI (localhost:8000)
  ↓ LangGraph Agent
  ↓ ChatTongyi (Qwen)
  ↓ SSE 流式响应
前端接收并显示
```

## 数据格式

### 前端发送

```json
{
  "message": "用户输入的消息",
  "system_prompt": "你是一个友好的AI助手"  // 可选
}
```

### 后端返回（SSE格式）

```
data: {"type": "token", "content": "你"}
data: {"type": "token", "content": "好"}
data: {"type": "status", "content": "正在思考..."}
...
data: [DONE]
```

## 故障排查

### 问题1: CORS 错误

**错误信息**: `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**解决方案**:
- 检查后端 `.env` 中的 `CORS_ORIGINS` 配置
- 确保包含 `http://localhost:3000`
- 或者不设置 `CORS_ORIGINS`，使用默认值

### 问题2: 连接被拒绝

**错误信息**: `Failed to fetch` 或 `Network error`

**解决方案**:
- 确保后端服务正在运行 (`python main.py`)
- 检查后端是否运行在 `http://localhost:8000`
- 检查前端 `.env.local` 中的 `NEXT_PUBLIC_API_URL` 配置

### 问题3: 没有收到流式响应

**可能原因**:
- 后端 LLM 不支持流式输出
- 网络问题导致连接中断

**解决方案**:
- 检查后端日志，查看是否有错误
- 使用浏览器开发者工具查看网络请求
- 检查后端 ChatTongyi 配置

### 问题4: 环境变量不生效

**解决方案**:
- 确保环境变量以 `NEXT_PUBLIC_` 开头（前端）
- 重启 Next.js 开发服务器
- 检查 `.env.local` 文件位置（应在项目根目录）

## 下一步

1. ✅ 前后端连接已修复
2. ⏳ 测试流式传输功能
3. ⏳ 优化错误处理和用户体验
4. ⏳ 添加加载状态和错误提示

