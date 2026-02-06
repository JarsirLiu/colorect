export const cropImageToBoundingBox = (
  image: HTMLImageElement,
  bbox: { x: number; y: number; width: number; height: number }
): string => {
  const cropCanvas = document.createElement('canvas')
  const width = Math.round(bbox.width)
  const height = Math.round(bbox.height)
  const x = Math.round(bbox.x)
  const y = Math.round(bbox.y)

  cropCanvas.width = width
  cropCanvas.height = height
  const ctx = cropCanvas.getContext('2d')

  if (!ctx) {
    throw new Error('无法获取 Canvas 上下文')
  }

  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

  return cropCanvas.toDataURL('image/png')
}
