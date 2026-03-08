import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = ({ label, className = "", ...props }: InputProps) => (
  <label style={{ display: "grid", gap: "0.4rem" }}>
    {label ? <span>{label}</span> : null}
    <input className={`app-input ${className}`.trim()} {...props} />
  </label>
);

export default Input;
