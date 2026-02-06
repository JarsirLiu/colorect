# SSL 证书目录

将你的 SSL 证书文件放在这里：

- `your-domain.com.crt` - SSL 证书文件
- `your-domain.com.key` - SSL 私钥文件

## 使用 Let's Encrypt

如果你使用 Let's Encrypt，可以使用 certbot 自动生成证书：

```bash
# 在宿主机上运行
sudo certbot certonly --standalone -d your-domain.com

# 证书位置
# /etc/letsencrypt/live/your-domain.com/fullchain.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem

# 复制到本目录
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./your-domain.com.crt
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./your-domain.com.key
```

## 使用自有证书

如果你有自己的 SSL 证书，直接将 `.crt` 和 `.key` 文件复制到此目录。

## 权限设置

```bash
chmod 600 your-domain.com.*
```
