export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const cropSelectedArea = (imageUrl: string, bbox: BoundingBox): Promise<{ blob: Blob; bbox: BoundingBox }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const cropCanvas = document.createElement('canvas');
      const width = Math.round(bbox.width);
      const height = Math.round(bbox.height);
      const x = Math.round(bbox.x);
      const y = Math.round(bbox.y);

      cropCanvas.width = width;
      cropCanvas.height = height;
      const ctx = cropCanvas.getContext('2d');

      if (!ctx) {
        resolve({ blob: new Blob(), bbox });
        return;
      }

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        img,
        x, y, width, height,
        0, 0, width, height
      );

      cropCanvas.toBlob((blob) => {
        if (blob) {
          resolve({ blob, bbox });
        } else {
          resolve({ blob: new Blob(), bbox });
        }
      }, 'image/png');
    };
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
  });
};
