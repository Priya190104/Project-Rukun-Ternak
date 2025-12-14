import React from 'react';
import { AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-lg">
          <AlertCircle className="w-12 h-12 text-red-600 mb-3" />
          <h3 className="text-lg font-bold text-red-800 mb-2">Peta tidak dapat dimuat</h3>
          <p className="text-sm text-red-700 text-center max-w-xs">
            Terjadi kesalahan saat memuat peta. Coba refresh halaman atau kembali lagi nanti.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
