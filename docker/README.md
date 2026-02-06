# Docker 部署指南

本目录包含 AI 工具平台的 Docker 部署配置文件。

## 目录结构

```
docker/
├── README.md                    # 本文件
├── docker-compose.yml           # Docker Compose 配置
├── .env                         # 环境变量配置
├── .env.example                 # 环境变量配置示例
├── deploy.sh                    # Linux/Mac 部署脚本
├── deploy.bat                   # Windows 部署脚本
└── nginx/                       # Nginx 配置目录
    ├── README.md                # Nginx 配置说明
    ├── nginx.conf               # Nginx 主配置
    ├── mime.types               # MIME 类型配置
    ├── fastcgi_params           # FastCGI 参数
    ├── conf.d/                  # 额外配置目录
    │   └── default.conf        # 默认站点配置
    ├── sites-available/         # 站点配置目录
    │   ├── extract-http.conf   # HTTP 站点配置
    │   └── extract-https.conf  # HTTPS 站点配置
    ├── snippets/                # 配置片段
    │   ├── deny-hidden.conf    # 隐藏文件访问控制
    │   └── security-headers.conf  # 安全头配置
    └── ssl/                     # SSL 证书目录
        └── README.md            # SSL 证书说明
```

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存
- 至少 10GB 可用磁盘空间

### 1. 配置环境变量

```bash
# 复制环境变量配置文件
cp .env.example .env

# 编辑配置文件
vim .env
```

重要配置项：

```env
# 修改为你的域名
CORS_ORIGINS=https://your-domain.com

# 修改为强密码
SECRET_KEY=your-strong-secret-key-here
```

### 2. 构建前端

```bash
cd ../web
npm install
npm run build
cd ../docker
```

### 3. 部署

#### Linux/Mac

```bash
chmod +x deploy.sh
./deploy.sh
```

#### Windows

```cmd
deploy.bat
```

#### 手动部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 4. 访问服务

- **前端**: http://localhost
- **API**: http://localhost/api
- **API 文档**: http://localhost/docs
- **健康检查**: http://localhost/health

## 服务说明

### Nginx

- **镜像**: nginx:alpine
- **端口**: 80, 443
- **功能**:
  - 反向代理到后端 API
  - 静态文件服务
  - SSL/TLS 终止
  - Gzip 压缩
  - 安全头设置

### API

- **镜像**: 从 `../api/Dockerfile` 构建
- **端口**: 8000
- **功能**:
  - FastAPI 后端服务
  - AI 工具接口
  - 数据库操作

## 配置说明

### Nginx 配置

#### 默认配置 (HTTP)

使用 `nginx/conf.d/default.conf`，适用于本地开发。

#### 自定义域名配置 (HTTP)

1. 复制站点配置：

```bash
cp nginx/sites-available/extract-http.conf nginx/conf.d/extract.conf
```

2. 修改域名：

```bash
vim nginx/conf.d/extract.conf
```

将 `your-domain.com` 替换为你的实际域名。

#### HTTPS 配置

1. 准备 SSL 证书：

将证书文件放在 `nginx/ssl/` 目录：

- `your-domain.com.crt`
- `your-domain.com.key`

2. 复制 HTTPS 配置：

```bash
cp nginx/sites-available/extract-https.conf nginx/conf.d/extract.conf
```

3. 修改域名和证书路径：

```bash
vim nginx/conf.d/extract.conf
```

4. 重启服务：

```bash
docker-compose restart nginx
```

### 使用 Let's Encrypt

```bash
# 安装 certbot
sudo apt install certbot

# 生成证书
sudo certbot certonly --standalone -d your-domain.com

# 复制证书
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/your-domain.com.crt
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/your-domain.com.key

# 设置权限
chmod 600 nginx/ssl/your-domain.com.*
```

## 常用命令

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f nginx
docker-compose logs -f api

# 重新构建并启动
docker-compose up -d --build
```

### 进入容器

```bash
# 进入 Nginx 容器
docker-compose exec nginx sh

# 进入 API 容器
docker-compose exec api sh
```

### 数据管理

```bash
# 查看数据卷
docker volume ls

# 删除数据卷（谨慎操作）
docker-compose down -v
```

## 环境变量

### 后端环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `HOST` | 监听地址 | `0.0.0.0` |
| `PORT` | 监听端口 | `8000` |
| `DEBUG` | 调试模式 | `False` |
| `LOG_LEVEL` | 日志级别 | `INFO` |
| `DATABASE_URL` | 数据库连接 | `sqlite+aiosqlite:///./data/app.db` |
| `CORS_ORIGINS` | CORS 允许的源 | `http://localhost` |
| `SECRET_KEY` | JWT 密钥 | - |
| `MAX_UPLOAD_SIZE` | 最大上传大小 | `52428800` |

## 性能优化

### 1. 调整 Nginx 工作进程

编辑 `nginx/nginx.conf`：

```nginx
worker_processes 4;  # 根据 CPU 核心数调整
```

### 2. 启用缓存

在站点配置中添加：

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ...
}
```

### 3. 调整 API 工作进程

编辑 `docker-compose.yml`：

```yaml
api:
  command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 监控和日志

### 查看日志

```bash
# 所有服务日志
docker-compose logs -f

# Nginx 访问日志
docker-compose exec nginx tail -f /var/log/nginx/access.log

# Nginx 错误日志
docker-compose exec nginx tail -f /var/log/nginx/error.log

# API 日志
docker-compose logs -f api
```

### 健康检查

```bash
# 检查服务健康状态
docker-compose ps

# 手动健康检查
curl http://localhost/health
curl http://localhost/api/health
```

## 故障排查

### 1. 容器无法启动

```bash
# 查看容器日志
docker-compose logs

# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### 2. 前端 404

检查前端构建文件是否存在：

```bash
ls -la ../web/dist
```

重新构建前端：

```bash
cd ../web
npm run build
cd ../docker
docker-compose restart nginx
```

### 3. API 502

检查 API 服务状态：

```bash
docker-compose ps api
docker-compose logs api
```

### 4. SSL 证书问题

检查证书文件权限：

```bash
ls -la nginx/ssl/
```

确保证书文件存在且权限正确。

## 安全建议

1. **修改默认密钥**：修改 `.env` 中的 `SECRET_KEY`
2. **使用 HTTPS**：在生产环境中配置 SSL 证书
3. **限制访问**：配置防火墙规则
4. **定期更新**：定期更新 Docker 镜像
5. **监控日志**：定期检查日志文件

## 备份和恢复

### 备份数据

```bash
# 备份数据卷
docker run --rm -v extract_api-data:/data -v $(pwd):/backup alpine tar czf /backup/api-data-backup.tar.gz /data

# 备份配置文件
tar czf nginx-config-backup.tar.gz nginx/
```

### 恢复数据

```bash
# 恢复数据卷
docker run --rm -v extract_api-data:/data -v $(pwd):/backup alpine tar xzf /backup/api-data-backup.tar.gz -C /

# 恢复配置文件
tar xzf nginx-config-backup.tar.gz
```

## 更新部署

### 更新代码

```bash
# 拉取最新代码
cd ..
git pull

# 重新构建前端
cd web
npm install
npm run build

# 重新部署
cd docker
docker-compose up -d --build
```

### 滚动更新

```bash
# 更新 API 服务
docker-compose up -d --no-deps --build api

# 更新 Nginx 服务
docker-compose up -d --no-deps --build nginx
```

## 生产环境检查清单

- [ ] 修改 `.env` 中的 `SECRET_KEY`
- [ ] 设置正确的 `CORS_ORIGINS`
- [ ] 配置 HTTPS 证书
- [ ] 设置防火墙规则
- [ ] 配置日志轮转
- [ ] 设置监控告警
- [ ] 配置自动备份
- [ ] 测试灾难恢复
- [ ] 性能测试
- [ ] 安全扫描

## 更多资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)

## 支持

如有问题，请提交 Issue 或联系技术支持。
