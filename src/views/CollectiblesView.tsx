import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Plus,
  Search,
  LayoutGrid,
  List,
  Trash2,
  RefreshCw,
  X,
  Layers
} from 'lucide-react';
import { Collectible, CollectibleStatus } from '../types';
import { processGeneralImage } from '../utils/imageUtils';
import { DEFAULT_CONCERT_COVER } from '../assets/defaultAvatars';
import { HandDrawnSticker } from '../components/HandDrawnSticker';

export const DEFAULT_COLLECTIBLE_PHOTO = DEFAULT_CONCERT_COVER;

const STATUS_LIST: CollectibleStatus[] = [
  '想收',
  '已購入',
  '待到貨',
  '已到貨',
  '贈送取得',
  '交換取得',
  '已轉售'
];

export const CollectiblesView: React.FC = () => {
  const { collectibles, addCollectible, updateCollectible, deleteCollectible } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Track flipped cards (viewing back photo)
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Collectible | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [artist, setArtist] = useState('');
  const [member, setMember] = useState('');
  const [category, setCategory] = useState('小卡、特典卡');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(350);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState('');
  const [status, setStatus] = useState<CollectibleStatus>('已到貨');
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState(DEFAULT_COLLECTIBLE_PHOTO);
  const [backPhotoUrl, setBackPhotoUrl] = useState<string>('');

  // Upload status & errors
  const [isProcessingFront, setIsProcessingFront] = useState(false);
  const [isProcessingBack, setIsProcessingBack] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const toggleCardFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const uniqueGroups = useMemo(() => {
    const set = new Set(collectibles.map(c => c.group).filter(Boolean));
    return Array.from(set);
  }, [collectibles]);

  const filteredList = useMemo(() => {
    return collectibles.filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (groupFilter !== 'all' && c.group !== groupFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchGroup = c.group?.toLowerCase().includes(q);
        const matchMember = c.member?.toLowerCase().includes(q);
        const matchNote = c.note?.toLowerCase().includes(q);
        return matchName || matchGroup || matchMember || matchNote;
      }
      return true;
    });
  }, [collectibles, statusFilter, groupFilter, search]);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setGroup('');
    setArtist('');
    setMember('全體');
    setCategory('小卡、特典卡');
    setQuantity(1);
    setPrice(350);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setChannel('');
    setStatus('已到貨');
    setNote('');
    setPhotoUrl(DEFAULT_COLLECTIBLE_PHOTO);
    setBackPhotoUrl('');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Collectible) => {
    setEditingItem(item);
    setName(item.name);
    setGroup(item.group || '');
    setArtist(item.artist || '');
    setMember(item.member || '全體');
    setCategory(item.category);
    setQuantity(item.quantity);
    setPrice(item.price);
    setPurchaseDate(item.purchaseDate);
    setChannel(item.channel || '');
    setStatus(item.status);
    setNote(item.note || '');
    setPhotoUrl(item.photoUrl || DEFAULT_COLLECTIBLE_PHOTO);
    setBackPhotoUrl(item.backPhotoUrl || '');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleFrontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsProcessingFront(true);
    try {
      const processed = await processGeneralImage(file, 600, 800, 0.82);
      setPhotoUrl(processed.dataUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '上傳正面照片失敗');
    } finally {
      setIsProcessingFront(false);
      if (frontInputRef.current) frontInputRef.current.value = '';
    }
  };

  const handleBackUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsProcessingBack(true);
    try {
      const processed = await processGeneralImage(file, 600, 800, 0.82);
      setBackPhotoUrl(processed.dataUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '上傳背面照片失敗');
    } finally {
      setIsProcessingBack(false);
      if (backInputRef.current) backInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      group: group.trim(),
      artist: artist.trim() || group.trim(),
      member: member.trim() || '全體',
      category,
      quantity,
      price,
      purchaseDate,
      channel: channel.trim(),
      status,
      note: note.trim(),
      photoUrl,
      backPhotoUrl: backPhotoUrl.trim() || undefined
    };

    if (editingItem) {
      updateCollectible(editingItem.id, payload);
    } else {
      addCollectible(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="sketch-card bg-[#FFEBF2] p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        <div
          className="washi-tape-pink absolute -top-3 left-10 w-28 h-5 rounded-sm"
          style={{ transform: 'rotate(-2deg)' }}
        />
        <div className="flex items-center gap-3.5">
          <HandDrawnSticker sticker="photocard" size={48} />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#4A3728]">
              💖 追星收藏冊｜拍立得卡冊
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#8C7365]">
              珍藏每一張小卡（支援正反面對光切換）、手燈與周邊回憶！
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center">
          <div className="p-1 rounded-2xl bg-white border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728] flex items-center gap-1 text-xs font-black">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#FFE3EC] text-[#FF3B75] border border-[#4A3728]'
                  : 'text-[#8C7365]'
              }`}
              title="拍立得相簿"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#FFE3EC] text-[#FF3B75] border border-[#4A3728]'
                  : 'text-[#8C7365]'
              }`}
              title="清單檢視"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="sticker-btn px-4 py-2.5 rounded-full bg-[#FF5C8A] text-white text-xs font-black flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>新增收藏</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      {collectibles.length > 0 && (
        <div className="sketch-card bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C7365]" />
            <input
              type="text"
              placeholder="搜尋名稱、藝人、成員或備註..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-bold rounded-xl border-2 border-[#4A3728] bg-[#FFFDF7]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {uniqueGroups.length > 0 && (
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-black rounded-xl border-2 border-[#4A3728] bg-white text-[#4A3728]"
              >
                <option value="all">所有團體 / 藝人</option>
                {uniqueGroups.map(g => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            )}

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-black rounded-xl border-2 border-[#4A3728] bg-white text-[#4A3728]"
            >
              <option value="all">所有收藏狀態</option>
              {STATUS_LIST.map(st => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Clean Empty State */}
      {collectibles.length === 0 ? (
        <div className="sketch-dashed-box p-10 md:p-14 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FFE3EC] border-2 border-[#4A3728] shadow-[3px_3px_0px_#4A3728] flex items-center justify-center text-3xl">
            💖
          </div>
          <div>
            <h3 className="text-lg font-black text-[#4A3728]">
              目前尚未收藏任何周邊或小卡，新增你的第一筆珍藏吧！
            </h3>
            <p className="text-xs font-bold text-[#8C7365] mt-2 max-w-md mx-auto leading-relaxed">
              自由登錄小卡、專輯、手燈與限量周邊，支援正面與背面實拍照切換對光，輕鬆打造屬與你的拍立得珍藏冊！
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="sticker-btn px-6 py-3 rounded-full bg-[#FF5C8A] text-white text-xs font-black inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>＋ 新增第一筆收藏</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Polaroid Photo Wall */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredList.map((item, idx) => {
            const isFlipped = !!flippedCards[item.id];
            const displayImage = isFlipped && item.backPhotoUrl ? item.backPhotoUrl : item.photoUrl;

            return (
              <div
                key={item.id}
                onClick={() => openEditModal(item)}
                className="sketch-card bg-white p-4 flex flex-col justify-between relative group hover:-translate-y-1 transition-transform cursor-pointer"
              >
                {/* Washi Tape Strip */}
                <div
                  className={`washi-tape-${idx % 2 === 0 ? 'pink' : 'yellow'} absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-sm`}
                  style={{
                    transform: `translateX(-50%) rotate(${idx % 2 === 0 ? -3 : 3}deg)`
                  }}
                />

                <div>
                  {/* Polaroid Photo Window */}
                  <div className="h-44 rounded-2xl border-2 border-[#4A3728] bg-gradient-to-br from-[#FFEBF2] via-[#FFF8E7] to-[#EFE6FF] flex flex-col items-center justify-center relative mb-3 overflow-hidden shadow-inner">
                    <img
                      src={displayImage || DEFAULT_COLLECTIBLE_PHOTO}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black border border-[#4A3728] shadow-xs ${
                        item.status === '已到貨'
                          ? 'bg-[#E4FBF0] text-[#1E9E73]'
                          : 'bg-[#FFF3CD] text-[#B86E14]'
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Back Photo Flip Toggle */}
                    {item.backPhotoUrl && (
                      <button
                        type="button"
                        onClick={(e) => toggleCardFlip(e, item.id)}
                        className="absolute bottom-2 right-2 px-2 py-1 rounded-xl bg-[#4A3728] text-white text-[10px] font-black flex items-center gap-1 shadow-md hover:bg-[#FF3B75] transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isFlipped ? '正面' : '背面'}</span>
                      </button>
                    )}
                  </div>

                  <h4 className="font-black text-sm text-[#4A3728] line-clamp-1 mb-0.5">
                    {item.name}
                  </h4>
                  <p className="text-xs font-bold text-[#8C7365] line-clamp-1 mb-2">
                    {[item.group, item.member].filter(Boolean).join(' · ')}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-dashed border-[#E5D5C5] pt-2.5 text-xs font-bold">
                  <span className="font-mono-num text-[#8C7365]">
                    {item.purchaseDate}
                  </span>
                  <span className="font-mono-num font-black text-[#FF5C8A]">
                    NT$ {item.price.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="sketch-card bg-white p-6 space-y-2">
          {filteredList.map(item => (
            <div
              key={item.id}
              onClick={() => openEditModal(item)}
              className="p-3.5 rounded-2xl border-2 border-[#4A3728] bg-[#FFFDF7] flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FFE3EC] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-xl border-2 border-[#4A3728] overflow-hidden bg-slate-900 shrink-0">
                  <img
                    src={item.photoUrl || DEFAULT_COLLECTIBLE_PHOTO}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#4A3728]">
                      {item.name}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FFE3EC] border border-[#4A3728] text-[#FF5C8A]">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#8C7365] mt-0.5">
                    {[item.group, item.member].filter(Boolean).join(' · ')} {item.channel && ` · 管道: ${item.channel}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <span className="font-mono-num font-black text-sm text-[#FF5C8A]">
                  NT$ {item.price.toLocaleString()}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-[#4A3728] bg-[#E4FBF0] text-[#1E9E73]">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/45 backdrop-blur-xs overflow-y-auto">
          <div className="sketch-card relative w-full max-w-md my-8 bg-[#FFFDF7] p-6 animate-stamp space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#E5D5C5] pb-3">
              <h3 className="text-base font-black text-[#4A3728]">
                {editingItem ? '✏️ 編輯追星收藏商品' : '✨ 新增追星收藏商品'}
              </h3>
              <div className="flex items-center gap-2">
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('確定要移除此收藏嗎？')) {
                        deleteCollectible(editingItem.id);
                        setIsModalOpen(false);
                      }
                    }}
                    className="text-rose-600 hover:underline p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="sticker-btn-soft w-8 h-8 rounded-full bg-[#FFE3EC] flex items-center justify-center text-[#4A3728]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-bold">
              <div className="p-3.5 rounded-2xl bg-[#FFF8EB] border-2 border-[#4A3728] space-y-3">
                <span className="block font-black text-[#4A3728]">
                  📸 實拍小卡／周邊照片（支援正面與背面）
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#8C7365]">正面照片 *</span>
                    <div className="w-full aspect-[3/4] rounded-xl border-2 border-[#4A3728] overflow-hidden bg-slate-900">
                      <img src={photoUrl} alt="Front" className="w-full h-full object-cover" />
                    </div>
                    <input
                      ref={frontInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFrontUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isProcessingFront}
                      onClick={() => frontInputRef.current?.click()}
                      className="sticker-btn w-full py-1.5 text-[11px] font-black bg-[#FF5C8A] text-white rounded-xl"
                    >
                      {isProcessingFront ? '處理中...' : '上傳正面'}
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] text-[#8C7365]">背面照片（可選）</span>
                    <div className="w-full aspect-[3/4] rounded-xl border-2 border-[#4A3728] overflow-hidden bg-slate-900 flex items-center justify-center">
                      {backPhotoUrl ? (
                        <img src={backPhotoUrl} alt="Back" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2 text-[#8C7365]">
                          <Layers className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px]">無背面</span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={backInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleBackUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isProcessingBack}
                      onClick={() => backInputRef.current?.click()}
                      className="sticker-btn w-full py-1.5 text-[11px] font-black bg-[#8A5CF5] text-white rounded-xl"
                    >
                      {isProcessingBack ? '處理中...' : '上傳背面'}
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-500 font-bold">{uploadError}</p>
                )}
              </div>

              <div>
                <label className="block text-[#4A3728] mb-1">商品名稱 *</label>
                <input
                  type="text"
                  placeholder="例如：首爾限定特典卡..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#4A3728] mb-1">團體 / 藝人</label>
                  <input
                    type="text"
                    placeholder="五月天、TWICE"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3728] mb-1">成員</label>
                  <input
                    type="text"
                    placeholder="全體、阿信"
                    value={member}
                    onChange={e => setMember(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#4A3728] mb-1">購入價格 (NT$)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={e => setPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] bg-white font-mono-num font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3728] mb-1">收藏狀態</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as CollectibleStatus)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3728] bg-white"
                  >
                    {STATUS_LIST.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4A3728] mb-1">備註 / 卡況</label>
                <textarea
                  placeholder="備忘對光對卡..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] bg-white text-xs"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="sticker-btn-soft flex-1 py-2 text-xs font-black bg-white"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="sticker-btn flex-1 py-2 text-xs font-black text-white bg-[#FF5C8A]"
                >
                  {editingItem ? '儲存修改' : '確認新增'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
