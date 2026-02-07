/**
 * 图片展示组件
 */

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
}

export const ImageDisplay = ({ src, alt, className = '' }: ImageDisplayProps): JSX.Element => {
  return (
    <div className={`relative ${className}`}>
      <div className="relative rounded-3xl p-2 bg-gradient-to-br from-gray-100 to-white shadow-2xl border border-gray-50">
        <div className="flex items-center justify-center" style={{ width: '39.3vh', height: '55vh' }}>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-full rounded-2xl object-contain"
          />
        </div>
      </div>
    </div>
  );
};
