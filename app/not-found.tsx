import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 text-4xl font-bold mb-6">
          A
        </div>
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-gray-500 mt-3 mb-6">
          This page could not be found.
        </p>
        <Link
          href="/dashboard"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}