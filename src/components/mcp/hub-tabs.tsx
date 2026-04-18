"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface HubTabsProps {
  basePath: string;
}

export function HubTabs({ basePath }: HubTabsProps) {
  const pathname = usePathname();
  const tabs = [
    { id: "hub", label: "Hub", href: basePath },
    { id: "servers", label: "Servers", href: `${basePath}/servers` },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-zinc-800">
      {tabs.map((tab) => {
        const active =
          tab.id === "hub"
            ? pathname === basePath
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "rounded-t-lg px-4 py-2 text-sm",
              active
                ? "border-b-2 border-indigo-500 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
