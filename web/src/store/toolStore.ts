import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type ToolId = 'cutout' | 'id-photo' | 'enhance' | 'filter'

export interface Tool {
  id: ToolId
  name: string
  icon: string
  description: string
  available: boolean
}

interface ToolState {
  currentTool: ToolId | null
  tools: Tool[]

  setCurrentTool: (toolId: ToolId | null) => void
  getToolById: (toolId: ToolId) => Tool | undefined
}

const TOOLS: Tool[] = [
  { id: 'cutout', name: '智能抠图', icon: '✂️', description: '一键去除背景', available: true },
  { id: 'id-photo', name: '证件照换背景', icon: '🆔', description: '专业证件照制作', available: true },
  { id: 'enhance', name: '图片增强', icon: '✨', description: '自动提升图片质量', available: false },
  { id: 'filter', name: '滤镜效果', icon: '🎭', description: '多种滤镜效果', available: false }
]

export const useToolStore = create<ToolState>()(
  devtools(
    (set, get) => ({
      currentTool: null,
      tools: TOOLS,

      setCurrentTool: (toolId: ToolId | null): void => set({ currentTool: toolId }),

      getToolById: (toolId: ToolId): Tool | undefined => {
        return get().tools.find(tool => tool.id === toolId)
      }
    }),
    { name: 'ToolStore' }
  )
)
