'use client';

/**
 * Login Page
 *
 * User authentication page with login form.
 * Includes dev dashboard in development environment.
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DevDashboard } from '@/components/dev/DevDashboard';
import { useLoginForm } from '@/hooks/useLoginForm';

/**
 * Login page component
 */
export default function LoginPage(): React.ReactElement {
  const {
    email,
    password,
    error,
    loading,
    setEmail,
    setPassword,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* App Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">תכנון חתונה</h1>
          <p className="mt-2 text-gray-600">נהל את החתונה שלך בקלות</p>
        </div>

        {/* Dev Dashboard */}
        {process.env.NODE_ENV === 'development' && (
          <DevDashboard />
        )}

        {/* Login Form Card */}
        <Card>
          <div className="space-y-6">
            <div>
              <CardTitle>התחברות</CardTitle>
              <CardDescription>
                היכנס לחשבון שלך כדי להמשיך
              </CardDescription>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <Input
                label="אימייל"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@domain.com"
                required
                autoComplete="email"
                disabled={loading}
              />

              {/* Password Input */}
              <Input
                label="סיסמה"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הזן סיסמה"
                required
                autoComplete="current-password"
                disabled={loading}
              />

              {/* Error Message */}
              {error && (
                <div
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                התחבר
              </Button>
            </form>

            {/* Links */}
            <div className="space-y-2 text-center text-sm">
              <Link
                href="/forgot-password"
                className="text-blue-600 hover:text-blue-700 hover:underline block"
              >
                שכחת סיסמה?
              </Link>
              <div className="text-gray-600">
                אין לך חשבון?{' '}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  הירשם כעת
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          באמצעות התחברות, אתה מסכים לתנאי השימוש ומדיניות הפרטיות
        </p>
      </div>
    </div>
  );
}
