'use client';

/**
 * Accessibility Menu Component
 *
 * Provides accessibility controls for users with disabilities.
 * Includes options for:
 * - Font size adjustment
 * - High contrast mode
 * - Reduced motion
 * - Focus indicators
 *
 * Supports RTL layout and Hebrew text.
 * Compliant with WCAG 2.1 guidelines.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui';

/**
 * Accessibility settings state
 */
interface AccessibilitySettings {
  /** Font size multiplier (1 = default, 1.25 = large, 1.5 = extra large) */
  fontSize: number;
  /** Enable high contrast mode */
  highContrast: boolean;
  /** Reduce motion/animations */
  reducedMotion: boolean;
  /** Enhanced focus indicators */
  enhancedFocus: boolean;
  /** Dark mode */
  darkMode: boolean;
}

/**
 * Default settings
 */
const defaultSettings: AccessibilitySettings = {
  fontSize: 1,
  highContrast: false,
  reducedMotion: false,
  enhancedFocus: false,
  darkMode: false,
};

/**
 * Local storage key
 */
const STORAGE_KEY = 'wedding-planner-accessibility';

/**
 * Accessibility menu props
 */
export interface AccessibilityMenuProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Accessibility Menu Component
 *
 * @example
 * ```tsx
 * // In your layout or header
 * <AccessibilityMenu />
 * ```
 */
export function AccessibilityMenu({
  className = '',
}: AccessibilityMenuProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AccessibilitySettings;
        setSettings(parsed);
        applySettings(parsed);
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  // Apply settings to document
  const applySettings = useCallback((newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // Font size
    root.style.fontSize = `${newSettings.fontSize * 100}%`;

    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Enhanced focus
    if (newSettings.enhancedFocus) {
      root.classList.add('enhanced-focus');
    } else {
      root.classList.remove('enhanced-focus');
    }

    // Dark mode
    if (newSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  // Update and save settings
  const updateSettings = useCallback(
    (updates: Partial<AccessibilitySettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      applySettings(newSettings);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    },
    [settings, applySettings]
  );

  // Reset to defaults
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
  }, [applySettings]);

  // Font size options
  const fontSizeOptions = [
    { value: 1, label: 'רגיל' },
    { value: 1.25, label: 'גדול' },
    { value: 1.5, label: 'גדול מאוד' },
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-2 rounded-lg
          bg-gray-100 hover:bg-gray-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-colors
        "
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="פתח תפריט נגישות"
        title="נגישות"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      {/* Menu panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="
              absolute z-50
              end-0 mt-2
              w-80 max-w-[calc(100vw-2rem)]
              bg-white rounded-lg shadow-xl
              border border-gray-200
              overflow-hidden
            "
            role="dialog"
            aria-modal="true"
            aria-label="תפריט נגישות"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">הגדרות נגישות</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="סגור תפריט נגישות"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6">
              {/* Font size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  גודל טקסט
                </label>
                <div className="flex gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateSettings({ fontSize: option.value })}
                      className={`
                        flex-1 py-2 px-3 rounded-lg text-sm font-medium
                        border-2 transition-colors
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${
                          settings.fontSize === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }
                      `}
                      aria-pressed={settings.fontSize === option.value}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle options */}
              <div className="space-y-3">
                {/* High contrast */}
                <ToggleOption
                  id="high-contrast"
                  label="ניגודיות גבוהה"
                  description="הגברת ניגודיות צבעים"
                  checked={settings.highContrast}
                  onChange={(checked) => updateSettings({ highContrast: checked })}
                />

                {/* Reduced motion */}
                <ToggleOption
                  id="reduced-motion"
                  label="הפחתת תנועה"
                  description="הפחתת אנימציות ואפקטים"
                  checked={settings.reducedMotion}
                  onChange={(checked) => updateSettings({ reducedMotion: checked })}
                />

                {/* Enhanced focus */}
                <ToggleOption
                  id="enhanced-focus"
                  label="מיקוד מודגש"
                  description="הדגשת אלמנטים ממוקדים"
                  checked={settings.enhancedFocus}
                  onChange={(checked) => updateSettings({ enhancedFocus: checked })}
                />

                {/* Dark mode */}
                <ToggleOption
                  id="dark-mode"
                  label="מצב כהה"
                  description="צבעים כהים לנוחות העיניים"
                  checked={settings.darkMode}
                  onChange={(checked) => updateSettings({ darkMode: checked })}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <Button
                variant="secondary"
                size="sm"
                onClick={resetSettings}
                fullWidth
              >
                איפוס להגדרות ברירת מחדל
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Toggle option props
 */
interface ToggleOptionProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Toggle option component
 */
function ToggleOption({
  id,
  label,
  description,
  checked,
  onChange,
}: ToggleOptionProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1 me-4">
        <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer
          rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5
            transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${checked ? '-translate-x-5' : 'translate-x-0'}
          `}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

AccessibilityMenu.displayName = 'AccessibilityMenu';

export default AccessibilityMenu;
