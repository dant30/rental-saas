import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@utils/cn";

type InputSize = "sm" | "md" | "lg";
type InputVariant = "outline" | "filled" | "ghost";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "size"> {
  label?: string;
  hint?: string;
  error?: string;
  size?: InputSize;
  variant?: InputVariant;
  fullWidth?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  action?: ReactNode;
  containerClassName?: string;
  onPressEnter?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-9 text-sm",
  md: "h-10 text-sm",
  lg: "h-12 text-base",
};

const variantClasses: Record<InputVariant, string> = {
  outline: "border-gray-300 bg-white dark:border-slate-600 dark:bg-slate-800",
  filled: "border-transparent bg-gray-50 dark:bg-slate-700",
  ghost: "border-transparent bg-transparent",
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      size = "md",
      variant = "outline",
      fullWidth = true,
      prefix,
      suffix,
      action,
      className,
      containerClassName,
      disabled,
      id,
      type = "text",
      onPressEnter,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id || `input-${reactId}`;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (onPressEnter && event.key === "Enter") {
        onPressEnter(event);
      }
    };

    return (
      <div className={cn(fullWidth && "w-full", containerClassName)}>
        {label ? (
          <label htmlFor={inputId} className="ui-label">
            {label}
          </label>
        ) : null}
        <div
          className={cn(
            "ui-control relative flex items-center focus-within:border-transparent focus-within:ring-2 focus-within:ring-primary-500",
            variantClasses[variant],
            error && "border-danger-500 focus-within:ring-danger-500",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          {prefix ? <span className="flex items-center pl-3 text-gray-400">{prefix}</span> : null}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={describedBy}
            className={cn(
              "w-full bg-transparent outline-none placeholder-gray-400 dark:text-white dark:placeholder-gray-500",
              "text-gray-900",
              sizeClasses[size],
              prefix ? "pl-2" : "pl-3",
              suffix || action ? "pr-2" : "pr-3",
              className,
            )}
            onKeyDown={handleKeyDown}
            {...props}
          />
          {suffix ? <span className="flex items-center pr-3 text-gray-400">{suffix}</span> : null}
          {action ? <span className="flex items-center pr-2">{action}</span> : null}
        </div>
        {error ? (
          <p id={errorId} className="ui-error">
            {error}
          </p>
        ) : null}
        {!error && hint ? (
          <p id={hintId} className="ui-help">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "suffix">>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        suffix={
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        }
        {...props}
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export const SearchInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => (
  <Input ref={ref} placeholder="Search..." {...props} />
));

SearchInput.displayName = "SearchInput";

export default Input;
