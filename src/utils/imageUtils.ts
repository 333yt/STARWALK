/**
 * Image processing utility for Avatars, Concert Banners, and Photocards
 * Automatically resizes, crops, and compresses user-uploaded images to compact dataURL strings
 * Directly persisted in Firestore documents without requiring Firebase Storage Blaze plan
 */

export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_INPUT_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export async function processAvatarImage(file: File, targetSize = 256, quality = 0.85): Promise<ProcessedImageResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('不支援的檔案格式！僅支援 JPG、PNG 或 WebP 圖片格式。');
  }

  if (file.size > MAX_INPUT_FILE_SIZE) {
    throw new Error('圖片檔案過大！請選擇小於 8 MB 的頭貼圖片。');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('讀取圖片檔案失敗，請重新嘗試。'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('圖片解碼失敗，請確認檔案未損毀。'));
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('瀏覽器不支援 Canvas 圖像處理。'));
            return;
          }

          // Center crop to 1:1 square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

          let mime = 'image/webp';
          let dataUrl = canvas.toDataURL(mime, quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            mime = 'image/jpeg';
            dataUrl = canvas.toDataURL(mime, quality);
          }

          const approxBytes = Math.round((dataUrl.length * 3) / 4);

          resolve({
            dataUrl,
            width: targetSize,
            height: targetSize,
            sizeBytes: approxBytes
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * General purpose image compressor for concert covers and collectible photocards
 * Resizes proportionally within maxWidth / maxHeight limits and compresses to ~25KB-50KB
 */
export async function processGeneralImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8
): Promise<ProcessedImageResult> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('不支援的檔案格式！僅支援 JPG、PNG 或 WebP 圖片格式。');
  }

  if (file.size > MAX_INPUT_FILE_SIZE) {
    throw new Error('圖片檔案過大！請選擇小於 8 MB 的照片。');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('讀取圖片檔案失敗，請重新嘗試。'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('圖片解碼失敗，請確認檔案未損毀。'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Scale down proportionally
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('瀏覽器不支援 Canvas 圖像處理。'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          let mime = 'image/webp';
          let dataUrl = canvas.toDataURL(mime, quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            mime = 'image/jpeg';
            dataUrl = canvas.toDataURL(mime, quality);
          }

          const approxBytes = Math.round((dataUrl.length * 3) / 4);

          resolve({
            dataUrl,
            width,
            height,
            sizeBytes: approxBytes
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
