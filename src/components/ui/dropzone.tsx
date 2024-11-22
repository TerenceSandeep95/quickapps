import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface DropzoneProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileAccepted: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  specification?: string;
}

export function Dropzone({
  onFileAccepted,
  className,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg']
  },
  maxSize = 5242880, // 5MB
  specification,
  ...props
}: DropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileAccepted(acceptedFiles[0]);
    }
  }, [onFileAccepted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer',
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300',
          className
        )}
        {...props}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the file here...</p>
        ) : (
          <p>Drag & drop an image here, or click to select</p>
        )}
      </div>
      {specification && (
        <p className="text-sm text-gray-500 text-center">{specification}</p>
      )}
    </div>
  );
}