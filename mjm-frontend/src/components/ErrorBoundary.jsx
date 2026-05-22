import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 m-8 bg-red-50 border-2 border-red-500 rounded-xl">
          <h1 className="text-2xl font-black text-red-700 mb-4">¡Pantalla Blanca Detectada!</h1>
          <p className="text-sm font-bold text-red-600 mb-2">Se produjo un error crítico en esta vista:</p>
          <pre className="p-4 bg-white rounded border border-red-200 text-xs overflow-auto text-red-900 font-mono">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2 bg-red-600 text-white rounded font-bold"
          >
            Refrescar Página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
