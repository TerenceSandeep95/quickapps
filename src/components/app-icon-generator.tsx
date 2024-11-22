import { useEffect, useRef } from 'react';
import { Dropzone } from './ui/dropzone';
import { removeAlphaChannel } from '@/lib/utils';
import { BackgroundPicker } from './splash-screen-generator/background-picker';
import { useAssetStore } from '@/store/asset-store';
import { Button } from './ui/button';

interface IconPreviewProps {
  logo: string;
  size: number;
  removeAlpha?: boolean;
}

function IconPreview({ logo, size, removeAlpha = false }: IconPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = logo;
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      if (removeAlpha) {
        removeAlphaChannel(canvas);
      }
    };
  }, [logo, size, removeAlpha]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="border rounded-lg"
      style={{ width: '100px', height: '100px' }}
    />
  );
}

interface FeatureGraphicPreviewProps {
  logo: string;
  background: string;
}

function FeatureGraphicPreview({ logo, background }: FeatureGraphicPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 1024;
  const height = 500;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawCanvas = async () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw background
      if (background.startsWith('linear-gradient')) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const colors = background.match(/#[a-fA-F0-9]{6}/g);
        if (colors && colors.length >= 2) {
          gradient.addColorStop(0, colors[0]);
          gradient.addColorStop(1, colors[1]);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        }
      } else if (background.startsWith('url(')) {
        const bgImg = new Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.src = background.slice(4, -1);
        await new Promise<void>((resolve) => {
          bgImg.onload = () => {
            const scale = Math.max(width / bgImg.width, height / bgImg.height);
            const scaledWidth = bgImg.width * scale;
            const scaledHeight = bgImg.height * scale;
            const x = (width - scaledWidth) / 2;
            const y = height - scaledHeight;
            ctx.drawImage(bgImg, x, y, scaledWidth, scaledHeight);
            resolve();
          };
          bgImg.onerror = () => {
            console.error('Failed to load background image');
            resolve();
          };
        });
      } else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw logo
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logo;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const logoSize = Math.min(width, height) * 0.4;
          const x = (width - logoSize) / 2;
          const y = (height - logoSize) / 2;
          ctx.drawImage(img, x, y, logoSize, logoSize);
          resolve();
        };
        img.onerror = () => {
          console.error('Failed to load logo image');
          resolve();
        };
      });
    };

    drawCanvas();
  }, [logo, background]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="border rounded-lg w-full"
    />
  );
}

export function AppIconGenerator() {
  const {
    appIconLogo,
    appIconBackground,
    appIconBackgroundType,
    setAppIcon,
    setAppIconBackground,
    setAppIconBackgroundType,
    generateAppIcons
  } = useAssetStore();

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setAppIcon(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    try {
      const content = await generateAppIcons();
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'app-icons.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate app icons:', error);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">App Icon Generator</h2>

      {!appIconLogo ? (
        <Dropzone
          onFileAccepted={handleLogoUpload}
          className="h-64"
          specification="Upload logo (size: 1024px × 1024px or any image with 1:1 ratio)"
        />
      ) : (
        <div className="space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={appIconLogo}
              alt="Uploaded logo"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setAppIcon(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Feature Graphic Background</h3>
            <BackgroundPicker
              color={appIconBackground}
              onColorChange={setAppIconBackground}
              onImageUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    setAppIconBackground(`url(${e.target.result})`);
                  }
                };
                reader.readAsDataURL(file);
              }}
              onGradientChange={setAppIconBackground}
              selectedType={appIconBackgroundType}
              onTypeChange={setAppIconBackgroundType}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">iOS Icons Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[16, 32, 64, 128].map((size) => (
                <div key={size} className="text-center">
                  <IconPreview logo={appIconLogo} size={size} removeAlpha={true} />
                  <p className="mt-2 text-sm text-gray-600">{size}×{size}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Android Feature Graphic Preview</h3>
            <FeatureGraphicPreview logo={appIconLogo} background={appIconBackground} />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleDownload}
              variant="success"
            >
              Download Assets
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}