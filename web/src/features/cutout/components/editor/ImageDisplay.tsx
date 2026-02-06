interface ImageDisplayProps {
  imageUrl: string;
  imageRef: React.RefObject<HTMLImageElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  selectionMode: 'quick' | 'rect' | 'contour';
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const ImageDisplay = ({
  imageUrl,
  imageRef,
  canvasRef,
  selectionMode,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave
}: ImageDisplayProps): JSX.Element => {
  return (
    <div className="relative rounded-2xl p-1 bg-white shadow-2xl border border-gray-50 inline-block">
      <img
        ref={imageRef}
        src={imageUrl}
        alt="Source"
        className="max-h-[60vh] rounded-xl"
      />
      <canvas
        ref={canvasRef}
        className={`absolute top-1 left-1 z-20 ${selectionMode === 'quick' ? 'cursor-default' : 'cursor-crosshair'} rounded-xl`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
};
