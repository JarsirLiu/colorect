# 前端图片预处理优化方案

## 📋 概述

将图片预处理从前端移到后端，可以显著降低服务器计算负载和图片传输流量消耗。

## 🎯 优化目标

- ✅ 降低服务器计算负载（图片压缩、调整大小在前端完成）
- ✅ 减少图片上传流量（压缩后上传，节省 90%+ 流量）
- ✅ 保持模型推理在后端（ONNX Runtime 性能更好）
- ✅ 提升用户体验（更快的上传速度）

## 📊 性能对比

| 图片尺寸 | 原始大小 | 优化后 | 节省 |
|---------|---------|--------|------|
| 4K (3840x2160) | ~8MB | ~500KB | **94%** |
| 1080p (1920x1080) | ~2MB | ~200KB | **90%** |
| 手机 (3000x4000) | ~6MB | ~400KB | **93%** |

## 🔧 实现方案

### 前端预处理（可执行）

| 操作 | 说明 | 配置 |
|------|------|------|
| 调整大小 | 限制最大边长 | `maxSize: 2048` |
| 质量压缩 | JPEG/WebP 压缩 | `quality: 0.85` |
| 格式转换 | 优先使用 WebP | `format: 'image/webp'` |

### 后端处理（必须保留）

| 操作 | 说明 | 原因 |
|------|------|------|
| 归一化 | `pixel / 255 - 0.5` | 需要 numpy/tensor |
| 维度转换 | `(2,0,1) + batch` | 需要 numpy/tensor |
| 模型推理 | ONNX Runtime | 后端性能更好 |
| 后处理 | mask 应用 | 需要 PIL |

## 📁 文件结构

```
frontend/src/features/cutout/
├── config/
│   └── preprocess.ts          # 预处理配置
├── utils/
│   ├── preprocess.ts          # 预处理工具函数 ✨ 新增
│   ├── imageUtils.ts          # 原有图片工具
│   └── index.ts               # 导出
└── page.tsx                   # 页面组件（已更新）
```

## 🚀 使用示例

### 基本使用

```typescript
import { preprocessImage } from './utils';

// 预处理图片
const { file, originalSize, processedSize, compressionRatio } = await preprocessImage(
  originalFile,
  {
    maxSize: 2048,
    quality: 0.85,
    format: 'image/jpeg'
  }
);

console.log(`压缩比: ${(compressionRatio * 100).toFixed(1)}%`);
```

### 裁剪 + 预处理

```typescript
import { getCroppedImage } from './utils';

// 裁剪并预处理选区
const file = await getCroppedImage(imageUrl, bbox, {
  maxSize: 2048,
  quality: 0.85,
  format: 'image/jpeg'
});
```

### Data URL 预处理

```typescript
import { preprocessDataUrl } from './utils';

// 预处理 Data URL
const processedDataUrl = await preprocessDataUrl(originalDataUrl, {
  maxSize: 2048,
  quality: 0.85
});
```

## ⚙️ 配置说明

### preprocessConfig

```typescript
{
  enabled: true,              // 是否启用预处理
  maxSize: 2048,             // 最大边长（像素）
  quality: 0.85,             // 压缩质量 (0-1)
  format: 'image/jpeg',      // 输出格式
  enableWebP: true           // 优先使用 WebP
}
```

### 参数调优建议

| 场景 | maxSize | quality | 说明 |
|------|---------|---------|------|
| 高质量 | 2048 | 0.90 | 保留更多细节 |
| 平衡 | 2048 | 0.85 | 默认配置 |
| 快速 | 1024 | 0.80 | 更快上传 |
| 移动端 | 1536 | 0.80 | 适配小屏幕 |

## 🔍 技术细节

### Canvas API

使用 Canvas API 进行图片处理：

```typescript
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// 调整大小
canvas.width = width;
canvas.height = height;
ctx.drawImage(img, 0, 0, width, height);

// 压缩
canvas.toBlob((blob) => {
  // 处理 blob
}, 'image/jpeg', 0.85);
```

### WebP 支持

自动检测浏览器 WebP 支持：

```typescript
const canvas = document.createElement('canvas');
const supportsWebP = canvas.toDataURL('image/webp')
  .indexOf('data:image/webp') === 0;
```

## 📈 监控指标

建议监控以下指标：

- 上传文件大小（原始 vs 压缩后）
- 上传耗时
- 压缩率
- 用户设备性能

## ⚠️ 注意事项

1. **质量权衡**：过低的压缩质量会影响抠图效果
2. **最大尺寸**：建议不超过 2048px，避免上传过大
3. **浏览器兼容性**：WebP 在旧浏览器不支持
4. **内存占用**：大图片处理会占用较多内存

## 🔄 回滚方案

如需回滚到原始方案：

1. 修改 `frontend/src/features/cutout/config/preprocess.ts`：
   ```typescript
   export const preprocessConfig = {
     enabled: false,  // 禁用预处理
     // ...
   };
   ```

2. 或直接在 `page.tsx` 中移除预处理调用

## 📚 参考资料

- [Canvas API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [WebP Image Format](https://developers.google.com/speed/webp)
- [Image Compression Guide](https://developer.mozilla.org/en-US/docs/Web/Media/Images/Image_optimization)
