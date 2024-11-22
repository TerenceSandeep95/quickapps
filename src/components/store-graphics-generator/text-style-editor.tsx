import React from 'react';
import { TextStyle } from './types';
import { Select } from '../ui/select';
import { HexColorPicker } from 'react-colorful';

const FONT_FAMILIES = [
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Source Sans Pro', value: 'Source Sans Pro' },
  { label: 'Ubuntu', value: 'Ubuntu' }
];

const FONT_WEIGHTS = [
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Extra Bold', value: '800' }
];

interface TextStyleEditorProps {
  textStyle: TextStyle;
  onTextStyleChange: (style: TextStyle) => void;
}

export function TextStyleEditor({
  textStyle,
  onTextStyleChange
}: TextStyleEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Font Family</label>
        <Select
          value={textStyle.fontFamily}
          onValueChange={(value) => onTextStyleChange({ ...textStyle, fontFamily: value })}
          options={FONT_FAMILIES}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Font Weight</label>
        <Select
          value={textStyle.fontWeight}
          onValueChange={(value) => onTextStyleChange({ ...textStyle, fontWeight: value })}
          options={FONT_WEIGHTS}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <HexColorPicker
          color={textStyle.color}
          onChange={(color) => onTextStyleChange({ ...textStyle, color })}
        />
      </div>
    </div>
  );
}