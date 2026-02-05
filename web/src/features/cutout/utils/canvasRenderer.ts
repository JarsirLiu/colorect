export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * 绘制矩形框
 * @param ctx - Canvas 上下文
 * @param box - 矩形框
 * @param isPreview - 是否为预览模式
 * @param scale - 当前画布缩放比例 (naturalWidth / displayWidth)
 * @param brushSize - 画笔基础粗细
 */
export const drawRect = (
  ctx: CanvasRenderingContext2D,
  box: BoundingBox,
  isPreview = false,
  scale = 1,
  brushSize = 1
) => {
  if (!box) return;

  const baseWidth = Math.max(1, brushSize);
  const lineWidth = baseWidth * scale;
  const cornerSize = Math.max(6, 10 * (brushSize / 2)) * scale;
  const fontSize = Math.max(10, 14 * (brushSize / 2)) * scale;

  if (isPreview) {
    // 预览框样式（绿色）
    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([10 * scale, 5 * scale]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(72, 187, 120, 0.2)';
    ctx.fillRect(box.x, box.y, box.width, box.height);

    // 添加角标
    ctx.strokeStyle = '#48bb78';
    ctx.lineWidth = lineWidth * 1.5;

    ctx.beginPath();
    // 左上角
    ctx.moveTo(box.x, box.y + cornerSize);
    ctx.lineTo(box.x, box.y);
    ctx.lineTo(box.x + cornerSize, box.y);
    // 右上角
    ctx.moveTo(box.x + box.width - cornerSize, box.y);
    ctx.lineTo(box.x + box.width, box.y);
    ctx.lineTo(box.x + box.width, box.y + cornerSize);
    // 右下角
    ctx.moveTo(box.x + box.width, box.y + box.height - cornerSize);
    ctx.lineTo(box.x + box.width, box.y + box.height);
    ctx.lineTo(box.x + box.width - cornerSize, box.y + box.height);
    // 左下角
    ctx.moveTo(box.x + cornerSize, box.y + box.height);
    ctx.lineTo(box.x, box.y + box.height);
    ctx.lineTo(box.x, box.y + box.height - cornerSize);
    ctx.stroke();

    // 显示尺寸信息
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#48bb78';
    ctx.fillText(
      `${Math.round(box.width)} × ${Math.round(box.height)}`,
      box.x,
      box.y - 10 * scale
    );
  } else {
    // 正在拖拽的矩形框（蓝色）
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([5 * scale, 5 * scale]);
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(102, 126, 234, 0.2)';
    ctx.fillRect(box.x, box.y, box.width, box.height);

    // 显示尺寸信息
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.fillStyle = '#667eea';
    ctx.fillText(
      `${Math.round(box.width)} × ${Math.round(box.height)}`,
      box.x,
      box.y - 10 * scale
    );
  }
};

/**
 * 绘制画笔轮廓
 * @param ctx - Canvas 上下文
 * @param paths - 轮廓路径数组
 * @param currentPath - 当前正在画的路径
 * @param scale - 当前画布缩放比例 (naturalWidth / displayWidth)
 * @param brushSize - 画笔基础粗细
 */
export const drawContours = (
  ctx: CanvasRenderingContext2D,
  paths: Point[][],
  currentPath: Point[],
  scale = 1,
  brushSize = 3
) => {
  // 设置轮廓样式
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = brushSize * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 添加微弱外发光，让线更清晰
  ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
  ctx.shadowBlur = (brushSize + 1) * scale;

  // 绘制所有已完成的笔触
  paths.forEach(path => {
    if (path.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  });

  // 绘制当前正在画的笔触
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

  // 重置阴影避免影响其他绘制
  ctx.shadowBlur = 0;
};

