/**
 * 证件照页面
 */

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIdPhoto } from './hooks/useIdPhoto';
import { EditorMain } from './components/EditorMain';
import { EditorSidebar } from './components/EditorSidebar';

export const IdPhotoPage = (): JSX.Element => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    state,
    handleFileUpload,
    updateBgColor,
    updatePhotoSize,
    handleDownload,
    handleReset,
  } = useIdPhoto();

  // 处理剪贴板粘贴
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent): void => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob && blob.type.startsWith('image/')) {
            handleFileUpload(blob);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return (): void => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleFileUpload]);

  const handleGoHome = (): void => {
    handleReset();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50/50 to-pink-50/50 px-8 py-6">
      <div className="flex w-full max-w-[1800px] mx-auto gap-4">
        <EditorSidebar
          bgColor={state.bgColor}
          photoSize={state.photoSize}
          isLoading={state.isLoading}
          finalImage={state.finalImage}
          onBgColorChange={updateBgColor}
          onPhotoSizeChange={updatePhotoSize}
          onDownload={handleDownload}
          onReset={handleReset}
          onGoHome={handleGoHome}
        />
        <EditorMain
          originalImage={state.originalImage}
          finalImage={state.finalImage}
          fileInputRef={fileInputRef}
          onFileUpload={handleFileUpload}
        />
      </div>
    </div>
  );
};
