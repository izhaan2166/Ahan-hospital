import type { ReactNode } from "react";
import { buttonStyles, type ButtonStyleProps } from "@/components/ui/button";
import { whatsappUrl, type WhatsAppContext } from "@/lib/whatsapp";
import { cn } from "@/lib/utils/cn";

type Props = ButtonStyleProps & {
  context: WhatsAppContext;
  children?: ReactNode;
  /** Render as a plain text link instead of a button. */
  plain?: boolean;
};

export function WhatsAppLink({ context, children = "Ask on WhatsApp", plain, variant = "secondary", size, className }: Props) {
  return (
    <a
      href={whatsappUrl(context)}
      target="_blank"
      rel="noopener noreferrer"
      className={plain ? cn("inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline", className) : buttonStyles({ variant, size, className })}
    >
      <WhatsAppIcon />
      <span>{children}</span>
      <span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  );
}

export function WhatsAppIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.19-.54.06a6.75 6.75 0 0 1-3.37-2.94c-.25-.44.25-.41.72-1.36.08-.16.04-.3-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74 1.58.68 2.2.74 2.99.62.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.3Z" />
    </svg>
  );
}
