import { useCutoutOperations } from './hooks/useCutoutOperations';
import { WelcomeScreen } from './components/WelcomeScreen';
import { EditorWorkspace } from './components/EditorWorkspace';
import './page.css';

export const CutoutPage = () => {
  const {
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
  } = useCutoutOperations();

  if (!imageUrl && !resultImage && !hasEnteredEditor) {
    return (
      <WelcomeScreen
        onUpload={handleFileUpload}
        onPaste={handlePaste}
        fileInputRef={fileInputRef}
      />
    );
  }

  return (
    <EditorWorkspace
      imageUrl={imageUrl}
      resultImage={resultImage}
      isLoading={isLoading}
      error={error}
      onSegment={handleSegment}
      onReset={handleReset}
      onGoHome={handleGoHome}
      onDownload={handleDownload}
      onPaste={handlePaste}
      fileInputRef={fileInputRef}
      onFileUpload={handleFileUpload}
      setError={setError}
    />
  );
};
