"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/Skeleton";

interface DiagramProps {
  source: string;
  caption: string;
}

let mermaidInitialized = false;

export function Diagram({ source, caption }: DiagramProps) {
  const id = useId().replace(/:/g, "-");
  const containerId = `diagram-${id}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [errorSource, setErrorSource] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;

        if (!mermaidInitialized) {
          const root = document.documentElement;
          const cs = getComputedStyle(root);
          const cobaltWash = cs.getPropertyValue("--cobalt-wash").trim();
          const cobalt = cs.getPropertyValue("--cobalt").trim();
          const ink = cs.getPropertyValue("--ink").trim();
          const inkSoft = cs.getPropertyValue("--ink-soft").trim();
          const fontFamily = cs.getPropertyValue("--font-schibsted").trim() || "system-ui, sans-serif";

          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme: "base",
            themeVariables: {
              primaryColor: cobaltWash,
              primaryBorderColor: cobalt,
              primaryTextColor: ink,
              lineColor: inkSoft,
              fontFamily: fontFamily,
              fontSize: "15px",
            },
          });
          mermaidInitialized = true;
        }

        const { svg } = await mermaid.render(containerId, source);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setStatus("done");
        }
      } catch {
        if (!cancelled) {
          setErrorSource(source);
          setStatus("error");
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [source, containerId]);

  if (status === "error") {
    return (
      <div
        role="img"
        aria-label={caption}
        className="flex flex-col gap-2"
      >
        <p className="text-small text-[var(--ink-soft)]">
          The diagram could not be drawn. Here is its text version.
        </p>
        <pre
          className="text-code bg-[var(--sunken)] rounded-[var(--radius-field)] p-4 overflow-x-auto whitespace-pre-wrap text-[var(--ink-soft)]"
        >
          {errorSource}
        </pre>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={caption}
      className="relative"
    >
      {status === "loading" && (
        <Skeleton variant="block" height="200px" className="w-full" />
      )}
      <div
        ref={containerRef}
        id={containerId}
        className="overflow-x-auto"
        style={{ display: status === "done" ? "block" : "none" }}
      />
    </div>
  );
}
