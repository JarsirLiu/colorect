import { useState, useRef, useEffect, useCallback } from 'react'

import { preprocessImage } from '../utils'
import { uploadImage } from '../api'
import { useFileReader } from './useFileReader'
import { cropImageToBoundingBox } from './useImageCrop'

interface UseCutoutOperationsReturn {
  imageUrl: string | null
  resultImage: string | null
  isLoading: boolean
  error: string | null
  hasEnteredEditor: boolean
  fileInputRef: React.RefObject<HTMLInputElement>
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePaste: (e: React.ClipboardEvent) => void
  handleSegment: (bbox: { x: number; y: number; width: number; height: number } | null) => Promise<void>
  handleDownload: () => void
  handleReset: () => void
  handleGoHome: () => void
  setError: (error: string | null) => void
}

export function useCutoutOperations(): UseCutoutOperationsReturn {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [rawResultUrl, setRawResultUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasEnteredEditor, setHasEnteredEditor] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef<number>(0)

  const clearResultImage = useCallback((): void => {
    if (rawResultUrl) {
      URL.revokeObjectURL(rawResultUrl)
      setRawResultUrl(null)
    }
    setResultImage(null)
    setError(null)
  }, [rawResultUrl])

  const handleImageLoad = useCallback((dataUrl: string): void => {
    clearResultImage()
    setImageUrl(dataUrl)
    setHasEnteredEditor(true)
  }, [clearResultImage])

  const { readFile } = useFileReader({ onFileLoaded: handleImageLoad })

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (file) {
      readFile(file)
    }
    e.target.value = ''
  }, [readFile])

  const handlePaste = useCallback((e: React.ClipboardEvent): void => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault()
        const blob = item.getAsFile()
        if (blob) {
          readFile(blob)
        }
        break
      }
    }
  }, [readFile])

  const loadImage = useCallback(async (imageUrl: string): Promise<{ image: HTMLImageElement; blob: Blob }> => {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const originalFile = new File([blob], `image_${Date.now()}.png`, { type: 'image/png' })

    const result = await preprocessImage(originalFile, {
      maxSize: 2048,
      quality: 0.85,
      format: 'image/jpeg'
    })

    const fullResultBlob = await uploadImage(result.file)
    const fullResultDataUrl = URL.createObjectURL(fullResultBlob)

    const fullImage = new Image()
    fullImage.crossOrigin = 'anonymous'
    fullImage.src = fullResultDataUrl

    const cleanup = (): void => {
      URL.revokeObjectURL(fullResultDataUrl)
    }

    try {
      await new Promise<void>((resolve, reject) => {
        fullImage.onload = (): void => resolve()
        fullImage.onerror = (): void => reject(new Error('抠图结果加载失败'))
      })

      return { image: fullImage, blob: fullResultBlob }
    } catch (error) {
      cleanup()
      throw error
    }
  }, [])

  const processSegmentResult = useCallback((
    image: HTMLImageElement,
    blob: Blob,
    dataUrl: string,
    bbox: { x: number; y: number; width: number; height: number } | null
  ): void => {
    if (bbox && bbox.width >= 10 && bbox.height >= 10) {
      const croppedDataUrl = cropImageToBoundingBox(image, bbox)
      clearResultImage()
      setResultImage(croppedDataUrl)
      setTimeout(() => URL.revokeObjectURL(dataUrl), 1000)
    } else {
      const newResultUrl = URL.createObjectURL(blob)
      clearResultImage()
      setRawResultUrl(newResultUrl)
      setResultImage(newResultUrl)
      URL.revokeObjectURL(dataUrl)
    }
  }, [clearResultImage])

  const handleSegment = useCallback(async (
    bbox: { x: number; y: number; width: number; height: number } | null
  ): Promise<void> => {
    if (!imageUrl) {
      setError('请先上传图片')
      return
    }

    const currentRequestId = ++requestIdRef.current
    setIsLoading(true)
    setError(null)

    try {
      const { image, blob } = await loadImage(imageUrl)
      
      if (currentRequestId !== requestIdRef.current) {
        return
      }
      
      processSegmentResult(image, blob, image.src, bbox)
    } catch (error) {
      console.error('抠图处理失败:', error)
      setError('图像处理失败，请重试')
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false)
      }
    }
  }, [imageUrl, loadImage, processSegmentResult])

  const handleDownload = useCallback(() => {
    if (resultImage) {
      const link = document.createElement('a')
      link.href = resultImage
      link.download = 'segmented_image.png'
      link.click()
    }
  }, [resultImage])

  const handleReset = useCallback(() => {
    setImageUrl(null)
    clearResultImage()
  }, [clearResultImage])

  const handleGoHome = useCallback(() => {
    setHasEnteredEditor(false)
    setImageUrl(null)
    clearResultImage()
  }, [clearResultImage])

  useEffect(() => {
    return (): void => {
      if (rawResultUrl) {
        URL.revokeObjectURL(rawResultUrl)
      }
    }
  }, [rawResultUrl])

  return {
    imageUrl,
    resultImage,
    isLoading,
    error,
    hasEnteredEditor,
    fileInputRef,
    handleFileUpload,
    handlePaste,
    handleSegment,
    handleDownload,
    handleReset,
    handleGoHome,
    setError
  }
}
