import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="mt-2 text-gray-500">Page not found.</p>
      <Link
        href="/dashboard"
        className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        Go to dashboard
      </Link>
    </main>
  )
}
