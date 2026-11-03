import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Plus,
  Search,
  LayoutGrid,
  List,
  Trash2,
  Check,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  X,
  Package,
  Layers
} from 'lucide-react';
import { Collectible, CollectibleStatus } from '../types';
import { processGeneralImage } from '../utils/imageUtils';

export const DEFAULT_COLLECTIBLE_PHOTO = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800'><defs><linearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%23fdf2f8'/><stop offset='50%25' stop-color='%23fae8ff'/><stop offset='100%25' stop-color='%23ede9fe'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23bg)'/><rect x='30' y='30' width='540' height='740' rx='28' fill='%23ffffff' stroke='%23f472b6' stroke-width='3' stroke-dasharray='8 8'/><circle cx='300' cy='360' r='85' fill='%23fce7f3'/><text x='50%25' y='46%25' dominant-baseline='middle' text-anchor='middle' font-size='60'>💖</text><text x='50%25' y='59%25' dominant-baseline='middle' text-anchor='middle' fill='%23ec4899' font-family='sans-serif' font-weight='bold' font-size='24' letter-spacing='1'>STAR WALK 追星收藏卡</text><text x='50%25' y='65%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='15'>支援正面與背面實拍照</text></svg>";

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

  // Toggle card flip (front <-> back)
  const toggleCardFlip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Unique groups in collection for filter dropdown
  const uniqueGroups = useMemo(() => {
    const set = new Set(collectibles.map(c => c.group).filter(Boolean));
    return Array.from(set);
  }, [collectibles]);

  // Filtered list
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

  // Handle Front Photo Upload
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

  // Handle Back Photo Upload
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-pink-500" />
            <span>💖 我的追星收藏冊</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            珍藏每一張小卡（支援正反面照片切換）、手燈與周邊回憶，精準管理商品物流與交易狀態
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                  : 'text-slate-500'
              }`}
              title="照片牆模式"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                  : 'text-slate-500'
              }`}
              title="清單模式"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>新增收藏</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar if collection has items */}
      {collectibles.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋收藏名稱、藝人、成員或備註..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Group Filter & Status Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {uniqueGroups.length > 0 && (
              <select
                value={groupFilter}
                onChange={e => setGroupFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
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
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
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

      {/* Clean Empty State when collectibles === 0 */}
      {collectibles.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-pink-200 dark:border-pink-900/40 p-10 md:p-14 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
            💖
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              目前尚未收藏任何周邊或小卡，點擊上方「+ 新增收藏」建立你的第一筆珍藏！
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              自訂偶像藝人與商品分類，支援上傳正面與背面實拍照、記錄購入價格、收卡管道與對光卡況，打造專屬於你的美型卡冊！
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>＋ 新增第一筆收藏</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Photo Wall Mode */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredList.length > 0 ? (
            filteredList.map(item => {
              const isFlipped = !!flippedCards[item.id];
              const displayImage = isFlipped && item.backPhotoUrl ? item.backPhotoUrl : item.photoUrl;

              return (
                <div
                  key={item.id}
                  onClick={() => openEditModal(item)}
                  className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  {/* Photo frame */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={displayImage || DEFAULT_COLLECTIBLE_PHOTO}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Status badge */}
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                        item.status === '已到貨'
                          ? 'bg-emerald-500 text-white'
                          : item.status === '待到貨'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-800/80 text-white'
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Back Photo Flip Toggle Button */}
                    {item.backPhotoUrl && (
                      <button
                        type="button"
                        onClick={(e) => toggleCardFlip(e, item.id)}
                        title={isFlipped ? '切換為正面' : '查看小卡背面'}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-pink-600 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs transition-colors shadow-md"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{isFlipped ? '正面' : '背面'}</span>
                      </button>
                    )}
                  </div>

                  {/* Card Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-1 text-[10px] text-pink-500 font-semibold truncate">
                      {item.group && <span>{item.group}</span>}
                      {item.group && item.member && <span>·</span>}
                      {item.member && <span>{item.member}</span>}
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5" title={item.name}>
                      {item.name}
                    </h4>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                      <span className="text-slate-400">{item.category}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        NT$ {item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              目前尚無符合的收藏商品，點擊右上角新增收藏吧！
            </div>
          )}
        </div>
      ) : (
        /* List Mode */
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredList.map(item => (
              <div
                key={item.id}
                onClick={() => openEditModal(item)}
                className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                    <img
                      src={item.photoUrl || DEFAULT_COLLECTIBLE_PHOTO}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {item.backPhotoUrl && (
                      <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-purple-600 text-white text-[8px] font-bold rounded-tl">
                        雙面
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      {(item.group || item.member) && (
                        <span className="text-[10px] text-pink-500 font-semibold">
                          {[item.group, item.member].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.purchaseDate} {item.channel ? `· 管道: ${item.channel}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      NT$ {item.price.toLocaleString()}
                    </span>
                    <div className="text-[10px] text-slate-400">數量: {item.quantity}</div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      item.status === '已到貨'
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.status === '待到貨'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md my-8 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem ? '✏️ 編輯追星收藏商品' : '✨ 新增追星收藏商品'}
              </h3>
              {editingItem && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('確定要從收藏冊移除此商品嗎？')) {
                      deleteCollectible(editingItem.id);
                      setIsModalOpen(false);
                    }
                  }}
                  className="text-rose-500 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Dual Photo Upload: Front & Back */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="block font-bold text-slate-800 dark:text-slate-200">
                  📸 實拍小卡／周邊照片（支援正面與背面）
                </span>

                <div className="grid grid-cols-2 gap-3">
                  {/* Front Photo Input */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      正面照片 *
                    </span>
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 relative shadow-xs">
                      <img
                        src={photoUrl || DEFAULT_COLLECTIBLE_PHOTO}
                        alt="Front"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
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
                      className="w-full py-1.5 text-[11px] font-bold rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors"
                    >
                      {isProcessingFront ? '處理中...' : '上傳正面照片'}
                    </button>
                  </div>

                  {/* Back Photo Input */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      背面照片（可選）
                    </span>
                    <div className="w-full aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 relative shadow-xs flex items-center justify-center">
                      {backPhotoUrl ? (
                        <img
                          src={backPhotoUrl}
                          alt="Back"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-2 text-slate-400">
                          <Layers className="w-6 h-6 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px]">尚未上傳背面</span>
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
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={isProcessingBack}
                        onClick={() => backInputRef.current?.click()}
                        className="flex-1 py-1.5 text-[11px] font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        {isProcessingBack ? '處理中...' : '上傳背面'}
                      </button>
                      {backPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setBackPhotoUrl('')}
                          className="px-2 py-1.5 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100"
                          title="移除背面照片"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-[11px] text-rose-500 font-medium">{uploadError}</p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  商品名稱 *
                </label>
                <input
                  type="text"
                  placeholder="例如：首爾限定特典卡、官方應援手燈、親簽明信片..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    團體 / 藝人名稱
                  </label>
                  <input
                    type="text"
                    placeholder="例如：五月天、Taylor Swift、NewJeans"
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    成員（可填全體）
                  </label>
                  <input
                    type="text"
                    placeholder="例如：阿信、全體"
                    value={member}
                    onChange={e => setMember(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    商品分類
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="小卡、特典卡">小卡、特典卡</option>
                    <option value="官方周邊">官方周邊</option>
                    <option value="專輯、唱片">專輯、唱片</option>
                    <option value="非官方周邊、娃娃">非官方周邊、娃娃</option>
                    <option value="演唱會紀念品">演唱會紀念品</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    收藏狀態
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as CollectibleStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    {STATUS_LIST.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    數量
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    購入價格 (NT$)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={e => setPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  購買管道 / 取得方式
                </label>
                <input
                  type="text"
                  placeholder="例如：官方快閃店、五大唱片、卡友交換、演唱會現場"
                  value={channel}
                  onChange={e => setChannel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  備註／卡況紀錄
                </label>
                <textarea
                  placeholder="例如：無損對光漂亮、已放入專用防潮箱、背面有官方防偽標籤..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-16"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl"
                >
                  {editingItem ? '儲存修改' : '儲存收藏'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
