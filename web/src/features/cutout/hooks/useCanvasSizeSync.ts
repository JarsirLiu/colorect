import { useEffect } from 'react';

interface UseCanvasSizeSyncProps {
  imageUrl: string | null;
  imageRef: React.RefObject<HTMLImageElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export function useCanvasSizeSync({
  imageUrl,
  imageRef,
  canvasRef
}: UseCanvasSizeSyncProps) {
  useEffect(() => {
    if (!imageUrl || !imageRef.current || !canvasRef.current) return;

    const syncCanvasSize = () => {
      const img = imageRef.current;
      const canvas = canvasRef.current;
      if (img && canvas && img.offsetWidth > 0) {
        canvas.style.width = `${img.offsetWidth}px`;
        canvas.style.height = `${img.offsetHeight}px`;
      }
    };

    const img = imageRef.current;
    img.addEventListener('load', syncCanvasSize);

    const timer = setTimeout(syncCanvasSize, 100);

    return () => {
      img.removeEventListener('load', syncCanvasSize);
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);
}
