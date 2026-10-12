import React from "react";

interface SkeletonProps {
  variant?: "line" | "block";
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({
  variant = "line",
  width,
  height,
  className = "",
}: SkeletonProps) {
  const defaults =
    variant === "line"
      ? { width: width ?? "100%", height: height ?? "20px" }
      : { width: width ?? "100%", height: height ?? "120px" };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`skeleton-pulse bg-[var(--sunken)] rounded-[var(--radius-field)] ${className}`}
      style={{ width: defaults.width, height: defaults.height }}
    />
  );
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="line"
          width={i === lines - 1 ? "60%" : "100%"}
        />
      ))}
    </div>
  );
}
