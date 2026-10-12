import React from "react";

type ButtonVariant = "primary" | "secondary" | "quiet";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  asChild?: boolean;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  children,
  asChild,
  className = "",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 text-ui font-medium rounded-[var(--radius-field)] transition-colors cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--cobalt)] disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-[var(--cobalt)] text-white hover:bg-[var(--cobalt-press)] active:bg-[var(--cobalt-press)]",
    secondary:
      "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--sunken)] active:bg-[var(--sunken)]",
    quiet:
      "bg-transparent text-[var(--cobalt)] hover:bg-[var(--cobalt-wash)] active:bg-[var(--cobalt-wash)]",
  };

  const combinedClass = `${base} ${variants[variant]} ${className}`;

  // When asChild is true, clone the single child element and apply button styles to it
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
      className: `${combinedClass} ${(children as React.ReactElement<{ className?: string }>).props.className ?? ""}`,
    });
  }

  return (
    <button
      className={combinedClass}
      disabled={isDisabled}
      aria-busy={loading}
      style={{ transition: `background-color var(--duration-fast) var(--ease-out)` }}
      {...props}
    >
      {loading ? (
        <>
          <Spinner />
          Working
        </>
      ) : (
        children
      )}
    </button>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
