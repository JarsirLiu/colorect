/**
 * 证件照 API 封装（复用现有抠图 API，不修改后端）
 */

/**
 * 调用抠图 API 移除背景
 * 注意：这里直接使用 axios，因为 http.ts 的响应拦截器对 blob 处理可能有问题
 * @param file 图片文件
 * @returns 返回透明背景的 PNG 图片 Blob
 */
export const removeBackground = async (file: File): Promise<Blob> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cutout/segment`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to remove background: ${response.statusText}`);
  }

  const blob = await response.blob();
  return blob;
};
