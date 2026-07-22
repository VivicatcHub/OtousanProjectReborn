import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand text-brand-foreground shadow-md hover:brightness-105",
        sky: "bg-sky text-white shadow-md hover:brightness-105",
        grass: "bg-grass text-white shadow-md hover:brightness-105",
        grape: "bg-grape text-white shadow-md hover:brightness-105",
        outline:
          "border-2 border-border bg-card text-foreground hover:bg-muted",
        ghost: "hover:bg-muted text-foreground",
      },
      size: {
        default: "h-11 px-5 text-base",
        sm: "h-9 px-3 text-sm",
        lg: "h-14 px-8 text-xl",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

const Button = forwardRef(function Button(
  { className, variant, size, asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
});

export { Button, buttonVariants };
