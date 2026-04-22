import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', fontFamily: 'monospace', background: '#0f0f0f', color: '#ff6b6b', minHeight: '100vh' }}>
          <h1 style={{ color: '#fff', marginBottom: '8px' }}>🔴 Runtime Crash Detected</h1>
          <p style={{ color: '#aaa', marginBottom: '24px' }}>The application crashed on render. Error details below:</p>
          <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', border: '1px solid #ff6b6b33' }}>
            <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: '13px' }}>
              {String(this.state.error?.message || this.state.error)}
              {this.state.error?.stack ? '\n\nStack Trace:\n' + this.state.error.stack : ''}
            </pre>
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '24px', background: '#ff6b6b', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Clear Storage &amp; Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
