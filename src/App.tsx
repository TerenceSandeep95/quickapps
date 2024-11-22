import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppIconGenerator } from '@/components/app-icon-generator';
import { SplashScreenGenerator } from '@/components/splash-screen-generator';
import { StoreGraphicsGenerator } from '@/components/store-graphics-generator';
import { useAssetStore } from '@/store/asset-store';
import { Button } from './components/ui/button';
import JSZip from 'jszip';

export default function App() {
  const {
    appIconLogo,
    splashLogo,
    storeDevices,
    generateAppIcons,
    generateSplashScreens,
    generateStoreGraphics
  } = useAssetStore();

  const downloadAllAssets = async () => {
    try {
      const zip = new JSZip();

      // Add app icons if available
      if (appIconLogo) {
        const appIconsZip = await generateAppIcons();
        zip.file('app-icons.zip', appIconsZip);
      }

      // Add splash screens if available
      if (splashLogo) {
        const splashScreensZip = await generateSplashScreens();
        zip.file('splash-screens.zip', splashScreensZip);
      }

      // Add store graphics if available
      if (storeDevices.some(device => device.screenshots.length > 0)) {
        const storeGraphicsZip = await generateStoreGraphics();
        zip.file('store-graphics.zip', storeGraphicsZip);
      }

      // Generate and download the combined zip
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-assets.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate assets:', error);
    }
  };

  const hasAnyAssets = appIconLogo || splashLogo || storeDevices.some(device => device.screenshots.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Backstage Asset Generator</h1>
          {hasAnyAssets && (
            <Button
              onClick={downloadAllAssets}
              variant="success"
            >
              Download All Assets
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="app-icons">
          <TabsList>
            <TabsTrigger value="app-icons">App Icons</TabsTrigger>
            <TabsTrigger value="splash">Splash Screens</TabsTrigger>
            <TabsTrigger value="store">Store Graphics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="app-icons">
            <AppIconGenerator />
          </TabsContent>
          
          <TabsContent value="splash">
            <SplashScreenGenerator />
          </TabsContent>
          
          <TabsContent value="store">
            <StoreGraphicsGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}