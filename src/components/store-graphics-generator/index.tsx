import { ScreenshotUploader } from './screenshot-uploader';
import { TextStyleEditor } from './text-style-editor';
import { PreviewCanvas } from './preview-canvas';
import { BackgroundPicker } from '../splash-screen-generator/background-picker';
import { TextInput } from './text-input';
import { useAssetStore } from '@/store/asset-store';
import { Button } from '../ui/button';

const DEFAULT_TEXTS = [
  { text1: "View all events in one place", text2: "Discover upcoming events" },
  { text1: "View the event info", text2: "Get all event details" },
  { text1: "Login using ticket ID", text2: "Quick and secure access" },
  { text1: "Get Directions to Venue", text2: "Navigate with ease" },
  { text1: "Explore the event", text2: "Experience everything" }
];

export function StoreGraphicsGenerator() {
  const {
    storeDevices,
    storeBackground,
    storeBackgroundType,
    storeTextStyle,
    setStoreDevices,
    setStoreBackground,
    setStoreBackgroundType,
    setStoreTextStyle,
    generateStoreGraphics
  } = useAssetStore();

  const handleScreenshotsChange = (deviceIndex: number, screenshots: Array<{
    file: File;
    preview: string;
    text1: string;
    text2: string;
  }>) => {
    const newDevices = [...storeDevices];
    newDevices[deviceIndex].screenshots = screenshots.map((screenshot, index) => ({
      ...screenshot,
      text1: DEFAULT_TEXTS[index].text1,
      text2: DEFAULT_TEXTS[index].text2
    }));
    setStoreDevices(newDevices);
  };

  const handleTextChange = (screenshotIndex: number, field: 'text1' | 'text2', value: string) => {
    const newDevices = storeDevices.map(device => ({
      ...device,
      screenshots: device.screenshots.map((screenshot, index) => {
        if (index === screenshotIndex) {
          return {
            ...screenshot,
            [field]: value
          };
        }
        return screenshot;
      })
    }));
    setStoreDevices(newDevices);
  };

  const handleDownload = async () => {
    try {
      const content = await generateStoreGraphics();
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'store-graphics.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate store graphics:', error);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Store Graphics Generator</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Text Style</h3>
          <TextStyleEditor textStyle={storeTextStyle} onTextStyleChange={setStoreTextStyle} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Background</h3>
          <BackgroundPicker
            color={storeBackground}
            onColorChange={setStoreBackground}
            onImageUpload={(file) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                if (e.target?.result) {
                  setStoreBackground(`url(${e.target.result})`);
                }
              };
              reader.readAsDataURL(file);
            }}
            onGradientChange={setStoreBackground}
            selectedType={storeBackgroundType}
            onTypeChange={setStoreBackgroundType}
          />
        </div>
      </div>

      <div className="space-y-8">
        {storeDevices.map((device, deviceIndex) => (
          <div key={device.name} className="space-y-4">
            <h3 className="text-xl font-semibold">{device.name}</h3>
            <ScreenshotUploader
              screenshots={device.screenshots}
              onScreenshotsChange={(screenshots) => handleScreenshotsChange(deviceIndex, screenshots)}
            />
            {device.screenshots.length > 0 && (
              <div className="space-y-4">
                {device.screenshots.map((screenshot, screenshotIndex) => (
                  <div key={screenshotIndex} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <TextInput
                        value={screenshot.text1}
                        onChange={(value) => handleTextChange(screenshotIndex, 'text1', value)}
                        placeholder="First line of text"
                        fontFamily={storeTextStyle.fontFamily}
                      />
                      <TextInput
                        value={screenshot.text2}
                        onChange={(value) => handleTextChange(screenshotIndex, 'text2', value)}
                        placeholder="Second line of text"
                        fontFamily={storeTextStyle.fontFamily}
                      />
                    </div>
                    <PreviewCanvas
                      screenshot={screenshot}
                      width={device.width}
                      height={device.height}
                      textStyle={storeTextStyle}
                      background={storeBackground}
                      removeAlpha={device.name.toLowerCase().includes('ios')}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {storeDevices.some(device => device.screenshots.length > 0) && (
        <div className="flex justify-end">
          <Button
            onClick={handleDownload}
            variant="success"
          >
            Download Assets
          </Button>
        </div>
      )}
    </div>
  );
}