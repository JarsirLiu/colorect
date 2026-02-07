/**
 * 证件照功能类型定义
 */

/**
 * 背景颜色选项
 */
export type BgColor = 'white' | 'blue' | 'red';

/**
 * 证件照尺寸选项
 */
export type PhotoSize = '1inch' | '2inch' | 'small' | 'big';

/**
 * 背景颜色配置
 */
export interface BgColorConfig {
  value: BgColor;
  label: string;
  color: string;
  hex: string;
}

/**
 * 证件照尺寸配置
 */
export interface PhotoSizeConfig {
  value: PhotoSize;
  label: string;
  size: { width: number; height: number }; // 像素尺寸
  realSize: string; // 实际尺寸说明
}

/**
 * 证件照状态
 */
export interface IdPhotoState {
  originalImage: string | null;      // 原始图片（上传的）
  transparentImage: string | null;  // 透明背景图片（抠图后）
  finalImage: string | null;         // 最终证件照（合成背景和调整尺寸后）
  isLoading: boolean;                // 处理中状态
  error: string | null;               // 错误信息
  bgColor: BgColor;                   // 当前选择的背景色
  photoSize: PhotoSize;               // 当前选择的证件照尺寸
}
