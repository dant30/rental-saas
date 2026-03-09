import { forwardRef, useId, type ChangeEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@utils/cn";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

type SelectSize = "sm" | "md" | "lg";
type SelectVariant = "outline" | "filled" | "ghost";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onValueChange?: (value: string) => void;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-4 py-3 text-base",
};

const variantClasses: Record<SelectVariant, string> = {
  outline: "border-gray-300 bg-white/90 dark:border-slate-600 dark:bg-slate-800/90",
  filled: "border-transparent bg-slate-100/80 dark:bg-slate-700/80",
  ghost: "border-transparent bg-transparent",
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      hint,
      error,
      options = [],
      placeholder = "Select an option",
      size = "md",
      variant = "outline",
      className,
      disabled,
      required,
      value,
      onChange,
      onValueChange,
      fullWidth = true,
      startIcon,
      endIcon,
      id,
      ...selectProps
    },
    ref,
  ) => {
    const reactId = useId();
    const selectId = id || `select-${reactId}`;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    return (
      <div className={cn(fullWidth && "w-full", className)}>
        {label ? (
          <label htmlFor={selectId} className="ui-label">
            {label}
            {required ? <span className="ml-1 text-danger-500">*</span> : null}
          </label>
        ) : null}
        <div className="relative">
          {startIcon ? <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{startIcon}</div> : null}
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            required={required}
            value={value}
            onChange={handleChange}
            className={cn(
              "ui-control w-full appearance-none text-gray-900 ui-focus dark:text-gray-100",
              "shadow-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-50 dark:disabled:bg-slate-800/50",
              sizeClasses[size],
              variantClasses[variant],
              startIcon && "pl-10",
              "pr-10",
              error && "border-danger-500 focus:ring-danger-400",
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            {...selectProps}
          >
            {placeholder ? (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            ) : null}
            {options.map((option) => (
              <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {endIcon ? (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{endIcon}</div>
          ) : (
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          )}
        </div>
        {error ? <p id={errorId} className="ui-error">{error}</p> : null}
        {!error && hint ? <p id={hintId} className="ui-help">{hint}</p> : null}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
