import React from 'react';
import { HexColorPicker } from 'react-colorful';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dropzone } from '../ui/dropzone';
import { BackgroundImagePreview } from '../store-graphics-generator/background-image-preview';
import { useAssetStore } from '@/store/asset-store';

interface GradientPickerProps {
  onGradientChange: (gradient: string) => void;
  gradientColors?: { color1: string; color2: string };
}

function GradientPicker({ onGradientChange, gradientColors }: GradientPickerProps) {
  const [color1, setColor1] = React.useState(gradientColors?.color1 || '#ffffff');
  const [color2, setColor2] = React.useState(gradientColors?.color2 || '#000000');
  const { setGradientColors } = useAssetStore();

  React.useEffect(() => {
    onGradientChange(`linear-gradient(45deg, ${color1}, ${color2})`);
    setGradientColors({ color1, color2 });
  }, [color1, color2, onGradientChange, setGradientColors]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Color 1</label>
        <HexColorPicker color={color1} onChange={setColor1} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Color 2</label>
        <HexColorPicker color={color2} onChange={setColor2} />
      </div>
    </div>
  );
}

interface BackgroundPickerProps {
  color: string;
  onColorChange: (color: string) => void;
  onImageUpload: (file: File) => void;
  onGradientChange: (gradient: string) => void;
  selectedType: 'color' | 'gradient' | 'image';
  onTypeChange: (type: 'color' | 'gradient' | 'image') => void;
}

export function BackgroundPicker({
  color,
  onColorChange,
  onImageUpload,
  onGradientChange,
  selectedType,
  onTypeChange,
}: BackgroundPickerProps) {
  const { gradientColors } = useAssetStore();
  const showImagePreview = selectedType === 'image' && color.startsWith('url(');

  const handleRemoveImage = () => {
    onColorChange('#ffffff');
    onTypeChange('color');
  };

  return (
    <div className="space-y-4">
      <Tabs value={selectedType} onValueChange={(value: string) => onTypeChange(value as 'color' | 'gradient' | 'image')}>
        <TabsList className="w-full">
          <TabsTrigger value="color" className="flex-1">Color</TabsTrigger>
          <TabsTrigger value="gradient" className="flex-1">Gradient</TabsTrigger>
          <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
        </TabsList>

        <TabsContent value="color">
          <div className="p-4">
            <HexColorPicker color={color} onChange={onColorChange} />
          </div>
        </TabsContent>

        <TabsContent value="gradient">
          <div className="p-4">
            <GradientPicker onGradientChange={onGradientChange} gradientColors={gradientColors} />
          </div>
        </TabsContent>

        <TabsContent value="image">
          {showImagePreview ? (
            <BackgroundImagePreview
              imageUrl={color.slice(4, -1)}
              onRemove={handleRemoveImage}
            />
          ) : (
            <Dropzone
              onFileAccepted={onImageUpload}
              className="h-40"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}