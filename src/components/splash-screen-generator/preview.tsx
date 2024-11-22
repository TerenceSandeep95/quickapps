import { useEffect, useRef } from 'react';
import { removeAlphaChannel } from '@/lib/utils';

interface PreviewProps {
  logo: string;
  width: number;
  height: number;
  background: string;
  removeAlpha?: boolean;
  className?: string;
}

export function Preview({
  logo,
  width,
  height,
  background,
  removeAlpha = false,
  className = ''
}: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        await new Promise((resolve) => {
          bgImg.onload = resolve;
        });
        
        // Calculate dimensions to cover the canvas
        const scale = Math.max(width / bgImg.width, height / bgImg.height);
        const scaledWidth = bgImg.width * scale;
        const scaledHeight = bgImg.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = height - scaledHeight; // Position at bottom
        
        ctx.drawImage(bgImg, x, y, scaledWidth, scaledHeight);
      } else {
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw logo
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = logo;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const logoSize = Math.min(width, height) * 0.4;
      const x = (width - logoSize) / 2;
      const y = (height - logoSize) / 2;
      ctx.drawImage(img, x, y, logoSize, logoSize);

      if (removeAlpha) {
        removeAlphaChannel(canvas);
      }
    };

    drawCanvas();
  }, [logo, width, height, background, removeAlpha]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border rounded-lg w-full ${className}`}
    />
  );
}