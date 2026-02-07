/**
 * 背景颜色选择器组件
 */

import { BgColor } from '../types';
import { BG_COLOR_OPTIONS } from '../constants';

interface BgColorSelectorProps {
  selected: BgColor;
  onChange: (color: BgColor) => void;
  disabled?: boolean;
}

export const BgColorSelector = ({
  selected,
  onChange,
  disabled = false,
}: BgColorSelectorProps): JSX.Element => {
  return (
    <div className="space-y-3">
      <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
        Background Color
      </label>
      <div className="grid grid-cols-3 gap-3">
        {BG_COLOR_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              relative h-20 rounded-2xl transition-all duration-200
              border-2 ${selected === option.value ? 'border-black scale-105' : 'border-gray-100'}
              hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed
              shadow-sm hover:shadow-md active:scale-95
            `}
            style={{ backgroundColor: option.color }}
            title={option.label}
          >
            {selected === option.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black text-white rounded-full p-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
