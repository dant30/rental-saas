import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const Button = ({ children, className = "", variant = "ghost", ...props }: PropsWithChildren<ButtonProps>) => (
  <button className={`app-button app-button--${variant} ${className}`.trim()} {...props}>
    {children}
  </button>
);

export default Button;
