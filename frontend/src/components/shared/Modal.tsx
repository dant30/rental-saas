import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@utils/cn";

type ModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  visible?: boolean;
  onClose?: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  size?: ModalSize;
  className?: string;
  showCloseButton?: boolean;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export interface ModalSectionProps {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

const ModalBase = ({ open, isOpen, visible, onClose, title, description, children, size = "md", className, showCloseButton = true }: ModalProps) => {
  const active = open ?? isOpen ?? visible ?? false;
  if (!active) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className={cn("w-full rounded-2xl bg-white shadow-hard dark:bg-slate-900", sizeClasses[size], className)}>
        {(title || description || showCloseButton) ? (
          <div className="flex items-start justify-between border-b px-6 py-4 dark:border-slate-700">
            <div>
              {title ? <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">{title}</h3> : null}
              {description ? <p className="mt-1 text-sm text-[color:var(--text-muted)]">{description}</p> : null}
            </div>
            {showCloseButton ? (
              <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-slate-800" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const ModalFooter = ({ children, className }: ModalFooterProps) => (
  <div className={cn("mt-6 flex justify-end gap-3", className)}>{children}</div>
);

export const ModalSection = ({ children, title, className }: ModalSectionProps) => (
  <section className={cn("space-y-3", className)}>
    {title ? <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">{title}</h4> : null}
    {children}
  </section>
);

export interface ConfirmationModalProps extends ModalProps {
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal = ({
  onConfirm,
  onClose,
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
  ...props
}: ConfirmationModalProps) => (
  <ModalBase onClose={onClose} {...props}>
    {children}
    <ModalFooter>
      <button type="button" className="btn btn-secondary" onClick={onClose}>
        {cancelText}
      </button>
      <button type="button" className="btn btn-primary" onClick={onConfirm}>
        {confirmText}
      </button>
    </ModalFooter>
  </ModalBase>
);

type ModalCompound = typeof ModalBase & {
  Footer: typeof ModalFooter;
  Section: typeof ModalSection;
};

const Modal = ModalBase as ModalCompound;
Modal.Footer = ModalFooter;
Modal.Section = ModalSection;

export default Modal;

