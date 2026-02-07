/**
 * 证件照常量配置
 */

import { BgColor, BgColorConfig, PhotoSize, PhotoSizeConfig } from './types';

/**
 * 背景颜色选项
 */
export const BG_COLOR_OPTIONS: BgColorConfig[] = [
  {
    value: 'white',
    label: '白色',
    color: '#FFFFFF',
    hex: '#FFFFFF'
  },
  {
    value: 'blue',
    label: '蓝色',
    color: '#438EDB',
    hex: '#438EDB'
  },
  {
    value: 'red',
    label: '红色',
    color: '#D04848',
    hex: '#D04848'
  }
];

/**
 * 证件照尺寸选项（@ 300dpi）
 */
export const PHOTO_SIZE_OPTIONS: PhotoSizeConfig[] = [
  {
    value: '1inch',
    label: '1寸',
    size: { width: 295, height: 413 },
    realSize: '25mm × 35mm'
  },
  {
    value: '2inch',
    label: '2寸',
    size: { width: 413, height: 579 },
    realSize: '35mm × 49mm'
  },
  {
    value: 'small',
    label: '小2寸',
    size: { width: 390, height: 567 },
    realSize: '33mm × 48mm'
  },
  {
    value: 'big',
    label: '大2寸',
    size: { width: 448, height: 626 },
    realSize: '38mm × 53mm'
  }
];

/**
 * 默认状态
 */
export const DEFAULT_BG_COLOR: BgColor = 'blue';
export const DEFAULT_PHOTO_SIZE: PhotoSize = '1inch';
