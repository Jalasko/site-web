"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "./Icons";
import { cn } from "@/lib/utils";

export function CopyButton({ text, label = "Copier", className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button type="button" onClick={copy} className={cn(copied ? "btn bg-teal text-bg" : "btn-primary", "px-3 py-2 text-xs", className)} aria-live="polite">
      {copied ? <CheckIcon width={14} height={14} /> : <CopyIcon width={14} height={14} />}
      {copied ? "Copié !" : label}
    </button>
  );
}
