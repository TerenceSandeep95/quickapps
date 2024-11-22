import React from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  fontFamily: string;
  className?: string;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  fontFamily,
  className = ''
}: TextInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ fontFamily }}
      className={`w-full px-3 py-2 border rounded ${className}`}
    />
  );
}