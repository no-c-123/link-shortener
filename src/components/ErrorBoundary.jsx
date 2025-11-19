import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-black to-gray-900 text-white px-4">
                    <div className="bg-zinc-800 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                        <h1 className="text-3xl font-bold mb-4 text-red-500">Something went wrong</h1>
                        <p className="text-gray-400 mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => {
                                    this.setState({ hasError: false, error: null });
                                    window.location.href = '/';
                                }}
                                className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-full transition w-full"
                            >
                                Go to Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full transition w-full"
                            >
                                Refresh Page
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                                <pre className="mt-2 text-xs bg-gray-900 p-2 rounded overflow-auto">
                                    {this.state.error.toString()}
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

