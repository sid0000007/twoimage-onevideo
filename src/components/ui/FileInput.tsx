import React, { useRef } from "react";
import { Button } from "./Button";

interface FileInputProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label?: string;
}

export function FileInput({
  onFilesSelected,
  accept = "image/jpeg,image/png,image/webp",
  multiple = true,
  disabled = false,
  label = "Choose Files",
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input value so the same file can be selected again
    e.target.value = "";
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <Button onClick={handleClick} disabled={disabled} variant="primary">
        {label}
      </Button>
    </div>
  );
}
