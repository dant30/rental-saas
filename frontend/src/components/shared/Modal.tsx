import { PropsWithChildren } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

const Modal = ({ children, open, onClose }: PropsWithChildren<ModalProps>) => {
  if (!open) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      onClick={onClose}
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
    >
      <div className="surface-panel route-card" onClick={(event) => event.stopPropagation()} style={{ width: "min(640px, 92vw)" }}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
