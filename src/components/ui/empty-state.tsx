import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <Icon size={48} className="text-zinc-700" />
      <p className="mt-4 text-base text-zinc-400">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 text-sm text-indigo-400 hover:text-indigo-300"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
