import React from 'react'
import ReactDOM from 'react-dom/client'
import TodoRPG from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#0f0c18',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'sans-serif',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#f87171', marginBottom: '8px' }}>앱 오류가 발생했습니다</h2>
          <p style={{ color: '#9ca3af', marginBottom: '24px', fontSize: '14px' }}>
            {this.state.error?.message || '알 수 없는 오류'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <TodoRPG />
    </ErrorBoundary>
  </React.StrictMode>
)
