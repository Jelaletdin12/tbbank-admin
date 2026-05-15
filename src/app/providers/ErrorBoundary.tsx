import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-screen items-center justify-center bg-(--bg-base)">
          <div className="text-center space-y-4">
            <h2 className="text-(--text-primary) text-xl font-semibold">Something went wrong</h2>
            <p className="text-(--text-muted)">{this.state.error?.message}</p>
            <button
              className="bg-(--brand-500) hover:bg-(--brand-600) rounded-md px-4 py-2 text-white cursor-pointer"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const pageErrorFallback = (
  <div className="flex min-h-screen items-center justify-center bg-(--bg-base)">
    <div className="text-center space-y-4">
      <h2 className="text-(--text-primary) text-xl font-semibold">Page Error</h2>
      <p className="text-(--text-muted)">An unexpected error occurred on this page.</p>
      <button
        className="bg-(--brand-500) hover:bg-(--brand-600) rounded-md px-4 py-2 text-white cursor-pointer"
        onClick={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  </div>
)

export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return <ErrorBoundary fallback={pageErrorFallback}>{children}</ErrorBoundary>
}

export function PageErrorFallback() {
  return pageErrorFallback
}
