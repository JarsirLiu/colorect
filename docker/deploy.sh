#!/bin/bash
# Docker 部署启动脚本

set -e

echo "========================================="
echo "AI 工具平台 - Docker 部署"
echo "========================================="

# 进入 docker 目录
cd "$(dirname "$0")"

# 检查前端是否已构建
if [ ! -d "../web/dist" ]; then
    echo "⚠️  前端未构建，正在构建..."
    cd ../web
    npm install
    npm run build
    cd ../docker
    echo "✅ 前端构建完成"
else
    echo "✅ 前端已构建"
fi

# 停止旧容器
echo "🛑 停止旧容器..."
docker-compose down

# 构建并启动服务
echo "🔨 构建并启动服务..."
docker-compose up -d --build

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 服务状态："
docker-compose ps

echo ""
echo "========================================="
echo "✅ 部署完成！"
echo "========================================="
echo ""
echo "访问地址："
echo "  前端: http://localhost:80"
echo "  API:  http://localhost:80/api/v1"
echo "  文档: http://localhost:80/docs"
echo ""
echo "查看日志："
echo "  docker-compose logs -f"
echo ""
echo "停止服务："
echo "  docker-compose down"
echo ""
