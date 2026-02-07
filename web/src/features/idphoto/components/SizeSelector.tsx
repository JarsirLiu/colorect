/**
 * 证件照尺寸选择器组件
 */

import { PhotoSize } from '../types';
import { PHOTO_SIZE_OPTIONS } from '../constants';

interface SizeSelectorProps {
  selected: PhotoSize;
  onChange: (size: PhotoSize) => void;
}

export const SizeSelector = ({
  selected,
  onChange,
}: SizeSelectorProps): JSX.Element => {
  return (
    <div className="space-y-2">
      <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
        Photo Size
      </label>
      <div className="grid grid-cols-2 gap-1.5">
        {PHOTO_SIZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`
              relative p-2 rounded-xl transition-all duration-200
              border-2 ${selected === option.value ? 'border-black bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-300'}
              shadow-sm hover:shadow-md active:scale-95
            `}
          >
            <div className="text-center">
              <div className="text-sm font-black text-gray-900 mb-0.5">
                {option.label}
              </div>
              <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
                {option.realSize}
              </div>
              <div className="text-[9px] text-gray-300 mt-0.5">
                {option.size.width} × {option.size.height}px
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
