import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white p-4">
            <h1 className="text-9xl font-bold text-blue-mid mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
            <p className="text-grey mb-8">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
                to="/"
                className="px-6 py-2 bg-blue-mid rounded-lg hover:bg-blue-light transition-colors"
            >
                Return to Homepage
            </Link>
        </div>
    );
}
