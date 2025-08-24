import React from 'react';
import { AlertTriangle, RefreshCcw, Home, Copy } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  copyErrorToClipboard = () => {
    try {
      const errorInfo = `Chaupar Application Error:
Error: ${this.state.error?.toString() || 'Unknown error'}
Component Stack: ${this.state.errorInfo?.componentStack || 'Not available'}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}`;
      
      navigator.clipboard.writeText(errorInfo).then(() => {
        // Add visual feedback
        const button = document.querySelector('.copy-error-btn');
        if (button) {
          const originalText = button.textContent;
          button.textContent = 'Copied!';
          setTimeout(() => {
            button.textContent = originalText;
          }, 2000);
        }
      }).catch(err => {
        console.error('Failed to copy error to clipboard:', err);
        // Fallback: select the error text
        const errorElement = document.querySelector('.error-stack');
        if (errorElement) {
          const range = document.createRange();
          range.selectNode(errorElement);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
        }
      });
    } catch (err) {
      console.error('Copy to clipboard failed:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <div className="error-content">
            <div className="error-icon">
              <AlertTriangle size={64} color="#ef4444" />
            </div>
            
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry, but something unexpected happened. Please try again.</p>
            
            <div className="error-actions">
              <button 
                className="btn btn-primary"
                onClick={this.handleRetry}
              >
                <RefreshCcw size={20} />
                Try Again
              </button>
              
              <button 
                className="btn btn-secondary copy-error-btn"
                onClick={this.copyErrorToClipboard}
              >
                <Copy size={20} />
                Copy Error
              </button>
              
              <button 
                className="btn btn-secondary"
                onClick={this.handleGoHome}
              >
                <Home size={20} />
                Go Home
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre className="error-stack">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
