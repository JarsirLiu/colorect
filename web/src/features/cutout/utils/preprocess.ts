export interface PreprocessOptions {
  maxSize?: number;
  quality?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface PreprocessResult {
  file: File;
  originalSize: { width: number; height: number };
  processedSize: { width: number; height: number };
  compressionRatio: number;
}

const DEFAULT_CONFIG = {
  maxSize: 2048,
  quality: 0.85,
  format: 'image/jpeg' as const
};

export const preprocessImage = async (
  file: File,
  options: PreprocessOptions = {}
): Promise<PreprocessResult> => {
  const config = { ...DEFAULT_CONFIG, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('无法获取 Canvas 上下文'));
        return;
      }

      const originalWidth = img.width;
      const originalHeight = img.height;

      const scale = Math.min(1, config.maxSize / Math.max(originalWidth, originalHeight));
      const width = Math.round(originalWidth * scale);
      const height = Math.round(originalHeight * scale);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const ext = config.format === 'image/jpeg' ? '.jpg' : 
                        config.format === 'image/png' ? '.png' : '.webp';
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const processedFile = new File([blob], `${baseName}${ext}`, {
              type: config.format,
              lastModified: Date.now()
            });

            resolve({
              file: processedFile,
              originalSize: { width: originalWidth, height: originalHeight },
              processedSize: { width, height },
              compressionRatio: blob.size / file.size
            });
          } else {
            reject(new Error('图片处理失败'));
          }
        },
        config.format,
        config.quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };
    
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};
