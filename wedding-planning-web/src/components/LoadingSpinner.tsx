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
          <span className="text-5xl">💝</span>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-pink-600 mx-auto"></div>
        <p className="text-gray-600 mt-4 font-semibold">טוען...</p>
      </div>
    </div>
  );
}

