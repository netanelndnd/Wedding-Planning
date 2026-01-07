'use client';

/**
 * Forgot Password Page
 *
 * Password reset request page.
 * Sends password reset email to the user.
 */

import React from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForgotPassword } from '@/hooks/useForgotPassword';

/**
 * Forgot password page component
 */
export default function ForgotPasswordPage(): React.ReactElement {
  const {
    email,
    error,
    loading,
    emailSent,
    setEmail,
    handleSubmit,
    resetForm,
  } = useForgotPassword();

  // Show success message after reset email is sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card>
            <div className="space-y-6 text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📧</span>
              </div>

              {/* Success Message */}
              <div>
                <CardTitle className="text-blue-700">
                  אימייל נשלח בהצלחה!
                </CardTitle>
                <CardDescription className="mt-2">
                  נשלח קישור לאיפוס סיסמה לכתובת:
                </CardDescription>
                <p className="mt-1 font-medium text-gray-900">{email}</p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <p className="font-semibold mb-2">שלבים הבאים:</p>
                <ol className="list-decimal list-inside space-y-1 text-start">
                  <li>פתח את תיבת האימייל שלך</li>
                  <li>חפש אימייל מ-Wedding Planning</li>
                  <li>לחץ על קישור איפוס הסיסמה</li>
                  <li>בחר סיסמה חדשה</li>
                  <li>התחבר עם הסיסמה החדשה</li>
                </ol>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Link href="/login">
                  <Button variant="primary" fullWidth>
                    חזור להתחברות
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={resetForm}
                >
                  שלח שוב
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show forgot password form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* App Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">תכנון חתונה</h1>
          <p className="mt-2 text-gray-600">איפוס סיסמה</p>
        </div>

        {/* Forgot Password Form Card */}
        <Card>
          <div className="space-y-6">
            <div>
              <CardTitle>שכחת סיסמה?</CardTitle>
              <CardDescription>
                הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס סיסמה
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
                שלח קישור לאיפוס סיסמה
              </Button>
            </form>

            {/* Links */}
            <div className="text-center text-sm">
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                חזור להתחברות
              </Link>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          לא קיבלת אימייל? בדוק את תיקיית הספאם או נסה שוב
        </p>
      </div>
    </div>
  );
}
