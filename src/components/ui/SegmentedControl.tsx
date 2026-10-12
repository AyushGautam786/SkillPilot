import React, { useId } from "react";

interface Option<T extends string | number> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SegmentedControlProps<T extends string | number> {
  name?: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  label?: string;
  className?: string;
}

export function SegmentedControl<T extends string | number>({
  name,
  value,
  onChange,
  options,
  label,
  className = "",
}: SegmentedControlProps<T>) {
  const id = useId();
  const groupName = name ?? id;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`flex flex-wrap gap-1 ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const inputId = `${groupName}-${option.value}`;

        return (
          <label
            key={String(option.value)}
            htmlFor={inputId}
            className={`
              relative flex items-center justify-center min-h-[44px] px-4 py-2 
              text-ui font-medium rounded-[var(--radius-pill)] cursor-pointer
              transition-colors select-none
              focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--cobalt)]
              ${isSelected
                ? "bg-[var(--cobalt)] text-white"
                : option.disabled
                  ? "bg-[var(--sunken)] text-[var(--ink-soft)] cursor-not-allowed opacity-50"
                  : "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--sunken)]"
              }
            `}
            style={{ transition: `background-color var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out)` }}
          >
            <input
              type="radio"
              id={inputId}
              name={groupName}
              value={String(option.value)}
              checked={isSelected}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="sr-only"
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  const currentIndex = options.findIndex((o) => o.value === value);
                  let nextIndex =
                    e.key === "ArrowRight"
                      ? (currentIndex + 1) % options.length
                      : (currentIndex - 1 + options.length) % options.length;
                  while (options[nextIndex]?.disabled && nextIndex !== currentIndex) {
                    nextIndex =
                      e.key === "ArrowRight"
                        ? (nextIndex + 1) % options.length
                        : (nextIndex - 1 + options.length) % options.length;
                  }
                  if (!options[nextIndex]?.disabled) {
                    onChange(options[nextIndex].value);
                    document.getElementById(`${groupName}-${options[nextIndex].value}`)?.focus();
                  }
                }
              }}
            />
            {option.label}
          </label>
        );
      })}
    </div>
  );
}
