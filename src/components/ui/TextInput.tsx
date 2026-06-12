import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface Props {
  label: string;
  name: string;
  type?: string;
  error?: FieldError;
}
export const TextInput = forwardRef<HTMLInputElement, Props>(
  ({ label, name, type = 'text', error }, ref) => (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-neutral-100 mb-1">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        ref={ref}
        className={`
          w-full rounded-md border border-neutral-80
          px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-100
          ${error ? 'border-error' : ''}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-xs text-error">
          {error.message}
        </p>
      )}
    </div>
  ),
);
TextInput.displayName = 'TextInput';