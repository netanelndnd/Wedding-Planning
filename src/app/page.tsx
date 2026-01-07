'use client';

/**
 * Landing Page
 *
 * Main entry point for the application.
 * Redirects authenticated users to dashboard.
 * Shows welcome page for unauthenticated users.
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner, Button } from '@/components/ui';

/**
 * Feature item interface
 */
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/**
 * Landing page features
 */
const features: Feature[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'ניהול משימות',
    description: 'צרו ועקבו אחר כל המשימות לחתונה שלכם, עם קטגוריות, תאריכי יעד והקצאה לבני הזוג',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'מעקב תקציב',
    description: 'הגדירו תקציב יעד ועקבו אחר ההוצאות בפועל לפי קטגוריות, עם התראות על חריגה',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'ניהול אורחים',
    description: 'נהלו את רשימת האורחים, שלחו קישור להרשמה עצמית וצפו בסטטיסטיקות ההגעה',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'תזכורות חכמות',
    description: 'קבלו תזכורות שבועיות וביום לפני משימות חשובות ישירות לאימייל',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    title: 'שיתוף קל',
    description: 'שתפו משימות בוואטסאפ וייצאו אירועים ללוח השנה בלחיצה אחת',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'דשבורד מרכזי',
    description: 'צפו במבט אחד בהתקדמות התכנון, מצב התקציב וסטטיסטיקות חשובות',
  },
];

/**
 * Landing page component
 */
export default function LandingPage(): React.ReactElement {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user?.emailVerified) {
      router.replace('/dashboard');
    }
  }, [loading, isAuthenticated, user, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is logged in but not verified, show message
  if (isAuthenticated && user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">אימות אימייל נדרש</h2>
            <p className="text-gray-600 mb-6">
              שלחנו לך אימייל לאימות. אנא בדקו את תיבת הדואר שלכם ולחצו על הקישור לאימות.
            </p>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
              fullWidth
            >
              כבר אימתתי, רענן את הדף
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        דלג לתוכן הראשי
      </a>

      {/* Header */}
      <header className="py-4 px-4 sm:px-6 lg:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="לב">💒</span>
            <span className="font-bold text-xl text-gray-900">תכנון חתונה</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              התחברות
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="sm">
                הרשמה חינם
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main id="main-content">
        {/* Hero section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              תכננו את החתונה המושלמת שלכם
              <span className="block text-pink-600 mt-2">בקלות ובהנאה</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              כל מה שאתם צריכים לתכנון החתונה במקום אחד: ניהול משימות, מעקב תקציב,
              רשימת אורחים ועוד. בחינם ובעברית.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button variant="primary" size="lg">
                  התחילו לתכנן עכשיו
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  כבר יש לי חשבון
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                הכל במקום אחד
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                כלים חכמים שיעזרו לכם לתכנן את החתונה בצורה מסודרת ויעילה
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-pink-100 text-pink-600 rounded-lg mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              מוכנים להתחיל?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              הירשמו בחינם ותתחילו לתכנן את החתונה המושלמת שלכם
            </p>
            <Link href="/signup">
              <Button variant="primary" size="lg">
                צרו חשבון חינם
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} תכנון חתונה. כל הזכויות שמורות.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/login" className="hover:text-gray-700 transition-colors">
              התחברות
            </Link>
            <Link href="/signup" className="hover:text-gray-700 transition-colors">
              הרשמה
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
