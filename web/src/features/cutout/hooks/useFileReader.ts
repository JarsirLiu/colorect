import { useCallback } from 'react'

interface UseFileReaderOptions {
  onFileLoaded: (dataUrl: string) => void
}

export const useFileReader = ({ onFileLoaded }: UseFileReaderOptions): { readFile: (file: File) => void } => {
  const readFile = useCallback((file: File): void => {
    const reader = new FileReader()
    reader.onload = (event: Event): void => {
      const target = event.target as FileReader
      const result = target.result
      if (typeof result === 'string') {
        onFileLoaded(result)
      }
    }
    reader.onerror = (): void => {
      console.error('文件读取失败:', file.name)
    }
    reader.readAsDataURL(file)
  }, [onFileLoaded])

  return { readFile }
}
