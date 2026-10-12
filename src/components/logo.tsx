import { cn } from "@/lib/cn";

export function Mark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-9", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-lemon" />
      <path fill="currentColor" d="M16 5.2 5.2 14.6V27h21.6V14.6Z" />
      <path
        d="M10.2 17.2 14.4 21.4 22.2 13.4"
        fill="none"
        stroke="#f3f0e8"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
