# Nginx 配置说明

本目录包含 AI 工具平台的 Nginx 配置文件。

## 目录结构

```
nginx/
├── README.md                    # 本文件
├── nginx.conf                   # Nginx 主配置文件
├── mime.types                   # MIME 类型配置
├── fastcgi_params               # FastCGI 参数
├── conf.d/                      # 额外配置目录
│   └── default.conf            # 默认站点配置
├── sites-available/             # 站点配置目录
│   ├── extract-http.conf       # HTTP 站点配置
│   └── extract-https.conf      # HTTPS 站点配置
├── snippets/                    # 配置片段
│   ├── deny-hidden.conf       # 隐藏文件访问控制
│   └── security-headers.conf   # 安全头配置
└── ssl/                         # SSL 证书目录
    └── README.md               # SSL 证书说明
```

## 配置文件说明

### nginx.conf

Nginx 主配置文件，包含全局设置：

- **工作进程**: 自动（`worker_processes auto`）
- **工作连接数**: 1024
- **Gzip 压缩**: 已启用
- **日志格式**: 标准 main 格式
- **最大上传大小**: 50MB
- **隐藏版本号**: 已启用（`server_tokens off`）

### mime.types

定义文件 MIME 类型映射，确保浏览器正确识别文件类型。

### fastcgi_params

FastCGI 参数配置，用于 PHP 等动态语言支持。

### conf.d/default.conf

默认站点配置，适用于本地开发：

- 监听端口：80
- 反向代理：`/api/*` → `http://api:8000`
- 静态文件：`/usr/share/nginx/html`
- 文档访问：`/docs`、`/redoc`、`/openapi.json`
- 健康检查：`/health`

### sites-available/extract-http.conf

HTTP 站点配置，适用于开发或测试环境：

- 监听端口：80
- 支持自定义域名
- 其他配置同默认配置

### sites-available/extract-https.conf

HTTPS 站点配置，适用于生产环境：

- HTTP 自动跳转 HTTPS
- 监听端口：443
- SSL 协议：TLSv1.2、TLSv1.3
- SSL 证书路径：`/etc/nginx/ssl/your-domain.com.crt`
- SSL 私钥路径：`/etc/nginx/ssl/your-domain.com.key`

### snippets/deny-hidden.conf

隐藏文件访问控制配置，防止访问 `.git`、`.env` 等敏感文件。

### snippets/security-headers.conf

安全头配置，包括：

- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer-Policy
- Content-Security-Policy

### ssl/README.md

SSL 证书配置说明，包括：

- Let's Encrypt 证书生成
- 自有证书配置
- 权限设置

## 使用方法

### 1. 默认配置（本地开发）

直接使用 `conf.d/default.conf`，无需额外配置。

### 2. 自定义域名（HTTP）

```bash
# 复制站点配置
cp nginx/sites-available/extract-http.conf nginx/conf.d/extract.conf

# 修改域名
vim nginx/conf.d/extract.conf

# 重启 Nginx
docker-compose restart nginx
```

### 3. HTTPS 配置

#### 3.1 准备 SSL 证书

将证书文件放在 `nginx/ssl/` 目录：

- `your-domain.com.crt` - SSL 证书文件
- `your-domain.com.key` - SSL 私钥文件

#### 3.2 使用 Let's Encrypt

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

#### 3.3 配置 HTTPS

```bash
# 复制 HTTPS 配置
cp nginx/sites-available/extract-https.conf nginx/conf.d/extract.conf

# 修改域名和证书路径
vim nginx/conf.d/extract.conf

# 重启 Nginx
docker-compose restart nginx
```

## 配置优化

### 1. 调整工作进程

编辑 `nginx.conf`：

```nginx
worker_processes 4;  # 根据 CPU 核心数调整
```

### 2. 调整工作连接数

编辑 `nginx.conf`：

```nginx
events {
    worker_connections 2048;  # 增加连接数
}
```

### 3. 启用缓存

在站点配置中添加：

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_bypass $http_upgrade;
    # ... 其他配置
}
```

### 4. 限制请求速率

在站点配置中添加：

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    # ... 其他配置
}
```

### 5. 添加安全头

在站点配置中包含安全头片段：

```nginx
include /etc/nginx/snippets/security-headers.conf;
```

## 日志管理

### 日志位置

- 访问日志：`/var/log/nginx/access.log`
- 错误日志：`/var/log/nginx/error.log`

### 查看日志

```bash
# 访问日志
docker-compose exec nginx tail -f /var/log/nginx/access.log

# 错误日志
docker-compose exec nginx tail -f /var/log/nginx/error.log
```

### 日志轮转

Nginx Alpine 镜像默认不包含 logrotate，如需日志轮转，可以：

1. 使用 Docker 日志驱动：

```yaml
# docker-compose.yml
nginx:
  logging:
    driver: "json-file"
    options:
      max-size: "10m"
      max-file: "3"
```

2. 或使用外部日志收集系统（如 ELK、Loki）

## 故障排查

### 1. 配置测试

```bash
# 测试配置文件
docker-compose exec nginx nginx -t

# 重新加载配置
docker-compose exec nginx nginx -s reload
```

### 2. 查看错误日志

```bash
docker-compose exec nginx tail -f /var/log/nginx/error.log
```

### 3. 检查端口

```bash
# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### 4. 检查证书

```bash
# 检查证书文件
ls -la nginx/ssl/

# 检查证书有效期
openssl x509 -in nginx/ssl/your-domain.com.crt -noout -dates
```

## 性能监控

### 启用状态页面

在站点配置中添加：

```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

访问 `http://localhost/nginx_status` 查看状态。

### 使用监控工具

推荐使用以下监控工具：

- Prometheus + Grafana
- Datadog
- New Relic
- Zabbix

## 安全建议

1. **隐藏版本号**：已在 `nginx.conf` 中配置 `server_tokens off`
2. **限制访问敏感路径**：使用 `snippets/deny-hidden.conf`
3. **配置安全头**：使用 `snippets/security-headers.conf`
4. **使用 HTTPS**：在生产环境中配置 SSL 证书
5. **限制请求速率**：防止 DDoS 攻击
6. **定期更新**：定期更新 Nginx 镜像

## 更多资源

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [Nginx 配置最佳实践](https://www.nginx.com/blog/tuning-nginx/)
- [Let's Encrypt 文档](https://letsencrypt.org/docs/)
- [OWASP 安全指南](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
