#!/bin/bash
# Center API 启动脚本

if [ -f "api.pid" ]; then
    OLD_PID=$(cat api.pid)
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo "服务已在运行 (PID: $OLD_PID)"
        exit 1
    else
        echo "清理残留的 PID 文件"
        rm -f api.pid
    fi
fi

mkdir -p logs

gunicorn app.main:app \
    --bind 0.0.0.0:8000 \
    --workers 1 \
    --worker-class uvicorn.workers.UvicornWorker \
    --worker-connections 1000 \
    --timeout 120 \
    --keepalive 60 \
    --access-logfile logs/app.log \
    --error-logfile logs/app.log \
    --log-level info &

echo $! > api.pid

sleep 2

if ps -p $(cat api.pid) > /dev/null 2>&1; then
    echo "服务启动成功 (PID: $(cat api.pid))"
else
    rm -f api.pid
    echo "服务启动失败"
    exit 1
fi
