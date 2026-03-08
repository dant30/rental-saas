import { forwardRef, useId, type ChangeEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@utils/cn";

export interface RadioOption {
  label: ReactNode;
  value: string;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
}

export interface RadioGroupProps {
  name: string;
  value?: string;
  options: RadioOption[];
  onChange?: (value: string) => void;
  className?: string;
  label?: ReactNode;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, error, id, children, onChange, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || `radio-${generatedId}`;

    return (
      <label htmlFor={inputId} className="inline-flex items-start gap-3">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className={cn("mt-1 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500", className)}
          onChange={onChange}
          {...props}
        />
        <span className="space-y-0.5">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label || children}</span>
          {description ? <span className="block text-sm text-app-muted">{description}</span> : null}
          {error ? <span className="block text-sm text-danger-500">{error}</span> : null}
        </span>
      </label>
    );
  },
);

Radio.displayName = "Radio";

export const RadioGroup = ({ name, value, options, onChange, className, label }: RadioGroupProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <fieldset className={cn("space-y-3", className)}>
      {label ? <legend className="ui-label">{label}</legend> : null}
      {options.map((option) => (
        <Radio
          key={option.value}
          name={name}
          value={option.value}
          checked={value === option.value}
          disabled={option.disabled}
          onChange={handleChange}
          label={option.label}
          description={option.description}
        />
      ))}
    </fieldset>
  );
};

export default Radio;
