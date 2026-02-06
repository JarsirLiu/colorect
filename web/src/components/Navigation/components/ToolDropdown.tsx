import { memo, useState, useCallback } from 'react'

import type { ToolDropdownProps } from '../type'
import { ToolButton } from './ToolButton'

/**
 * 图片处理工具下拉菜单组件
 * 
 * 职责：
 * - 管理下拉菜单的展开/收起状态
 * - 渲染工具列表
 */
export const ToolDropdown = memo(function ToolDropdown({ tools, onToolClick }: ToolDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleToolClickWrapper = useCallback((toolId: string) => {
    onToolClick(toolId)
    setIsOpen(false)
  }, [onToolClick])

  return (
    <div
      className="relative group cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* 下拉触发按钮 */}
      <button className="flex items-center space-x-1 py-4 text-[15px] font-medium text-gray-700 hover:text-blue-600 transition-colors">
        <span>图片处理工具</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉菜单内容 */}
      {isOpen && (
        <div className="absolute left-0 top-full w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-3 z-50 transform transition-all duration-200">
          {tools.map((tool) => (
            <ToolButton
              key={tool.id}
              tool={tool}
              onToolClick={handleToolClickWrapper}
            />
          ))}
        </div>
      )}
    </div>
  )
})
