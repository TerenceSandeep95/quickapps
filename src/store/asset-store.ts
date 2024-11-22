import { create } from 'zustand';
import JSZip from 'jszip';
import { DeviceConfig, TextStyle } from '@/components/store-graphics-generator/types';
import { removeAlphaChannel, resizeImage } from '@/lib/utils';

interface AssetStore {
  // App Icons
  appIconLogo: string | null;
  appIconBackground: string;
  appIconBackgroundType: 'color' | 'gradient' | 'image';
  setAppIcon: (logo: string | null) => void;
  setAppIconBackground: (background: string) => void;
  setAppIconBackgroundType: (type: 'color' | 'gradient' | 'image') => void;
  generateAppIcons: () => Promise<Blob>;

  // Splash Screens
  splashLogo: string | null;
  splashBackground: string;
  splashBackgroundType: 'color' | 'gradient' | 'image';
  setSplashLogo: (logo: string | null) => void;
  setSplashBackground: (background: string) => void;
  setSplashBackgroundType: (type: 'color' | 'gradient' | 'image') => void;
  generateSplashScreens: () => Promise<Blob>;

  // Store Graphics
  storeDevices: DeviceConfig[];
  storeBackground: string;
  storeBackgroundType: 'color' | 'gradient' | 'image';
  storeTextStyle: TextStyle;
  gradientColors: { color1: string; color2: string };
  setStoreDevices: (devices: DeviceConfig[]) => void;
  setStoreBackground: (background: string) => void;
  setStoreBackgroundType: (type: 'color' | 'gradient' | 'image') => void;
  setStoreTextStyle: (style: TextStyle) => void;
  setGradientColors: (colors: { color1: string; color2: string }) => void;
  generateStoreGraphics: () => Promise<Blob>;
}

const IOS_SIZES = [16, 20, 29, 32, 40, 48, 50, 55, 57, 58, 60, 64, 72, 76, 80, 87, 88, 100, 114, 120, 128, 144, 152, 167, 172, 180, 196, 256, 512, 1024];
const ANDROID_SIZES = [512];
const FEATURE_GRAPHIC = { width: 1024, height: 500 };

async function drawBackground(ctx: CanvasRenderingContext2D, width: number, height: number, background: string) {
  if (background.startsWith('linear-gradient')) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    const colors = background.match(/#[a-fA-F0-9]{6}/g);
    if (colors && colors.length >= 2) {
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1]);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = '#ffffff'; // Fallback
    }
    ctx.fillRect(0, 0, width, height);
  } else if (background.startsWith('url(')) {
    return new Promise<void>((resolve) => {
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = background.slice(4, -1);
      bgImg.onload = () => {
        const scale = Math.max(width / bgImg.width, height / bgImg.height);
        const scaledWidth = bgImg.width * scale;
        const scaledHeight = bgImg.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight);
        ctx.drawImage(bgImg, x, y, scaledWidth, scaledHeight);
        resolve();
      };
      bgImg.onerror = () => {
        console.error('Failed to load background image');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        resolve();
      };
    });
  } else {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
  }
}

export const useAssetStore = create<AssetStore>((set, get) => ({
  // App Icons State
  appIconLogo: null,
  appIconBackground: '#ffffff',
  appIconBackgroundType: 'color',
  setAppIcon: (logo) => set({ appIconLogo: logo }),
  setAppIconBackground: (background) => set({ appIconBackground: background }),
  setAppIconBackgroundType: (type) => set({ appIconBackgroundType: type }),

  // Splash Screens State
  splashLogo: null,
  splashBackground: '#ffffff',
  splashBackgroundType: 'color',
  setSplashLogo: (logo) => set({ splashLogo: logo }),
  setSplashBackground: (background) => set({ splashBackground: background }),
  setSplashBackgroundType: (type) => set({ splashBackgroundType: type }),

  // Store Graphics State
  storeDevices: [
    { name: 'iOS Non-Pro', width: 1242, height: 2688, screenshots: [] },
    { name: 'iOS Pro', width: 1290, height: 2796, screenshots: [] },
    { name: 'iOS iPad', width: 2048, height: 2732, screenshots: [] },
    { name: 'Android Mobile', width: 1290, height: 2796, screenshots: [] }
  ],
  storeBackground: '#ffffff',
  storeBackgroundType: 'color',
  storeTextStyle: {
    fontFamily: 'Inter',
    fontWeight: '600',
    color: '#000000'
  },
  gradientColors: {
    color1: '#ffffff',
    color2: '#000000'
  },
  setStoreDevices: (devices) => set({ storeDevices: devices }),
  setStoreBackground: (background) => set({ storeBackground: background }),
  setStoreBackgroundType: (type) => set({ storeBackgroundType: type }),
  setStoreTextStyle: (style) => set({ storeTextStyle: style }),
  setGradientColors: (colors) => set({ gradientColors: colors }),

  // Generation Functions
  generateAppIcons: async () => {
    const { appIconLogo, appIconBackground } = get();
    if (!appIconLogo) throw new Error('No logo uploaded');

    const zip = new JSZip();
    const iosFolder = zip.folder('ios');
    const androidFolder = zip.folder('android');

    // Generate iOS icons
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = appIconLogo;
    await new Promise((resolve) => (img.onload = resolve));

    for (const size of IOS_SIZES) {
      const canvas = resizeImage(img, size, size);
      const processedCanvas = removeAlphaChannel(canvas);
      const blob = await new Promise<Blob>((resolve) => 
        processedCanvas.toBlob(blob => resolve(blob!), 'image/png')
      );
      iosFolder?.file(`icon_${size}x${size}.png`, blob);
    }

    // Generate Android icons
    for (const size of ANDROID_SIZES) {
      const canvas = resizeImage(img, size, size);
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob(blob => resolve(blob!), 'image/png')
      );
      androidFolder?.file(`icon_${size}x${size}.png`, blob);
    }

    // Generate feature graphic
    const featureCanvas = document.createElement('canvas');
    featureCanvas.width = FEATURE_GRAPHIC.width;
    featureCanvas.height = FEATURE_GRAPHIC.height;
    const ctx = featureCanvas.getContext('2d');
    if (ctx) {
      await drawBackground(ctx, FEATURE_GRAPHIC.width, FEATURE_GRAPHIC.height, appIconBackground);

      const logoSize = Math.min(FEATURE_GRAPHIC.width, FEATURE_GRAPHIC.height) * 0.4;
      const x = (FEATURE_GRAPHIC.width - logoSize) / 2;
      const y = (FEATURE_GRAPHIC.height - logoSize) / 2;
      ctx.drawImage(img, x, y, logoSize, logoSize);
      
      const blob = await new Promise<Blob>((resolve) => 
        featureCanvas.toBlob(blob => resolve(blob!), 'image/png')
      );
      androidFolder?.file('feature_graphic.png', blob);
    }

    return zip.generateAsync({ type: 'blob' });
  },

  generateSplashScreens: async () => {
    const { splashLogo, splashBackground } = get();
    if (!splashLogo) throw new Error('No logo uploaded');

    const zip = new JSZip();
    const iosFolder = zip.folder('ios');
    const androidFolder = zip.folder('android');

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = splashLogo;
    await new Promise((resolve) => (img.onload = resolve));

    // iOS splash screen
    const iosCanvas = document.createElement('canvas');
    iosCanvas.width = 414;
    iosCanvas.height = 896;
    const iosCtx = iosCanvas.getContext('2d');
    if (iosCtx) {
      await drawBackground(iosCtx, 414, 896, splashBackground);
      
      const logoSize = Math.min(414, 896) * 0.4;
      const x = (414 - logoSize) / 2;
      const y = (896 - logoSize) / 2;
      iosCtx.drawImage(img, x, y, logoSize, logoSize);
      
      const processedCanvas = removeAlphaChannel(iosCanvas);
      const blob = await new Promise<Blob>((resolve) => 
        processedCanvas.toBlob(blob => resolve(blob!), 'image/png')
      );
      iosFolder?.file('splash.png', blob);
    }

    // Android splash screen
    const androidCanvas = document.createElement('canvas');
    androidCanvas.width = 360;
    androidCanvas.height = 740;
    const androidCtx = androidCanvas.getContext('2d');
    if (androidCtx) {
      await drawBackground(androidCtx, 360, 740, splashBackground);
      
      const logoSize = Math.min(360, 740) * 0.4;
      const x = (360 - logoSize) / 2;
      const y = (740 - logoSize) / 2;
      androidCtx.drawImage(img, x, y, logoSize, logoSize);
      
      const blob = await new Promise<Blob>((resolve) => 
        androidCanvas.toBlob(blob => resolve(blob!), 'image/png')
      );
      androidFolder?.file('splash.png', blob);
    }

    return zip.generateAsync({ type: 'blob' });
  },

  generateStoreGraphics: async () => {
    const { storeDevices, storeBackground, storeTextStyle } = get();
    const zip = new JSZip();
    const iosFolder = zip.folder('ios');
    const androidFolder = zip.folder('android');

    for (const device of storeDevices) {
      const folder = device.name.toLowerCase().includes('android') ? androidFolder : iosFolder;
      const deviceFolder = folder?.folder(device.name.toLowerCase().replace(/\s+/g, '-'));
      
      for (let i = 0; i < device.screenshots.length; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = device.width;
        canvas.height = device.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        // Draw background
        await drawBackground(ctx, device.width, device.height, storeBackground);

        // Draw screenshot
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = device.screenshots[i].preview;
        await new Promise((resolve) => (img.onload = resolve));

        const screenshotHeight = device.height * 0.8;
        const screenshotWidth = (img.width / img.height) * screenshotHeight;
        const x = (device.width - screenshotWidth) / 2;
        const y = device.height - screenshotHeight;
        ctx.drawImage(img, x, y, screenshotWidth, screenshotHeight);

        // Draw text
        ctx.font = `${storeTextStyle.fontWeight} 72px ${storeTextStyle.fontFamily}`;
        ctx.fillStyle = storeTextStyle.color;
        ctx.textAlign = 'center';
        
        const text1Y = 80 + 72;
        const text2Y = text1Y + 72 + 24;
        
        ctx.fillText(device.screenshots[i].text1, device.width / 2, text1Y);
        ctx.fillText(device.screenshots[i].text2, device.width / 2, text2Y);

        const processedCanvas = device.name.toLowerCase().includes('ios') ? removeAlphaChannel(canvas) : canvas;
        const blob = await new Promise<Blob>((resolve) => 
          processedCanvas.toBlob(blob => resolve(blob!), 'image/png')
        );
        deviceFolder?.file(`screenshot-${i + 1}.png`, blob);
      }
    }

    return zip.generateAsync({ type: 'blob' });
  }
}));