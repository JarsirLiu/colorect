import { memo } from 'react'

import type { ToolButtonProps } from '../type'

/**
 * 单个工具按钮组件
 * 
 * 解决 react/jsx-no-bind 规则问题：
 * 通过独立的组件避免在 map 循环中创建内联函数
 */
export const ToolButton = memo(function ToolButton({ tool, onToolClick }: ToolButtonProps) {
  return (
    <button
      onClick={() => onToolClick(tool.id)}
      className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
    >
      <span className="text-xl">{tool.icon}</span>
      <div>
        <div className="font-semibold text-gray-900 text-sm">{tool.name}</div>
        <div className="text-xs text-gray-500">{tool.description}</div>
      </div>
    </button>
  )
})
