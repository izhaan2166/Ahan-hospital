import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type FieldControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
  "aria-required": boolean | undefined;
};

type FieldProps = {
  label: string;
  /** Extra help shown under the label. */
  hint?: string;
  error?: string;
  required?: boolean;
  /** Fixed id, so other elements (like an error summary) can link to it. */
  id?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

/**
 * Wires a label, hint and error message to one form control. The caller
 * renders the control itself so any native element can be used.
 */
export function Field({ label, hint, error, required, id, className, children }: FieldProps) {
  const autoId = useId();
  const controlId = id ?? autoId;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = `${controlId}-error`;
  const describedBy = [hintId, error ? errorId : undefined].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={controlId} className="text-sm font-semibold text-ink">
        {label}
        <span className="font-normal text-ink-faint">{required ? " (required)" : " (optional)"}</span>
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      {children({
        id: controlId,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-danger">
      <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-4a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}
