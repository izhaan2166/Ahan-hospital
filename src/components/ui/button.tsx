import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "light" | "dawn" | "outlineLight" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 min-h-11 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900",
  secondary: "border border-line-strong bg-surface text-ink hover:border-teal-700 hover:text-teal-800",
  ghost: "text-teal-800 hover:bg-teal-50",
  light: "bg-white text-teal-900 hover:bg-dawn-50",
  /** Main call to action on dark teal surfaces. */
  dawn: "bg-dawn-500 text-teal-950 hover:bg-dawn-300 active:bg-dawn-300",
  /** Secondary action on dark teal surfaces. */
  outlineLight: "border border-white/35 text-white hover:border-white hover:bg-white/5",
  /** Emergency calls only. */
  danger: "bg-danger text-white hover:bg-[#931c13]",
};

const sizes: Record<Size, string> = {
  md: "px-5 py-2.5 text-[0.95rem]",
  lg: "px-7 py-3.5 text-base",
};

export type ButtonStyleProps = { variant?: Variant; size?: Size; className?: string };

export function buttonStyles({ variant = "primary", size = "md", className }: ButtonStyleProps = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

export type ButtonProps = ComponentProps<"button"> & ButtonStyleProps;

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}

export type ButtonLinkProps = ComponentProps<typeof Link> & ButtonStyleProps;

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonStyles({ variant, size, className })} {...props} />;
}
