import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-border bg-card text-card-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-1 p-5", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-xl font-extrabold", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
