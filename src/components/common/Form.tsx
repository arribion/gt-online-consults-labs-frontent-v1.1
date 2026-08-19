import { useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types";

const controlClass =
  "w-full rounded-lg border border-line bg-ink2/70 px-3 py-2.5 text-sm text-frost placeholder:text-dim transition-colors focus:border-azure focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
  htmlFor,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-mist">
        {label}
        {required && <span className="ml-0.5 text-bad">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-bad">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-dim">{hint}</p>
      )}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
};

export function TextField({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  ...props
}: TextFieldProps) {
  const id = useId();
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={id}
      className={wrapperClassName}
    >
      <input
        id={id}
        aria-invalid={!!error}
        className={cn(controlClass, error && "border-bad", className)}
        {...props}
      />
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  options,
  placeholder,
  wrapperClassName,
  className,
  ...props
}: Omit<InputHTMLAttributes<HTMLSelectElement>, "size"> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  wrapperClassName?: string;
}) {
  const id = useId();
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={id}
      className={wrapperClassName}
    >
      <select
        id={id}
        aria-invalid={!!error}
        className={cn(controlClass, error && "border-bad", className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function TextareaField({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
}) {
  const id = useId();
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={props.required}
      htmlFor={id}
      className={wrapperClassName}
    >
      <textarea
        id={id}
        rows={props.rows ?? 3}
        aria-invalid={!!error}
        className={cn(controlClass, "resize-y", error && "border-bad", className)}
        {...props}
      />
    </Field>
  );
}

/** Two-column on tablet and up, single column on a phone. */
export function FormGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

/** Actions stack full-width on a phone so the primary action is easy to hit. */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">
      {children}
    </div>
  );
}
