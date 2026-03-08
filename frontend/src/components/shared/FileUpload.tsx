import type { ChangeEvent, ReactNode } from "react";
import Button from "./Button";

export interface FileUploadProps {
  label?: ReactNode;
  multiple?: boolean;
  acceptedTypes?: string[];
  disabled?: boolean;
  onFilesChange?: (files: File[]) => void;
}

const FileUpload = ({ label = "Upload files", multiple = false, acceptedTypes, disabled, onFilesChange }: FileUploadProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilesChange?.(Array.from(event.target.files ?? []));
  };

  return (
    <label className="flex flex-col gap-2">
      <span className="ui-label">{label}</span>
      <input
        type="file"
        multiple={multiple}
        disabled={disabled}
        accept={acceptedTypes?.join(",")}
        onChange={handleChange}
        className="hidden"
      />
      <Button type="button" variant="outline" disabled={disabled}>
        Choose file
      </Button>
    </label>
  );
};

export default FileUpload;
