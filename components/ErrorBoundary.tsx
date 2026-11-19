'use client';
import React from 'react';

export class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">حصلت مشكلة في تحميل الصفحة</h2>
          <button onClick={() => window.location.reload()} className="px-4 py-2 bg-sky-600 text-white rounded-lg">
            جرب تحديث الصفحة
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}