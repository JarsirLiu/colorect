export const TOOL_INFO: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Colorect 智能图片处理工具', subtitle: '强大的AI技术，让图片处理更加简单高效' },
  '/cutout': { title: '智能抠图', subtitle: '图片完全本地处理，一秒出图快如闪电。' },
  '/id-photo': { title: '证件照换背景', subtitle: '专业证件照换底色，智能识别主体。' }
}

export const NAVIGATION_TOOL_INFO: Record<string, { title: string }> = {
  '/': { title: '图片处理' },
  '/cutout': { title: '智能抠图' },
  '/id-photo': { title: '证件照换背景' }
}

export const IMAGE_TOOLS = [
  { id: 'cutout', name: '智能抠图', icon: '✂️', description: '一键去除背景' },
  { id: 'id-photo', name: '证件照换背景', icon: '🆔', description: '专业证件照制作' }
] as const

export type Tool = (typeof IMAGE_TOOLS)[number]
