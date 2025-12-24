'use client';

import { memo } from 'react';
import { useRouter } from 'next/navigation';

interface ExpensesCardProps {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  vendorCount: number;
}

/**
 * ExpensesCard Component
 * ----------------------
 * Displays expense summary with breakdown by category
 */
function ExpensesCard({ totalExpenses, expensesByCategory, vendorCount }: ExpensesCardProps) {
  const router = useRouter();

  const categories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 categories

  return (
    <div className="glass p-8 rounded-2xl shadow-modern mb-8 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gradient-text">💰 הוצאות עד כה</h2>
        <button
          onClick={() => router.push('/vendors')}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 text-sm"
        >
          ניהול ספקים →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Expenses */}
        <div className="p-6 bg-gradient-to-br from-green-100 to-green-200 rounded-xl border-r-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-600 text-sm font-semibold mb-1">💵 סך הכל הוצאות</h3>
              <p className="text-4xl font-bold text-green-700">
                ₪{totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-600 mt-1">{vendorCount} ספקים</p>
            </div>
            <div className="p-4 bg-white bg-opacity-50 rounded-xl">
              <span className="text-3xl">💸</span>
            </div>
          </div>
        </div>

        {/* Breakdown by Category */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 mb-3">פירוט לפי קטגוריות</h3>
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-700">{category}</span>
                  <span className="text-sm font-bold text-pink-600">₪{amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(expensesByCategory).length > 5 && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  ועוד {Object.keys(expensesByCategory).length - 5} קטגוריות
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">אין הוצאות עדיין</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ExpensesCard);

