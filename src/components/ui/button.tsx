// src/components/ui/button.tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
variant: {
  default:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-900",

  primary:
    "bg-black text-white hover:bg-black/90 focus-visible:ring-black",

  destructive:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",

  outline:
    "border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50",

  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200",

  ghost:
    "bg-transparent text-gray-900 hover:bg-gray-100",

  link:
    "text-slate-900 underline-offset-4 hover:underline",
},
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    
return (
  <Comp
    className={cn(buttonVariants({ variant, size, className }))}
    ref={ref}
    disabled={asChild ? undefined : disabled || loading}
    {...props}
  >
    {asChild ? (
      children
    ) : (
      <>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </>
    )}
  </Comp>
);
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };