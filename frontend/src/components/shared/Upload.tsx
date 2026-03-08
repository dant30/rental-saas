import type { ReactNode } from "react";
import FileUpload from "./FileUpload";

export interface UploadProps {
  label?: ReactNode;
  multiple?: boolean;
  acceptedTypes?: string[];
  disabled?: boolean;
  onChange?: (files: File[]) => void;
}

const Upload = ({ label, multiple, acceptedTypes, disabled, onChange }: UploadProps) => (
  <FileUpload label={label} multiple={multiple} acceptedTypes={acceptedTypes} disabled={disabled} onFilesChange={onChange} />
);

export default Upload;
