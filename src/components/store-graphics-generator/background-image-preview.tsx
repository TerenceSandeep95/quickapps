interface BackgroundImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

export function BackgroundImagePreview({ imageUrl, onRemove }: BackgroundImagePreviewProps) {
  return (
    <div className="relative w-full h-32">
      <img
        src={imageUrl}
        alt="Background preview"
        className="w-full h-full object-cover rounded-lg"
      />
      <button
        onClick={onRemove}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  );
}