'use client';

/**
 * Input Component
 *
 * Reusable text input component with label and error state support.
 * Fully RTL-compatible with logical properties.
 */

import React from 'react';

/**
 * Input component props
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Additional CSS classes for the input element */
  className?: string;
  /** Additional CSS classes for the wrapper div */
  wrapperClassName?: string;
}

/**
 * Input component with label and error state
 *
 * @example
 * ```tsx
 * <Input
 *   label="שם מלא"
 *   type="text"
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   error={errors.name}
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, className = '', wrapperClassName = '', id, ...props },
    ref
  ) => {
    // Generate unique ID unconditionally (hooks must be called in same order every render)
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;

    // Base input styles with RTL logical properties
    const baseStyles =
      'w-full rounded-lg border bg-white px-4 py-2 text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

    // State-dependent styles
    const stateStyles = error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

    // Disabled styles
    const disabledStyles = props.disabled
      ? 'bg-gray-100 cursor-not-allowed'
      : '';

    return (
      <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${stateStyles} ${disabledStyles} ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
