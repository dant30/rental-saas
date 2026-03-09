import type { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface SwitchProps {
  id?: string;
  name?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export interface SwitchGroupOption extends Omit<SwitchProps, "onChange" | "checked"> {
  value: string;
}

export interface SwitchGroupProps {
  options: SwitchGroupOption[];
  values?: string[];
  onChange?: (values: string[]) => void;
  className?: string;
  label?: ReactNode;
}

const Switch = ({ id, name, checked = false, onChange, label, description, disabled, error, className }: SwitchProps) => (
  <label className={cn("inline-flex items-start gap-3", disabled && "cursor-not-allowed opacity-60", className)}>
    <button
      id={id}
      name={name}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative mt-0.5 inline-flex h-6 w-11 rounded-full border border-transparent shadow-sm transition-colors",
        checked ? "bg-brand-500" : "bg-gray-300 dark:bg-slate-600",
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
    <span className="space-y-0.5">
      {label ? <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span> : null}
      {description ? <span className="block text-sm text-[color:var(--text-muted)]">{description}</span> : null}
      {error ? <span className="block text-sm text-[color:var(--danger)]">{error}</span> : null}
    </span>
  </label>
);

export const SwitchGroup = ({ options, values = [], onChange, className, label }: SwitchGroupProps) => {
  const toggle = (value: string) => {
    const next = values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
    onChange?.(next);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label ? <div className="ui-label">{label}</div> : null}
      {options.map((option) => (
        <Switch
          key={option.value}
          {...option}
          checked={values.includes(option.value)}
          onChange={() => toggle(option.value)}
        />
      ))}
    </div>
  );
};

export default Switch;

