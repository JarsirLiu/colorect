/**
 * 证件照尺寸选择器组件
 */

import { PhotoSize } from '../types';
import { PHOTO_SIZE_OPTIONS } from '../constants';

interface SizeSelectorProps {
  selected: PhotoSize;
  onChange: (size: PhotoSize) => void;
  disabled?: boolean;
}

export const SizeSelector = ({
  selected,
  onChange,
  disabled = false,
}: SizeSelectorProps): JSX.Element => {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
        Photo Size
      </label>
      <div className="grid grid-cols-2 gap-3">
        {PHOTO_SIZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              relative p-4 rounded-2xl transition-all duration-200
              border-2 ${selected === option.value ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'}
              hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
              shadow-sm hover:shadow-md active:scale-95
            `}
          >
            <div className="text-center">
              <div className="text-lg font-black text-gray-900 mb-1">
                {option.label}
              </div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {option.realSize}
              </div>
              <div className="text-[10px] text-gray-300 mt-1">
                {option.size.width} × {option.size.height}px
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
