'use client';

/**
 * Toast Notification System
 *
 * Provides a context-based toast notification system with RTL support.
 * Supports success, error, warning, and info variants.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

/**
 * Toast variant types
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast position on screen
 */
export type ToastPosition = 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';

/**
 * Individual toast message
 */
export interface Toast {
  /** Unique identifier */
  id: string;
  /** Toast message */
  message: string;
  /** Visual variant */
  variant: ToastVariant;
  /** Duration in milliseconds (0 for persistent) */
  duration: number;
  /** Optional title */
  title?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast context value
 */
interface ToastContextValue {
  /** Add a new toast */
  addToast: (toast: Omit<Toast, 'id'>) => string;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
  /** Remove all toasts */
  clearToasts: () => void;
  /** Shorthand for success toast */
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) => string;
  /** Shorthand for error toast */
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) => string;
  /** Shorthand for warning toast */
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) => string;
  /** Shorthand for info toast */
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast provider props
 */
interface ToastProviderProps {
  children: React.ReactNode;
  /** Maximum number of visible toasts */
  maxToasts?: number;
  /** Default toast duration in ms */
  defaultDuration?: number;
  /** Toast position on screen */
  position?: ToastPosition;
}

/**
 * Generate unique ID for toasts
 */
const generateId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Toast Provider Component
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
  position = 'top-end',
}: ToastProviderProps): React.ReactElement {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>): string => {
      const id = generateId();
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        // Limit number of visible toasts
        return updated.slice(0, maxToasts);
      });

      return id;
    },
    [defaultDuration, maxToasts]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Shorthand methods
  const success = useCallback(
    (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'success', duration: defaultDuration, ...options }),
    [addToast, defaultDuration]
  );

  const error = useCallback(
    (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'error', duration: defaultDuration, ...options }),
    [addToast, defaultDuration]
  );

  const warning = useCallback(
    (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'warning', duration: defaultDuration, ...options }),
    [addToast, defaultDuration]
  );

  const info = useCallback(
    (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ message, variant: 'info', duration: defaultDuration, ...options }),
    [addToast, defaultDuration]
  );

  const value: ToastContextValue = {
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  // Position styles using logical properties for RTL
  const positionStyles: Record<ToastPosition, string> = {
    'top-start': 'top-4 start-4',
    'top-end': 'top-4 end-4',
    'bottom-start': 'bottom-4 start-4',
    'bottom-end': 'bottom-4 end-4',
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className={`fixed z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none ${positionStyles[position]}`}
        role="region"
        aria-label="התראות"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Toast item props
 */
interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

/**
 * Individual toast item component
 */
function ToastItem({ toast, onDismiss }: ToastItemProps): React.ReactElement {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Variant styles
  const variantStyles: Record<ToastVariant, string> = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  // Icon by variant
  const icons: Record<ToastVariant, React.ReactNode> = {
    success: (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  // Animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    if (toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(onDismiss, 300);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 300);
  };

  return (
    <div
      className={`
        pointer-events-auto
        w-full rounded-lg border shadow-lg p-4
        transition-all duration-300 ease-in-out
        ${variantStyles[toast.variant]}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0">{icons[toast.variant]}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {toast.title && (
            <p className="font-semibold text-sm mb-1">{toast.title}</p>
          )}
          <p className="text-sm">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
          aria-label="סגור התראה"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * Hook to use toast notifications
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const toast = useToast();
 *
 *   const handleSave = () => {
 *     try {
 *       // ... save logic
 *       toast.success('נשמר בהצלחה!');
 *     } catch {
 *       toast.error('שגיאה בשמירה');
 *     }
 *   };
 * }
 * ```
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
