"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leftIcon, rightIcon, invalid, ...props },
  ref,
) {
  return (
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle pointer-events-none">
          {leftIcon}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full h-11 rounded-xl bg-surface/60 border border-border px-4 text-sm text-fg placeholder:text-fg-subtle",
          "transition-colors duration-200",
          "focus:outline-none focus:border-brand-violet/70 focus:bg-surface focus:ring-2 focus:ring-brand-violet/20",
          "disabled:opacity-50",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          invalid && "border-brand-rose/60 focus:border-brand-rose focus:ring-brand-rose/20",
          className,
        )}
        {...props}
      />
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle">
          {rightIcon}
        </span>
      )}
    </div>
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[100px] rounded-xl bg-surface/60 border border-border px-4 py-3 text-sm text-fg placeholder:text-fg-subtle leading-relaxed resize-y",
        "transition-colors duration-200",
        "focus:outline-none focus:border-brand-violet/70 focus:bg-surface focus:ring-2 focus:ring-brand-violet/20",
        invalid && "border-brand-rose/60 focus:border-brand-rose focus:ring-brand-rose/20",
        className,
      )}
      {...props}
    />
  );
});

export function Label({
  children,
  htmlFor,
  required,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("block text-sm font-medium text-fg-muted mb-1.5", className)}
    >
      {children}
      {required && <span className="text-brand-rose ml-0.5">*</span>}
    </label>
  );
}
