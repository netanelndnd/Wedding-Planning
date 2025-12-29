'use client';

import React, { useState, useEffect } from 'react';

interface AccessibilitySettings {
  negativeColors: boolean;
  largeFont: boolean;
}

const AccessibilityMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    negativeColors: false,
    largeFont: false,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  // Apply settings to the document
  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;
    
    // Negative colors (invert)
    if (newSettings.negativeColors) {
      html.classList.add('accessibility-negative');
    } else {
      html.classList.remove('accessibility-negative');
    }
    
    // Large font
    if (newSettings.largeFont) {
      html.classList.add('accessibility-large-font');
    } else {
      html.classList.remove('accessibility-large-font');
    }
  };

  // Update settings and save to localStorage
  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  // Reset all settings
  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      negativeColors: false,
      largeFont: false,
    };
    setSettings(defaultSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(defaultSettings));
    applySettings(defaultSettings);
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        aria-label="תפריט נגישות"
        title="נגישות"
      >
        {/* Wheelchair/Accessibility Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 group-hover:scale-110 transition-transform"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm8 18h-1.5a.5.5 0 0 1-.45-.72l1.64-3.27A6.5 6.5 0 0 0 14 6.5h-1v2h1a4.5 4.5 0 0 1 4.24 6.03l-1.79 3.58a.5.5 0 0 0 .45.72H20a1 1 0 1 1 0 2zM9.5 8H7a1 1 0 0 0 0 2h2v3H7a1 1 0 0 0 0 2h2v4.5a.5.5 0 0 1-.5.5H6a1 1 0 1 0 0 2h2.5A2.5 2.5 0 0 0 11 19.5V15h1a1 1 0 0 0 0-2h-1v-3h1a1 1 0 0 0 0-2h-1.5z"/>
        </svg>
        {/* Alternative universal accessibility icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-7 h-7 group-hover:scale-110 transition-transform hidden"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 10h14M12 10v4m-3 6l3-6 3 6M9 20h6" />
        </svg>
      </button>

      {/* Accessibility Menu Panel */}
      <div
        className={`fixed bottom-24 left-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden ${
          isOpen
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        style={{ width: '280px' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            תפריט נגישות
          </h3>
          <p className="text-blue-100 text-sm mt-1">התאמות לנוחיותך</p>
        </div>

        {/* Options */}
        <div className="p-4 space-y-4">
          {/* Negative Colors Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-800 text-white rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">ניגודיות גבוהה</span>
            </div>
            <button
              onClick={() => updateSetting('negativeColors', !settings.negativeColors)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                settings.negativeColors ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label="הפעל/כבה ניגודיות גבוהה"
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                  settings.negativeColors ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Large Font Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
                </svg>
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-200">טקסט גדול</span>
            </div>
            <button
              onClick={() => updateSetting('largeFont', !settings.largeFont)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                settings.largeFont ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label="הפעל/כבה טקסט גדול"
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${
                  settings.largeFont ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full mt-2 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            איפוס הגדרות
          </button>
        </div>
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AccessibilityMenu;
