import { useState, useCallback } from 'react';

import { Point, BoundingBox } from '../../types';

interface UseContourSelectionReturn {
  isDrawing: boolean;
  contourPaths: Point[][];
  currentPath: Point[];
  startContourDraw: (pos: Point) => void;
  updateContourDraw: (pos: Point) => void;
  endContourDraw: () => void;
  undoLastStroke: () => void;
  clearContours: () => void;
  getBoundingBox: () => BoundingBox | null;
}

export const useContourSelection = (): UseContourSelectionReturn => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [contourPaths, setContourPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const startContourDraw = useCallback((pos: Point): void => {
    setIsDrawing(true);
    setCurrentPath([pos]);
  }, []);

  const updateContourDraw = useCallback((pos: Point): void => {
    setCurrentPath(prev => [...prev, pos]);
  }, []);

  const endContourDraw = useCallback((): void => {
    if (currentPath.length > 1) {
      setContourPaths(prev => [...prev, currentPath]);
    }
    setCurrentPath([]);
    setIsDrawing(false);
  }, [currentPath]);

  const undoLastStroke = useCallback((): void => {
    if (contourPaths.length > 0) {
      setContourPaths(prev => prev.slice(0, -1));
    }
  }, [contourPaths.length]);

  const clearContours = useCallback((): void => {
    setContourPaths([]);
    setCurrentPath([]);
  }, []);

  const getBoundingBox = useCallback((): BoundingBox | null => {
    const allPaths = [...contourPaths];
    if (currentPath.length > 0) {
      allPaths.push(currentPath);
    }

    if (allPaths.length === 0) return null;

    const allPoints = allPaths.flat();
    const xs = allPoints.map(p => p.x);
    const ys = allPoints.map(p => p.y);

    return {
      x: Math.min(...xs),
      y: Math.min(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }, [contourPaths, currentPath]);

  return {
    isDrawing,
    contourPaths,
    currentPath,
    startContourDraw,
    updateContourDraw,
    endContourDraw,
    undoLastStroke,
    clearContours,
    getBoundingBox
  };
};
