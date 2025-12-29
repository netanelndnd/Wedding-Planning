/**
 * LoadingSpinner Component
 * ----------------------
 * Reusable loading spinner for better UX
 */

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="text-center">
        <div className="inline-block p-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg mb-4 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-600 mx-auto"></div>
        <p className="text-gray-600 mt-4 font-semibold">טוען...</p>
      </div>
    </div>
  );
}

