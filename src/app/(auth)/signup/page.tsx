'use client';

/**
 * Signup Page
 *
 * User registration page with email verification flow.
 * Shows success message after email verification is sent.
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSignupForm } from '@/hooks/useSignupForm';

/**
 * Signup page component
 */
export default function SignupPage(): React.ReactElement {
  const {
    email,
    password,
    confirmPassword,
    error,
    loading,
    emailSent,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleSubmit,
  } = useSignupForm();

  // Show success message after email verification is sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <div className="space-y-6 text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">✓</span>
              </div>

              {/* Success Message */}
              <div>
                <CardTitle className="text-green-700">
                  ההרשמה הושלמה בהצלחה!
                </CardTitle>
                <CardDescription className="mt-2">
                  נשלח אימייל אימות לכתובת:
                </CardDescription>
                <p className="mt-1 font-medium text-gray-900">{email}</p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">שלבים הבאים:</p>
                <ol className="list-decimal list-inside space-y-1 text-start">
                  <li>פתח את תיבת האימייל שלך</li>
                  <li>חפש אימייל מ-Wedding Planning</li>
                  <li>לחץ על קישור האימות באימייל</li>
                  <li>חזור לדף זה והתחבר</li>
                </ol>
              </div>

              {/* Back to Login */}
              <Link href="/login">
                <Button variant="primary" fullWidth>
                  חזור להתחברות
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show signup form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* App Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">תכנון חתונה</h1>
          <p className="mt-2 text-gray-600">התחל לתכנן את החתונה שלך</p>
        </div>

        {/* Signup Form Card */}
        <Card>
          <div className="space-y-6">
            <div>
              <CardTitle>הרשמה</CardTitle>
              <CardDescription>
                צור חשבון חדש כדי להתחיל
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
                placeholder="לפחות 6 תווים"
                required
                autoComplete="new-password"
                disabled={loading}
              />

              {/* Confirm Password Input */}
              <Input
                label="אימות סיסמה"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הזן את הסיסמה שוב"
                required
                autoComplete="new-password"
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
                הירשם
              </Button>
            </form>

            {/* Links */}
            <div className="text-center text-sm text-gray-600">
              כבר יש לך חשבון?{' '}
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                התחבר כאן
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          באמצעות הרשמה, אתה מסכים לתנאי השימוש ומדיניות הפרטיות
        </p>
      </div>
    </div>
  );
}
