import { useEffect, useState } from "react";

export function useLoadingDelay(ms: number = 600) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), ms);
    return () => clearTimeout(timer);
  }, [ms]);

  return isLoading;
}
