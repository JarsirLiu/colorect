/**
 * 证件照主工作区组件
 */

import { ImageDisplay } from './ImageDisplay';
import { UploadArea } from './UploadArea';

interface EditorMainProps {
  originalImage: string | null;
  finalImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (file: File) => void;
}

export const EditorMain = ({
  originalImage,
  finalImage,
  fileInputRef,
  onFileUpload,
}: EditorMainProps): JSX.Element => {
  const showComparison = originalImage !== null;
  const showFinalResult = finalImage !== null;

  return (
    <main className="flex-1 bg-gray-50/50 p-6 flex flex-col relative overflow-hidden">
      <div className="flex-1 bg-white rounded-[40px] border border-gray-100 shadow-inner flex items-center justify-center p-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        ></div>

        {!showComparison ? (
          <UploadArea fileInputRef={fileInputRef} onFileUpload={onFileUpload} />
        ) : (
          <div className="flex items-center gap-8 max-w-full max-h-full relative z-10">
            <div className={`transition-all duration-700 ${showFinalResult ? 'w-1/2' : 'w-full'} flex flex-col items-center`}>
              <div className="mb-4">
                <div className="text-[10px] font-black uppercase text-gray-300 tracking-widest text-center mb-2">
                  Original
                </div>
                <ImageDisplay
                  src={originalImage}
                  alt="原图"
                />
              </div>
            </div>

            {showFinalResult && (
              <div className="w-1/2 flex flex-col items-center animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="mb-4">
                  <div className="text-[10px] font-black uppercase text-black tracking-widest text-center mb-2">
                    Final Result
                  </div>
                  <ImageDisplay
                    src={finalImage}
                    alt="证件照结果"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};
