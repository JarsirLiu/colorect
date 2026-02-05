import { useState, useRef, useEffect } from 'react';
import { preprocessImage } from '../utils';
import { uploadImage } from '../api';

export function useCutoutOperations() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasEnteredEditor, setHasEnteredEditor] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (resultImageUrl) {
          URL.revokeObjectURL(resultImageUrl);
          setResultImageUrl(null);
        }
        setImageUrl(event.target?.result as string);
        setResultImage(null);
        setError(null);
        setHasEnteredEditor(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (resultImageUrl) {
              URL.revokeObjectURL(resultImageUrl);
              setResultImageUrl(null);
            }
            setImageUrl(event.target?.result as string);
            setResultImage(null);
            setError(null);
            setHasEnteredEditor(true);
          };
          reader.readAsDataURL(blob);
        }
        break;
      }
    }
  };

  const handleSegment = async (
    bbox: { x: number; y: number; width: number; height: number } | null
  ) => {
    if (!imageUrl) {
      setError('请先上传图片');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const originalFile = new File([blob], `image_${Date.now()}.png`, { type: 'image/png' });

      const result = await preprocessImage(originalFile, {
        maxSize: 2048,
        quality: 0.85,
        format: 'image/jpeg'
      });

      const fullResultBlob = await uploadImage(result.file);

      const fullResultDataUrl = URL.createObjectURL(new Blob([fullResultBlob as unknown as Blob], { type: 'image/png' }));

      const fullImage = new Image();
      fullImage.crossOrigin = 'anonymous';
      fullImage.src = fullResultDataUrl;

      await new Promise<void>((resolve, reject) => {
        fullImage.onload = () => resolve();
        fullImage.onerror = () => reject(new Error('抠图结果加载失败'));
      });

      if (bbox && bbox.width >= 10 && bbox.height >= 10) {
        const cropCanvas = document.createElement('canvas');
        const width = Math.round(bbox.width);
        const height = Math.round(bbox.height);
        const x = Math.round(bbox.x);
        const y = Math.round(bbox.y);

        cropCanvas.width = width;
        cropCanvas.height = height;
        const ctx = cropCanvas.getContext('2d');

        if (!ctx) {
          throw new Error('无法获取 Canvas 上下文');
        }

        ctx.drawImage(fullImage, x, y, width, height, 0, 0, width, height);

        const croppedDataUrl = cropCanvas.toDataURL('image/png');

        if (resultImageUrl) {
          URL.revokeObjectURL(resultImageUrl);
        }
        URL.revokeObjectURL(fullResultDataUrl);

        setResultImage(croppedDataUrl);
        setResultImageUrl(null);
      } else {
        const resultBlob = new Blob([fullResultBlob as unknown as Blob], { type: 'image/png' });
        if (resultImageUrl) {
          URL.revokeObjectURL(resultImageUrl);
        }
        const newResultUrl = URL.createObjectURL(resultBlob);
        setResultImageUrl(newResultUrl);
        setResultImage(newResultUrl);
        URL.revokeObjectURL(fullResultDataUrl);
      }
    } catch {
      setError('图像处理失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = 'segmented_image.png';
      link.click();
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    if (resultImageUrl) {
      URL.revokeObjectURL(resultImageUrl);
      setResultImageUrl(null);
    }
    setResultImage(null);
    setError(null);
  };

  const handleGoHome = () => {
    setHasEnteredEditor(false);
    setImageUrl(null);
    if (resultImageUrl) {
      URL.revokeObjectURL(resultImageUrl);
      setResultImageUrl(null);
    }
    setResultImage(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      if (resultImageUrl) {
        URL.revokeObjectURL(resultImageUrl);
      }
    };
  }, [resultImageUrl]);

  return {
    imageUrl,
    resultImage,
    isLoading,
    error,
    hasEnteredEditor,
    fileInputRef,
    handleFileUpload,
    handlePaste,
    handleSegment,
    handleDownload,
    handleReset,
    handleGoHome,
    setError
  };
}
