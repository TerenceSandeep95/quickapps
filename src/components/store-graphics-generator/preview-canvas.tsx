import React, { useEffect, useRef } from 'react';
import { Screenshot, TextStyle } from './types';
import { removeAlphaChannel } from '@/lib/utils';

interface PreviewCanvasProps {
  screenshot: Screenshot;
  width: number;
  height: number;
  textStyle: TextStyle;
  background: string;
  removeAlpha?: boolean;
}

export function PreviewCanvas({
  screenshot,
  width,
  height,
  textStyle,
  background,
  removeAlpha = false
}: PreviewCanvasProps) {
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
        bgImg.src = background.slice(4, -1);
        await new Promise((resolve) => {
          bgImg.onload = resolve;
        });
        
        // Calculate dimensions to cover the canvas while maintaining aspect ratio
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

      // Draw screenshot
      const img = new Image();
      img.src = screenshot.preview;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const screenshotHeight = height * 0.8;
      const screenshotWidth = (img.width / img.height) * screenshotHeight;
      const x = (width - screenshotWidth) / 2;
      const y = height - screenshotHeight;
      ctx.drawImage(img, x, y, screenshotWidth, screenshotHeight);

      // Draw text with selected font family
      ctx.font = `${textStyle.fontWeight} 72px ${textStyle.fontFamily}`;
      ctx.fillStyle = textStyle.color;
      ctx.textAlign = 'center';
      
      const text1Y = 80 + 72;
      const text2Y = text1Y + 72 + 24;
      
      ctx.fillText(screenshot.text1, width / 2, text1Y);
      ctx.fillText(screenshot.text2, width / 2, text2Y);

      if (removeAlpha) {
        removeAlphaChannel(canvas);
      }
    };

    drawCanvas();
  }, [screenshot, width, height, textStyle, background, removeAlpha]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full border rounded-lg"
    />
  );
}