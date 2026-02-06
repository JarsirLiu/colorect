import { ImageDisplay } from './ImageDisplay';
import { EditorUploadArea } from '../upload/EditorUploadArea';

interface EditorMainProps {
  imageUrl: string | null;
  resultImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileClick: () => void;
  selectionMode: 'quick' | 'rect' | 'contour';
  imageRef: React.RefObject<HTMLImageElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const EditorMain = ({
  imageUrl,
  resultImage,
  fileInputRef,
  onFileUpload,
  onFileClick,
  selectionMode,
  imageRef,
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}: EditorMainProps): JSX.Element => {
  return (
    <main className="flex-1 bg-gray-50/50 p-8 flex flex-col relative overflow-hidden">
      <div className="flex-1 bg-white rounded-[40px] border border-gray-100 shadow-inner flex items-center justify-center p-8 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        ></div>

        {imageUrl ? (
          <div className="flex items-center gap-8 max-w-full max-h-full relative z-10">
            <div className={`transition-all duration-700 ${resultImage ? 'w-1/2' : 'w-full'} flex flex-col items-center`}>
              <ImageDisplay
                imageUrl={imageUrl}
                imageRef={imageRef}
                canvasRef={canvasRef}
                selectionMode={selectionMode}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
              />
            </div>

            {resultImage && (
              <div className="w-1/2 flex flex-col items-center animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="relative rounded-2xl p-1 bg-white shadow-2xl border border-gray-50 checkerboard-bg inline-block">
                  <img src={resultImage} alt="Result" className="max-h-[60vh] rounded-xl" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <EditorUploadArea fileInputRef={fileInputRef} onFileUpload={onFileUpload} onFileClick={onFileClick} />
        )}
      </div>
    </main>
  );
};
