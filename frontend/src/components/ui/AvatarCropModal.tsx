import { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

async function cropImageToBlob(imageSrc: string, pixelCrop: Area, rotation: number): Promise<Blob> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise<void>((resolve) => { img.onload = () => resolve(); });

  const canvas = document.createElement('canvas');
  const outputSize = 512;
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d')!;

  // Apply rotation around center
  ctx.translate(outputSize / 2, outputSize / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-outputSize / 2, -outputSize / 2);

  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0, 0,
    outputSize,
    outputSize,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas empty'))),
      'image/jpeg',
      0.9,
    );
  });
}

interface Props {
  imageSrc: string;
  onCancel: () => void;
  onCrop: (blob: Blob) => void;
  loading?: boolean;
}

export function AvatarCropModal({ imageSrc, onCancel, onCrop, loading }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const blob = await cropImageToBlob(imageSrc, croppedAreaPixels, rotation);
    onCrop(blob);
  };

  return (
    <Modal open onClose={onCancel} title="Rasmni qirqish">
      <div className="space-y-4">
        {/* Crop viewport */}
        <div
          className="relative rounded-2xl overflow-hidden bg-gray-950"
          style={{ height: 300 }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              cropAreaStyle: {
                border: '2px solid rgba(255,255,255,0.85)',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
              },
            }}
          />
        </div>

        {/* Zoom */}
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Kattalik</p>
          <div className="flex items-center gap-3">
            <ZoomOut size={15} className="text-gray-400 shrink-0" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-1.5 rounded-full accent-brand-500 cursor-pointer"
            />
            <ZoomIn size={15} className="text-gray-400 shrink-0" />
          </div>
        </div>

        {/* Rotation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-gray-500">Aylantirish</p>
            <button
              type="button"
              onClick={() => setRotation(0)}
              className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1"
            >
              <RotateCcw size={11} /> Asl holat
            </button>
          </div>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(Number(e.target.value))}
            className="w-full h-1.5 rounded-full accent-brand-500 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>-45°</span>
            <span className="font-medium text-gray-600 dark:text-gray-400">{rotation}°</span>
            <span>+45°</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={onCancel}
          >
            Bekor qilish
          </Button>
          <Button
            type="button"
            className="flex-1"
            loading={loading}
            onClick={handleConfirm}
          >
            Saqlash
          </Button>
        </div>
      </div>
    </Modal>
  );
}
