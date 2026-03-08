import { useEffect } from "react";
import { useToast } from "@contexts/ToastContext";

type ToastTone = "info" | "success" | "warning" | "danger";

export interface ToastProps {
  message: string;
  tone?: ToastTone;
}

const Toast = ({ message, tone = "info" }: ToastProps) => {
  const { pushToast } = useToast();

  useEffect(() => {
    pushToast(message, tone);
  }, [message, pushToast, tone]);

  return null;
};

export default Toast;
