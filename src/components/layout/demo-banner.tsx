"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const storageKey = "leadpilot-demo-banner-dismissed";

export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="flex h-9 items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-medium text-white">
      <span className="flex-1 text-center">
        🚀 LeadPilot AI — Demo Mode with Simulated Data
      </span>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(storageKey, "true");
          setVisible(false);
        }}
        className="text-white/70 hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}
