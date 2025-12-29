'use client';

import { memo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Vendor } from '@/types';
import { exportBudgetToExcel } from '@/utils/excelExport';

interface ExpensesCardProps {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  vendorCount: number;
  vendors?: Vendor[];
  budget?: number;
}

/**
 * ExpensesCard Component
 * ----------------------
 * Displays expense summary with breakdown by category and doughnut chart
 */
function ExpensesCard({ totalExpenses, expensesByCategory, vendorCount, vendors = [], budget = 100000 }: ExpensesCardProps) {
  const router = useRouter();
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const categories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5); // Top 5 categories

  // Calculate percentages for the doughnut chart
  const total = categories.reduce((sum, [, amount]) => sum + amount, 0);
  const chartColors = ['#6D28D9', '#BE185D', '#D4AF37', '#87A878', '#7C3AED'];
  
  // Create SVG doughnut chart segments
  const createDoughnutSegments = () => {
    if (total === 0) return null;
    let cumulativePercent = 0;
    
    return categories.map(([, amount], index) => {
      const percent = (amount / total) * 100;
      const startAngle = (cumulativePercent / 100) * 360;
      const endAngle = ((cumulativePercent + percent) / 100) * 360;
      cumulativePercent += percent;
      
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);
      
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);
      
      const largeArc = percent > 50 ? 1 : 0;
      
      return (
        <path
          key={index}
          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={chartColors[index % chartColors.length]}
          opacity="0.85"
        />
      );
    });
  };

  return (
    <div className="glass p-8 rounded-2xl shadow-modern card-hover mb-8 animate-fadeIn" style={{ animationDelay: '0.25s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold gradient-text">הוצאות עד כה</h2>
        <div className="flex gap-2">
          {vendors.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="px-4 py-2 bg-[#87A878]/10 text-[#87A878] rounded-xl hover:bg-[#87A878]/20 font-semibold transition-all duration-300 text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                ייצוא תקציב
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-3 h-3 transition-transform ${showExportDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportDropdown && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-[#87A878]/20 overflow-hidden z-[10000]">
                  <div className="p-2 bg-gradient-to-r from-[#87A878] to-[#D4AF37] text-white text-center font-semibold text-sm">
                    ייצוא דוח תקציב
                  </div>
                  <button
                    onClick={() => {
                      exportBudgetToExcel(vendors, budget, 'xlsx');
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-right text-[#2D2A32] hover:bg-[#87A878]/10 transition-colors font-medium flex items-center gap-3 justify-end"
                  >
                    <span>Excel (.xlsx)</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      exportBudgetToExcel(vendors, budget, 'csv');
                      setShowExportDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-right text-[#2D2A32] hover:bg-[#87A878]/10 transition-colors font-medium border-t border-gray-100 flex items-center gap-3 justify-end"
                  >
                    <span>CSV (.csv)</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => router.push('/vendors')}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            ניהול ספקים
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Expenses with Mini Chart */}
        <div className="p-6 bg-gradient-to-br from-[#87A878]/10 to-[#D4AF37]/10 rounded-xl border border-[#87A878]/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#6B6573] text-sm font-semibold mb-1 font-sans">סך הכל הוצאות</h3>
              <p className="text-4xl font-bold text-[#6D28D9] font-serif">
                ₪{totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-[#6B6573] mt-1">{vendorCount} ספקים</p>
            </div>
            {/* Mini Doughnut Chart */}
            <div className="w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {total > 0 ? (
                  <>
                    {createDoughnutSegments()}
                    <circle cx="50" cy="50" r="25" fill="#FDFBF7" />
                  </>
                ) : (
                  <>
                    <circle cx="50" cy="50" r="40" fill="#E5E7EB" opacity="0.3" />
                    <circle cx="50" cy="50" r="25" fill="#FDFBF7" />
                  </>
                )}
              </svg>
            </div>
          </div>
        </div>

        {/* Breakdown by Category */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-lg font-serif font-bold text-[#2D2A32] mb-3">פירוט לפי קטגוריות</h3>
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map(([category, amount], index) => (
                <div key={category} className="flex items-center justify-between p-3 bg-[#FAF8F5] rounded-lg border border-[#6D28D9]/5 hover:border-[#6D28D9]/15 transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    <span className="text-sm font-semibold text-[#2D2A32] font-sans">{category}</span>
                  </div>
                  <span className="text-sm font-bold text-[#6D28D9]">₪{amount.toLocaleString()}</span>
                </div>
              ))}
              {Object.keys(expensesByCategory).length > 5 && (
                <p className="text-xs text-[#6B6573] text-center mt-2">
                  ועוד {Object.keys(expensesByCategory).length - 5} קטגוריות
                </p>
              )}
            </div>
          ) : (
            <p className="text-[#6B6573] text-sm font-sans">אין הוצאות עדיין</p>
          )}
        </div>
      </div>

      {/* Export Dropdown Overlay - closes dropdown when clicking outside */}
      {showExportDropdown && (
        <div className="fixed inset-0 z-[9999]" onClick={() => setShowExportDropdown(false)} />
      )}
    </div>
  );
}

export default memo(ExpensesCard);

