import { BoundingBox, Point } from '../../types';

export const drawRect = (
  ctx: CanvasRenderingContext2D,
  box: BoundingBox,
  isPreview = false,
  scale = 1,
  brushSize = 1
): void => {
  if (!box) return;

  const baseWidth = Math.max(1, brushSize);
  const lineWidth = baseWidth * scale;
  const cornerSize = Math.max(6, 10 * (brushSize / 2)) * scale;
  const fontSize = Math.max(10, 14 * (brushSize / 2)) * scale;

  if (isPreview) {
    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([10 * scale, 5 * scale]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(72, 187, 120, 0.2)';
    ctx.fillRect(box.x, box.y, box.width, box.height);

    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = lineWidth * 1.5;

    ctx.beginPath();
    ctx.moveTo(box.x, box.y + cornerSize);
    ctx.lineTo(box.x, box.y);
    ctx.lineTo(box.x + cornerSize, box.y);
    ctx.moveTo(box.x + box.width - cornerSize, box.y);
    ctx.lineTo(box.x + box.width, box.y);
    ctx.lineTo(box.x + box.width, box.y + cornerSize);
    ctx.moveTo(box.x + box.width, box.y + box.height - cornerSize);
    ctx.lineTo(box.x + box.width, box.y + box.height);
    ctx.lineTo(box.x + box.width - cornerSize, box.y + box.height);
    ctx.moveTo(box.x + cornerSize, box.y + box.height);
    ctx.lineTo(box.x, box.y + box.height);
    ctx.lineTo(box.x, box.y + box.height - cornerSize);
    ctx.stroke();

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#48bb78';
    ctx.fillText(
      `${Math.round(box.width)} × ${Math.round(box.height)}`,
      box.x,
      box.y - 10 * scale
    );
  } else {
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([5 * scale, 5 * scale]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
    ctx.fillRect(box.x, box.y, box.width, box.height);

    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#667eea';
    ctx.fillText(
      `${Math.round(box.width)} × ${Math.round(box.height)}`,
      box.x,
      box.y - 10 * scale
    );
  }
};

export const drawContours = (
  ctx: CanvasRenderingContext2D,
  paths: Point[][],
  currentPath: Point[],
  scale = 1,
  brushSize = 3
): void => {
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = brushSize * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
  ctx.shadowBlur = (brushSize + 1) * scale;

  paths.forEach(path => {
    if (path.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  });

  if (currentPath && currentPath.length > 1) {
    ctx.beginPath();
    ctx.setLineDash([5 * scale, 5 * scale]);
    ctx.moveTo(currentPath[0].x, currentPath[0].y);
    for (let i = 1; i < currentPath.length; i++) {
      ctx.lineTo(currentPath[i].x, currentPath[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.shadowBlur = 0;
};
