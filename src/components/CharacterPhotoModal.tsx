import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, RotateCcw, Check, Sparkles, AlertCircle, ZoomIn, Move } from 'lucide-react';
import { DEFAULT_CHARACTER_AVATAR } from '../assets/defaultAvatars';
import { processAvatarImage } from '../utils/imageUtils';

interface CharacterPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string;
  onSaveAvatar: (newAvatarUrl: string) => Promise<void> | void;
}

export const CharacterPhotoModal: React.FC<CharacterPhotoModalProps> = ({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSaveAvatar
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string>(currentAvatarUrl || DEFAULT_CHARACTER_AVATAR);
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewSrc(currentAvatarUrl || DEFAULT_CHARACTER_AVATAR);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setErrorMsg(null);
      setSelectedFile(null);
    }
  }, [isOpen, currentAvatarUrl]);

  // Redraw canvas whenever zoom, offset or previewSrc changes
  useEffect(() => {
    if (!previewSrc || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
    img.onerror = () => {
      // If image fails to load, fallback to default
      if (previewSrc !== DEFAULT_CHARACTER_AVATAR) {
        setPreviewSrc(DEFAULT_CHARACTER_AVATAR);
      }
    };
    img.src = previewSrc;
  }, [previewSrc, zoom, offsetX, offsetY]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const targetSize = 256;
    canvas.width = targetSize;
    canvas.height = targetSize;

    ctx.clearRect(0, 0, targetSize, targetSize);

    // Save context
    ctx.save();

    // High quality smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Calculate crop rectangle with zoom and offset
    const minDim = Math.min(img.width, img.height);
    const scaledDim = minDim / zoom;

    // Center point
    const cx = img.width / 2 + (offsetX * (img.width / 200));
    const cy = img.height / 2 + (offsetY * (img.height / 200));

    let sx = cx - scaledDim / 2;
    let sy = cy - scaledDim / 2;

    // Constrain crop rectangle within bounds
    sx = Math.max(0, Math.min(img.width - scaledDim, sx));
    sy = Math.max(0, Math.min(img.height - scaledDim, sy));

    ctx.drawImage(img, sx, sy, scaledDim, scaledDim, 0, 0, targetSize, targetSize);
    ctx.restore();
  };

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg('不支援的檔案格式！僅支援 JPG、PNG 或 WebP。');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('檔案大小超過 8 MB，請選擇較小的圖片。');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setSelectedFile(file);
        setPreviewSrc(evt.target.result as string);
        setZoom(1);
        setOffsetX(0);
        setOffsetY(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetDefault = () => {
    setSelectedFile(null);
    setPreviewSrc(DEFAULT_CHARACTER_AVATAR);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setErrorMsg(null);
  };

  const handleSave = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      let finalDataUrl = previewSrc;

      if (selectedFile) {
        // If a new file was uploaded, generate compressed base64 from canvas
        if (canvasRef.current) {
          finalDataUrl = canvasRef.current.toDataURL('image/webp', 0.85);
          if (!finalDataUrl.startsWith('data:image/webp')) {
            finalDataUrl = canvasRef.current.toDataURL('image/jpeg', 0.85);
          }
        } else {
          const processed = await processAvatarImage(selectedFile, 256, 0.85);
          finalDataUrl = processed.dataUrl;
        }
      }

      await onSaveAvatar(finalDataUrl);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '儲存頭貼失敗，請再試一次。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              更換首頁星途經紀人頭貼
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Live Preview Circle */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative w-40 h-40 rounded-full p-1 bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 shadow-xl shadow-pink-500/20">
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-cover rounded-full"
                width={256}
                height={256}
              />
            </div>
            <span className="absolute bottom-1 right-1 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              預覽
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
            自動縮放並裁切為 256×256 規格，完美呈現於經紀看板
          </p>
        </div>

        {/* Adjustments: Zoom & Pan Sliders */}
        {selectedFile && (
          <div className="space-y-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-pink-500" /> 放大縮小 ({zoom.toFixed(1)}x)
              </span>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="text-[10px] text-pink-500 hover:underline"
              >
                重置縮放
              </button>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-pink-500"
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Move className="w-3 h-3" /> 水平位置
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={offsetX}
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                  <Move className="w-3 h-3" /> 垂直位置
                </label>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={offsetY}
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Buttons Action Group */}
        <div className="space-y-2 pt-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 rounded-xl border border-pink-200 dark:border-pink-900/60 bg-pink-50/50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-300 text-xs font-bold hover:bg-pink-100 dark:hover:bg-pink-900/50 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>選擇電腦照片</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢復可愛預設圖</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <span>處理並儲存中...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>儲存角色照片</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
