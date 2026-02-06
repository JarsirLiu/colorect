export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

export type SelectionMode = 'quick' | 'rect' | 'contour';
