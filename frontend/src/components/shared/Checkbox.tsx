import { forwardRef, useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@utils/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, disabled, id, checked, onCheckedChange, onChange, required, children, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `checkbox-${generatedId}`;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={inputId}
          className={cn("group inline-flex items-start gap-3 select-none", disabled && "cursor-not-allowed opacity-60")}
        >
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : description ? descriptionId : undefined}
            className={cn(
              "mt-1 h-4 w-4 rounded border-gray-300 text-brand-500 shadow-sm transition-colors focus:ring-brand-500",
              className,
            )}
            onChange={handleChange}
            {...props}
          />
          {(label || description || children) ? (
            <span className="space-y-0.5">
              {(label || children) ? (
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {label || children}
                  {required ? <span className="ml-1 text-danger-500">*</span> : null}
                </span>
              ) : null}
              {description ? (
                <span id={descriptionId} className="block text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </span>
              ) : null}
            </span>
          ) : null}
        </label>
        {error ? (
          <p id={errorId} className="ui-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

