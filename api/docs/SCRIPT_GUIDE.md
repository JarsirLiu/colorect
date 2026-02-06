# Center API 启动脚本使用指南

## 概述

Center API 提供了完整的启动、关闭、状态检查和重启脚本，适用于 Linux/Mac 系统。

---

## 快速开始

### 1. 添加执行权限

首次使用前，需要为所有 `.sh` 脚本添加执行权限：

```bash
chmod +x *.sh
```

### 2. 启动服务

```bash
./start.sh
```

启动脚本会自动：
- ✅ 检查 Python 环境
- ✅ 自动创建虚拟环境
- ✅ 安装项目依赖
- ✅ 创建日志目录
- ✅ 启动服务并记录 PID

### 3. 查看状态

```bash
./status.sh
```

显示信息：
- 服务运行状态
- 进程 PID
- CPU 和内存使用率
- 运行时间
- 端口监听状态
- 最近日志

### 4. 关闭服务

```bash
./stop.sh
```

关闭流程：
- 发送 SIGTERM 信号（优雅关闭）
- 等待最多 10 秒
- 如果超时则发送 SIGKILL（强制关闭）
- 清理 PID 文件

### 5. 重启服务

```bash
./restart.sh
```

等同于：
```bash
./stop.sh && sleep 3 && ./start.sh
```

---

## 脚本说明

### start.sh - 启动脚本

**功能**：
- 检查 Python 环境（Python 3.9+）
- 自动创建和激活虚拟环境
- 检查并安装依赖
- 创建日志目录 (`./logs`)
- 启动服务并记录 PID 到 `./api.pid`
- 支持优雅关闭（Ctrl+C）

**输出示例**：
```
========================================
   Center API 启动脚本
========================================

[INFO] Python 版本: 3.9.7
[INFO] 虚拟环境不存在，正在创建...
[INFO] 虚拟环境创建成功
[INFO] 激活虚拟环境...
[INFO] 检查依赖...
[INFO] 正在安装依赖...
[INFO] 依赖安装成功
[INFO] 日志目录: /path/to/api/logs

[INFO] 启动 Center API 服务...
[INFO] 访问地址: http://0.0.0.0:8000
[INFO] API 文档: http://0.0.0.0:8000/docs
[INFO] 按 Ctrl+C 停止服务

[SUCCESS] 服务启动成功
  PID: 12345

[INFO] 使用以下命令管理服务：
  ./stop.sh  - 停止服务
  ./status.sh - 查看状态
  ./restart.sh - 重启服务

[INFO] 日志文件：
  logs/app.log      - 主日志
  logs/error.log    - 错误日志
  logs/app_daily.log - 每日日志
```

### stop.sh - 关闭脚本

**功能**：
- 读取 PID 文件
- 检查进程是否存在
- 发送 SIGTERM 信号（优雅关闭）
- 等待最多 10 秒
- 如果超时则发送 SIGKILL（强制关闭）
- 清理 PID 文件

**输出示例**：
```
========================================
   Center API 关闭脚本
========================================

[INFO] 正在关闭服务 (PID: 12345)...
  .
[SUCCESS] 服务已关闭
```

### status.sh - 状态检查脚本

**功能**：
- 检查服务运行状态
- 显示进程信息（PID、CPU、内存、运行时间）
- 检查端口监听状态
- 显示最近日志（最后 5 行）
- 显示日志文件大小

**输出示例**：
```
========================================
   Center API 状态
========================================

[RUNNING] 服务运行中
  PID: 12345
  CPU: 2.5%
  Memory: 1.2%
  Uptime: 01:23:45
  Port: 8000 (Listening)

[INFO] 日志文件大小: 1.2M

[最近日志] (最后 5 行):
    2026-02-06 08:30:00 - app.main - INFO - Starting Center API...
    2026-02-06 08:30:01 - app.main - INFO - Database initialized
    2026-02-06 08:30:02 - app.main - INFO - ModelLoader initialized
    2026-02-06 08:30:02 - app.main - INFO - CutoutService initialized
    2026-02-06 08:30:03 - app.main - INFO - All services initialized successfully
```

### restart.sh - 重启脚本

**功能**：
- 停止运行中的服务
- 等待服务完全关闭（3 秒）
- 重新启动服务

---

## 日志系统

### 日志文件

| 文件 | 描述 | 轮转方式 | 保留数量 |
|------|------|----------|----------|
| `logs/app.log` | 主日志 | 按大小（10MB） | 5 个备份 |
| `logs/error.log` | 错误日志 | 按大小（10MB） | 5 个备份 |
| `logs/app_daily.log` | 每日日志 | 按天（midnight） | 30 天 |

### 日志格式

遵循 `DEVELOPMENT_GUIDE.md` 规范：

```
2026-02-06 08:30:00 - app.modules.cutout - INFO - Processing image: task_id=abc123 size=1024x768
```

格式说明：
- 时间戳：`YYYY-MM-DD HH:MM:SS`
- 模块名：`app.modules.xxx`
- 日志级别：`INFO` / `DEBUG` / `WARNING` / `ERROR` / `CRITICAL`
- 消息内容

### 查看日志

**实时查看主日志**：
```bash
tail -f logs/app.log
```

**查看错误日志**：
```bash
tail -f logs/error.log
```

**查看最近 100 行**：
```bash
tail -n 100 logs/app.log
```

**搜索关键字**：
```bash
grep "ERROR" logs/app.log
```

**统计错误数量**：
```bash
grep -c "ERROR" logs/app.log
```

---

## 故障排查

### 问题 1：服务启动失败

**症状**：
```
[ERROR] 服务启动失败
```

**解决方案**：
1. 检查日志文件：
   ```bash
   cat logs/error.log
   ```

2. 检查端口是否被占用：
   ```bash
   netstat -tuln | grep 8000
   ```

3. 检查 Python 版本（需要 3.9+）：
   ```bash
   python3 --version
   ```

### 问题 2：无法停止服务

**症状**：
```
[WARNING] 进程未响应，强制终止...
```

**解决方案**：
1. 手动查找并终止进程：
   ```bash
   ps aux | grep uvicorn
   kill -9 <PID>
   ```

2. 清理 PID 文件：
   ```bash
   rm -f api.pid
   ```

### 问题 3：PID 文件损坏

**症状**：
```
[WARNING] 服务运行中但无 PID 文件
```

**解决方案**：
运行重启脚本自动修复：
```bash
./restart.sh
```

---

## 生产环境部署

### 使用 systemd（推荐）

创建服务文件 `/etc/systemd/system/center-api.service`：

```ini
[Unit]
Description=Center API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/center-api
Environment="PATH=/path/to/center-api/venv/bin"
ExecStart=/path/to/center-api/venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 1
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable center-api
sudo systemctl start center-api
sudo systemctl status center-api
```

### 使用 Docker

参考项目中的 `Dockerfile`。

---

## 高级用法

### 后台运行（nohup）

```bash
nohup ./start.sh > /dev/null 2>&1 &
```

### 指定日志级别

编辑 `.env` 文件：
```bash
LOG_LEVEL=DEBUG  # DEBUG, INFO, WARNING, ERROR
```

### 修改端口

编辑 `.env` 文件：
```bash
HOST=0.0.0.0
PORT=8001
```

### 自动启动（开机自启）

**crontab 方式**：
```bash
crontab -e
```

添加：
```
@reboot cd /path/to/center-api && ./start.sh
```

---

## 监控和告警

### 监控脚本

创建 `monitor.sh`：
```bash
#!/bin/bash

while true; do
    if ! ./status.sh &> /dev/null; then
        echo "$(date): Service is down, restarting..." >> logs/monitor.log
        ./restart.sh
    fi
    sleep 60
done
```

### 告警脚本

结合 `curl` 和 Webhook：
```bash
#!/bin/bash

if ! curl -s http://localhost:8000/health > /dev/null; then
    # 发送告警通知
    curl -X POST https://your-webhook-url \
        -d '{"text":"Center API is down!"}'
fi
```

---

## 相关文档

- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) - 开发规范
- [README.md](./README.md) - 项目说明
- [QUICKSTART.md](./QUICKSTART.md) - 快速开始

---

**文档版本**: 1.0  
**最后更新**: 2026-02-06  
**维护者**: Center API Team
