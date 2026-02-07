/**
 * 证件照侧边栏组件
 */

import { BgColor, PhotoSize } from '../types';
import { BgColorSelector } from './BgColorSelector';
import { SizeSelector } from './SizeSelector';

interface EditorSidebarProps {
  bgColor: BgColor;
  photoSize: PhotoSize;
  isLoading: boolean;
  finalImage: string | null;
  onBgColorChange: (color: BgColor) => void;
  onPhotoSizeChange: (size: PhotoSize) => void;
  onDownload: () => void;
  onReset: () => void;
  onGoHome: () => void;
}

export const EditorSidebar = ({
  bgColor,
  photoSize,
  isLoading,
  finalImage,
  onBgColorChange,
  onPhotoSizeChange,
  onDownload,
  onReset,
  onGoHome,
}: EditorSidebarProps): JSX.Element => {
  return (
    <aside className="w-72 shrink-0 bg-white border-r border-gray-100 p-4 flex flex-col overflow-y-auto custom-scrollbar">
      {/* 返回按钮 */}
      <button
        onClick={onGoHome}
        className="text-[11px] font-black text-gray-400 hover:text-gray-900 mb-2 flex items-center transition-colors group"
      >
        <svg className="w-4 h-4 mr-1 relative top-[0.5px] transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="relative top-[0.5px]">返回首页</span>
      </button>

      {/* 标题 */}
      <h3 className="text-lg font-black italic mb-2">ID PHOTO MAKER</h3>

      {/* 背景颜色选择 */}
      <div className="mb-2">
        <BgColorSelector
          selected={bgColor}
          onChange={onBgColorChange}
        />
      </div>

      {/* 证件照尺寸选择 */}
      <div className="mb-2">
        <SizeSelector
          selected={photoSize}
          onChange={onPhotoSizeChange}
        />
      </div>

      {/* 处理状态 */}
      <div className="mb-0 min-h-[36px]">
        {isLoading && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-bold text-purple-900">
                处理中...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作区 */}
      <div className="mt-0 space-y-2">
        {/* 下载按钮 */}
        {finalImage && !isLoading && (
          <button
            onClick={onDownload}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 active:scale-95 transition-all hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <span>下载证件照</span>
          </button>
        )}

        {/* 重置按钮 */}
        <button
          onClick={onReset}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold hover:bg-gray-200 active:scale-95 transition-all"
        >
          重置
        </button>

        {/* 状态信息 */}
        <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400 tracking-widest mt-6 pt-4 border-t border-gray-100">
          <span>Hardware Stat</span>
          <span className="text-purple-600">API</span>
        </div>
      </div>
    </aside>
  );
};
