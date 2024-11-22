import React from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  className
}: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        "w-full px-3 py-2 border rounded bg-background text-foreground",
        className
      )}
      style={{ fontFamily: value }}
    >
      {options.map((option) => (
        <option 
          key={option.value} 
          value={option.value}
          style={{ fontFamily: option.value }}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}