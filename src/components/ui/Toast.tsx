"use client";

import React, { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

interface ToastMessage {
  id: string;
  message: string;
  variant: "success" | "error";
}

// Singleton toast manager
type ToastListener = (toast: ToastMessage | null) => void;
const listeners: Set<ToastListener> = new Set();
const emptySubscribe = () => () => {};

let currentToast: ToastMessage | null = null;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(message: string, variant: "success" | "error" = "success") {
  if (dismissTimer) clearTimeout(dismissTimer);
  currentToast = { id: Math.random().toString(36).slice(2), message, variant };
  listeners.forEach((l) => l(currentToast));
  if (variant === "success") {
    dismissTimer = setTimeout(() => {
      currentToast = null;
      listeners.forEach((l) => l(null));
    }, 4000);
  }
}

export function ToastProvider() {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [visible, setVisible] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const listener: ToastListener = (t) => {
      if (t) {
        setToast(t);
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (dismissTimer) clearTimeout(dismissTimer);
    currentToast = null;
    setVisible(false);
    listeners.forEach((l) => l(null));
  }, []);

  if (!mounted || !toast) return null;

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed bottom-6 left-6 z-50 flex items-center gap-3
        min-w-[240px] max-w-[360px] px-4 py-3
        bg-[var(--ink)] text-white text-ui
        rounded-[var(--radius-panel)] shadow-lg
        transition-all
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
      `}
      style={{ transition: `opacity var(--duration-base) var(--ease-out), transform var(--duration-base) var(--ease-out)` }}
    >
      {toast.variant === "success" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="var(--teal)" />
          <path d="M5 8l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="7" fill="var(--brick)" />
          <path d="M8 5v3M8 11h.01" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      <span className="flex-1">{toast.message}</span>
      {toast.variant === "error" && (
        <button
          onClick={dismiss}
          aria-label="Dismiss notification"
          className="ml-2 text-white opacity-70 hover:opacity-100 cursor-pointer"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>,
    document.body
  );
}
