import { useToast } from "@contexts/ToastContext";

type Tone = "info" | "success" | "warning" | "danger";

const useMessageApi = () => {
  const { pushToast } = useToast();

  return {
    open: (message: string, tone: Tone = "info") => pushToast(message, tone),
    info: (message: string) => pushToast(message, "info"),
    success: (message: string) => pushToast(message, "success"),
    warning: (message: string) => pushToast(message, "warning"),
    error: (message: string) => pushToast(message, "danger"),
  };
};

const message = {
  info: (text: string) => console.info(text),
  success: (text: string) => console.info(text),
  warning: (text: string) => console.warn(text),
  error: (text: string) => console.error(text),
};

export { useMessageApi };
export default message;
