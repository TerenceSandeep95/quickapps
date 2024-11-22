import { Dropzone } from '../ui/dropzone';
import { BackgroundPicker } from './background-picker';
import { Preview } from './preview';
import { useAssetStore } from '@/store/asset-store';
import { Button } from '../ui/button';

export function SplashScreenGenerator() {
  const {
    splashLogo,
    splashBackground,
    splashBackgroundType,
    setSplashLogo,
    setSplashBackground,
    setSplashBackgroundType,
    generateSplashScreens
  } = useAssetStore();

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSplashLogo(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    try {
      const content = await generateSplashScreens();
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'splash-screens.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate splash screens:', error);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Splash Screen Generator</h2>

      {!splashLogo ? (
        <Dropzone
          onFileAccepted={handleLogoUpload}
          className="h-64"
          specification="Upload logo (size: 1024px × 1024px or any image with 1:1 ratio)"
        />
      ) : (
        <div className="space-y-6">
          <div className="relative w-32 h-32 mx-auto">
            <img
              src={splashLogo}
              alt="Uploaded logo"
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => setSplashLogo(null)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Background</h3>
            <BackgroundPicker
              color={splashBackground}
              onColorChange={setSplashBackground}
              onImageUpload={(file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    setSplashBackground(`url(${e.target.result})`);
                  }
                };
                reader.readAsDataURL(file);
              }}
              onGradientChange={setSplashBackground}
              selectedType={splashBackgroundType}
              onTypeChange={setSplashBackgroundType}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">iOS Preview</h3>
              <Preview
                logo={splashLogo}
                width={414}
                height={896}
                background={splashBackground}
                removeAlpha={true}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Android Preview</h3>
              <Preview
                logo={splashLogo}
                width={360}
                height={740}
                background={splashBackground}
              />
            </div>
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