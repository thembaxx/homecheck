import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

export const buttonClass = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium outline-none transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:not-disabled:scale-[0.96] disabled:opacity-50",
  {
    variants: {
      tone: {
        ink: "bg-ink text-canvas",
        lemon: "bg-lemon text-ink",
        surface: "bg-surface text-ink",
        sage: "bg-sage text-ink",
        ghost: "bg-transparent text-ink",
      },
      size: {
        md: "h-12 px-5 text-base",
        sm: "h-11 px-4 text-sm",
        icon: "size-12",
      },
    },
    defaultVariants: { tone: "ink", size: "md" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonClass>;

export function Button({ className, tone, size, type = "button", ...props }: Props) {
  return <button type={type} className={cn(buttonClass({ tone, size }), className)} {...props} />;
}
