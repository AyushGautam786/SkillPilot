import React, { useId } from "react";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export function TextField({
  label,
  helperText,
  error,
  id: propId,
  className = "",
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const id = propId ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  const describedBy = [
    helperText ? helperId : null,
    error ? errorId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="text-ui text-[var(--ink)] font-medium">
        {label}
      </label>

      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        className={`
          w-full min-h-[44px] px-3 py-2 
          text-ui text-[var(--ink)]
          bg-[var(--surface)] border rounded-[var(--radius-field)]
          transition-colors
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-[var(--brick)]" : "border-[var(--line)] hover:border-[var(--ink-soft)] focus:border-[var(--cobalt)]"}
        `}
        style={{ transition: `border-color var(--duration-fast) var(--ease-out)` }}
        {...props}
      />

      {helperText && !error && (
        <p id={helperId} className="text-small text-[var(--ink-soft)]">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-small text-[var(--brick)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
