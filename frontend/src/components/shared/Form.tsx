import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";
import { cn } from "@utils/cn";

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  children: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

const Form = ({ children, className, onSubmit, ...props }: FormProps) => (
  <form className={cn("space-y-4", className)} onSubmit={onSubmit} {...props}>
    {children}
  </form>
);

export default Form;
