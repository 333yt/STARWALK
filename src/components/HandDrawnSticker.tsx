import React from 'react';

export interface StickerOption {
  id: string;
  label: string;
  emoji: string;
  color: string;
}

export const STICKER_OPTIONS: StickerOption[] = [
  { id: 'lightstick', label: '應援手燈', emoji: '🍭', color: '#FFE3EC' },
  { id: 'photocard', label: '特典小卡', emoji: '📸', color: '#F2E6FF' },
  { id: 'album', label: '專輯唱片', emoji: '💿', color: '#E6F4FF' },
  { id: 'ticket', label: '演唱門票', emoji: '🎟️', color: '#FFF2CC' },
  { id: 'boba', label: '手搖飲料', emoji: '🧋', color: '#FDEBD0' },
  { id: 'bento', label: '日式便當', emoji: '🍱', color: '#FFE8E0' },
  { id: 'cake', label: '甜點蛋糕', emoji: '🎂', color: '#FFE3EC' },
  { id: 'train', label: '交通移動', emoji: '🚆', color: '#E3F8F2' },
  { id: 'heart', label: '愛心周邊', emoji: '💖', color: '#FFE0F0' },
  { id: 'sparkles', label: '閃耀星光', emoji: '✨', color: '#FFF8D6' },
  { id: 'coin', label: '工作薪資', emoji: '🪙', color: '#E4FBF0' }
];

export function HandDrawnSticker({
  sticker = 'sparkles',
  size = 32,
  className = ''
}: {
  sticker?: string;
  size?: number;
  className?: string;
}) {
  const item = STICKER_OPTIONS.find(s => s.id === sticker) || STICKER_OPTIONS[9];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-2xl border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728] select-none shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: item.color,
        fontSize: Math.round(size * 0.54)
      }}
      title={item.label}
    >
      {item.emoji}
    </span>
  );
}
