import { useEffect } from "react";
import { useUiStore } from "@/lib/store/ui-store";

export function useKeyboardShortcuts() {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const toggleSearchOpen = useUiStore((state) => state.toggleSearchOpen);
  const setSearchOpen = useUiStore((state) => state.setSearchOpen);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isMod = event.metaKey || event.ctrlKey;

      if (isMod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleSearchOpen();
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        const closeEvent = new CustomEvent("leadpilot:close-overlays");
        window.dispatchEvent(closeEvent);
      }

      if (event.key === "/" && !isMod) {
        const input = document.querySelector<HTMLInputElement>(
          "[data-copilot-input]"
        );
        if (input) {
          event.preventDefault();
          input.focus();
        }
      }

      if (isMod && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setSearchOpen, toggleSearchOpen, toggleSidebar]);
}
