#!/bin/bash
# Center API 状态检查脚本

if [ -f "api.pid" ]; then
    PID=$(cat api.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "服务运行中 (PID: $PID)"
        
        # 获取所有相关进程的 CPU 和内存使用
        TOTAL_CPU=$(ps -p $PID -o %cpu= | xargs)
        TOTAL_MEM=$(ps -p $PID -o %mem= | xargs)
        
        # 查找所有 worker 进程
        WORKER_PIDS=$(pgrep -P $PID 2>/dev/null || true)
        if [ -n "$WORKER_PIDS" ]; then
            for worker_pid in $WORKER_PIDS; do
                if ps -p $worker_pid > /dev/null 2>&1; then
                    WORKER_CPU=$(ps -p $worker_pid -o %cpu= | xargs)
                    WORKER_MEM=$(ps -p $worker_pid -o %mem= | xargs)
                    TOTAL_CPU=$(echo "$TOTAL_CPU + $WORKER_CPU" | bc)
                    TOTAL_MEM=$(echo "$TOTAL_MEM + $WORKER_MEM" | bc)
                fi
            done
        fi
        
        echo "  CPU: $(printf "%.1f" $TOTAL_CPU)%"
        echo "  Memory: $(printf "%.1f" $TOTAL_MEM)%"
        echo "  Uptime: $(ps -p $PID -o etime= | xargs)"
        exit 0
    else
        rm -f api.pid
    fi
fi

PID=$(pgrep -f "uvicorn app.main:app" || true)
if [ -n "$PID" ]; then
    echo "服务运行中但无 PID 文件 (PID: $PID)"
else
    echo "服务未运行"
fi
