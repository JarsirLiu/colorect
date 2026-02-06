#!/bin/bash
# Center API 关闭脚本

if [ ! -f "api.pid" ]; then
    echo "未找到 PID 文件，尝试查找并关闭进程..."
    pkill -f "gunicorn app.main:app" 2>/dev/null && echo "已关闭 gunicorn 进程" || echo "未找到 gunicorn 进程"
    pkill -f "uvicorn app.main:app" 2>/dev/null && echo "已关闭 uvicorn 进程" || echo "未找到 uvicorn 进程"
    echo "服务已关闭"
    exit 0
fi

PID=$(cat api.pid)

if ! ps -p $PID > /dev/null 2>&1; then
    echo "进程 $PID 不存在，清理 PID 文件"
    rm -f api.pid
    exit 0
fi

echo "正在关闭服务 (PID: $PID)..."
kill $PID 2>/dev/null || true

for i in {1..10}; do
    if ! ps -p $PID > /dev/null 2>&1; then
        echo "进程已停止，清理相关进程..."
        pkill -f "gunicorn app.main:app" 2>/dev/null && echo "已清理 gunicorn 进程" || true
        pkill -f "uvicorn app.main:app" 2>/dev/null && echo "已清理 uvicorn 进程" || true
        rm -f api.pid
        echo "服务已关闭"
        exit 0
    fi
    echo "等待进程停止... ($i/10)"
    sleep 1
done

echo "进程未响应，强制关闭..."
kill -9 $PID 2>/dev/null || true
pkill -9 -f "gunicorn app.main:app" 2>/dev/null && echo "已强制关闭 gunicorn 进程" || true
pkill -9 -f "uvicorn app.main:app" 2>/dev/null && echo "已强制关闭 uvicorn 进程" || true
rm -f api.pid
echo "服务已强制关闭"
