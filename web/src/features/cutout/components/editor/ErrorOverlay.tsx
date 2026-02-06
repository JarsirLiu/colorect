interface ErrorOverlayProps {
  error: string | null
}

export const ErrorOverlay = ({ error }: ErrorOverlayProps): JSX.Element | null => {
  if (!error) return null

  return (
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white border border-red-50 px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-3 text-red-500 font-bold text-sm">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
      </svg>
      <span>{error}</span>
    </div>
  )
}
