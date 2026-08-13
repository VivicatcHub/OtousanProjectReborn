import { useEffect, useRef } from "react";
import fitty from "fitty";
import { cn } from "@/lib/utils";

export function AutoText({ children, className, minSize = 4, maxSize = 128 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const fit = fitty(ref.current, { minSize, maxSize });
    return () => fit.unsubscribe();
  }, [minSize, maxSize]);

  return (
    <span ref={ref} className={cn("block whitespace-nowrap", className)}>
      {children}
    </span>
  );
}
