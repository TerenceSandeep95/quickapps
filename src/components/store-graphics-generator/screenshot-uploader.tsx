import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Screenshot } from './types';

interface ScreenshotUploaderProps {
  screenshots: Screenshot[];
  onScreenshotsChange: (screenshots: Screenshot[]) => void;
  maxScreenshots?: number;
}

export function ScreenshotUploader({
  screenshots,
  onScreenshotsChange,
  maxScreenshots = 5
}: ScreenshotUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newScreenshots = acceptedFiles.slice(0, maxScreenshots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      text1: '',
      text2: ''
    }));
    onScreenshotsChange(newScreenshots);
  }, [maxScreenshots, onScreenshotsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    multiple: true,
    maxFiles: maxScreenshots
  });

  const removeScreenshot = (index: number) => {
    const newScreenshots = [...screenshots];
    URL.revokeObjectURL(newScreenshots[index].preview);
    newScreenshots.splice(index, 1);
    onScreenshotsChange(newScreenshots);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <p>
          {isDragActive
            ? 'Drop up to 5 screenshots here...'
            : 'Drag & drop up to 5 screenshots here, or click to select'}
        </p>
      </div>

      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {screenshots.map((screenshot, index) => (
            <div key={index} className="relative">
              <img
                src={screenshot.preview}
                alt={`Screenshot ${index + 1}`}
                className="w-full aspect-[9/16] object-cover rounded-lg"
              />
              <button
                onClick={() => removeScreenshot(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}