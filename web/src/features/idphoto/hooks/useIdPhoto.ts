/**
 * 证件照核心 Hook
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { BgColor, PhotoSize, IdPhotoState } from '../types';
import { DEFAULT_BG_COLOR, DEFAULT_PHOTO_SIZE } from '../constants';
import { removeBackground } from '../api';
import { generateIdPhoto, revokeBlobUrl } from '../utils/canvas';

export const useIdPhoto = () => {
  // 状态管理
  const [state, setState] = useState<IdPhotoState>({
    originalImage: null,
    transparentImage: null,
    finalImage: null,
    isLoading: false,
    error: null,
    bgColor: DEFAULT_BG_COLOR,
    photoSize: DEFAULT_PHOTO_SIZE,
  });

  // 引用用于清理和存储最新状态
  const previousFinalImageRef = useRef<string | null>(null);
  const stateRef = useRef(state);

  // 同步最新状态到 ref
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /**
   * 处理文件上传
   */
  const handleFileUpload = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const imageUrl = URL.createObjectURL(file);
      const blob = await removeBackground(file);
      const transparentImageUrl = URL.createObjectURL(blob);

      const finalImageUrl = await generateIdPhoto(
        transparentImageUrl,
        stateRef.current.bgColor,
        stateRef.current.photoSize
      );

      if (previousFinalImageRef.current) {
        revokeBlobUrl(previousFinalImageRef.current);
      }
      previousFinalImageRef.current = finalImageUrl;

      setState(prev => ({
        ...prev,
        originalImage: imageUrl,
        transparentImage: transparentImageUrl,
        finalImage: finalImageUrl,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '处理失败，请重试',
      }));
    }
  }, []);

  /**
   * 更新背景色
   */
  const updateBgColor = useCallback(async (bgColor: BgColor) => {
    const currentTransparentImage = stateRef.current.transparentImage;
    if (!currentTransparentImage) {
      return;
    }

    setState(prev => ({ ...prev, bgColor, isLoading: true }));

    try {
      const finalImageUrl = await generateIdPhoto(
        currentTransparentImage,
        bgColor,
        stateRef.current.photoSize
      );

      if (previousFinalImageRef.current) {
        revokeBlobUrl(previousFinalImageRef.current);
      }
      previousFinalImageRef.current = finalImageUrl;

      setState(prev => ({
        ...prev,
        finalImage: finalImageUrl,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '生成失败',
      }));
    }
  }, []);

  /**
   * 更新证件照尺寸
   */
  const updatePhotoSize = useCallback(async (photoSize: PhotoSize) => {
    const currentTransparentImage = stateRef.current.transparentImage;
    if (!currentTransparentImage) {
      return;
    }

    setState(prev => ({ ...prev, photoSize, isLoading: true }));

    try {
      const finalImageUrl = await generateIdPhoto(
        currentTransparentImage,
        stateRef.current.bgColor,
        photoSize
      );

      if (previousFinalImageRef.current) {
        revokeBlobUrl(previousFinalImageRef.current);
      }
      previousFinalImageRef.current = finalImageUrl;

      setState(prev => ({
        ...prev,
        finalImage: finalImageUrl,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '生成失败',
      }));
    }
  }, []);

  /**
   * 下载证件照
   */
  const handleDownload = useCallback(() => {
    const currentFinalImage = stateRef.current.finalImage;
    if (!currentFinalImage) {
      return;
    }

    const filename = `idphoto_${stateRef.current.bgColor}_${stateRef.current.photoSize}.jpg`;

    const link = document.createElement('a');
    link.href = currentFinalImage;
    link.download = filename;
    link.click();
  }, []);

  /**
   * 重置状态
   */
  const handleReset = useCallback(() => {
    const currentOriginalImage = stateRef.current.originalImage;
    const currentTransparentImage = stateRef.current.transparentImage;
    const currentFinalImage = stateRef.current.finalImage;

    if (currentOriginalImage) {
      revokeBlobUrl(currentOriginalImage);
    }
    if (currentTransparentImage) {
      revokeBlobUrl(currentTransparentImage);
    }
    if (currentFinalImage) {
      revokeBlobUrl(currentFinalImage);
    }
    previousFinalImageRef.current = null;

    setState({
      originalImage: null,
      transparentImage: null,
      finalImage: null,
      isLoading: false,
      error: null,
      bgColor: DEFAULT_BG_COLOR,
      photoSize: DEFAULT_PHOTO_SIZE,
    });
  }, []);

  /**
   * 清理资源
   */
  const cleanup = useCallback(() => {
    const currentOriginalImage = stateRef.current.originalImage;
    const currentTransparentImage = stateRef.current.transparentImage;
    const currentFinalImage = stateRef.current.finalImage;

    if (currentOriginalImage) {
      revokeBlobUrl(currentOriginalImage);
    }
    if (currentTransparentImage) {
      revokeBlobUrl(currentTransparentImage);
    }
    if (currentFinalImage) {
      revokeBlobUrl(currentFinalImage);
    }
    if (previousFinalImageRef.current) {
      revokeBlobUrl(previousFinalImageRef.current);
    }
  }, []);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      const currentOriginalImage = stateRef.current.originalImage;
      const currentTransparentImage = stateRef.current.transparentImage;
      const currentFinalImage = stateRef.current.finalImage;

      if (currentOriginalImage) {
        revokeBlobUrl(currentOriginalImage);
      }
      if (currentTransparentImage) {
        revokeBlobUrl(currentTransparentImage);
      }
      if (currentFinalImage) {
        revokeBlobUrl(currentFinalImage);
      }
      if (previousFinalImageRef.current) {
        revokeBlobUrl(previousFinalImageRef.current);
      }
    };
  }, []);

  return {
    state,
    handleFileUpload,
    updateBgColor,
    updatePhotoSize,
    handleDownload,
    handleReset,
    cleanup,
  };
};
