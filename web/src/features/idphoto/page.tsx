/**
 * 证件照页面
 */

import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIdPhoto } from './hooks/useIdPhoto';
import { EditorMain } from './components/EditorMain';
import { EditorSidebar } from './components/EditorSidebar';

export const IdPhotoPage = () => {
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
    const handlePaste = (e: ClipboardEvent) => {
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
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleFileUpload]);

  const handleGoHome = () => {
    handleReset();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50/50 to-pink-50/50">
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
  );
};
