import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  HeartHandshake,
  Plus,
  Search,
  LayoutGrid,
  List,
  Filter,
  Trash2,
  ExternalLink,
  Sparkles,
  Tag,
  Check,
  Package
} from 'lucide-react';
import { Collectible, CollectibleStatus } from '../types';

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

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Collectible | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [group, setGroup] = useState('TWICE');
  const [artist, setArtist] = useState('TWICE');
  const [member, setMember] = useState('全體');
  const [category, setCategory] = useState('小卡、特典卡');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(350);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [channel, setChannel] = useState('社團收購');
  const [status, setStatus] = useState<CollectibleStatus>('已到貨');
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('/src/assets/images/idol_character_superstar_1793698981923.jpg');

  // Unique groups in collection for filter dropdown
  const uniqueGroups = useMemo(() => {
    const set = new Set(collectibles.map(c => c.group));
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
        const matchGroup = c.group.toLowerCase().includes(q);
        const matchMember = c.member.toLowerCase().includes(q);
        const matchNote = c.note.toLowerCase().includes(q);
        return matchName || matchGroup || matchMember || matchNote;
      }
      return true;
    });
  }, [collectibles, statusFilter, groupFilter, search]);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setGroup('TWICE');
    setArtist('TWICE');
    setMember('全體');
    setCategory('小卡、特典卡');
    setQuantity(1);
    setPrice(350);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setChannel('官方快閃店/唱片行');
    setStatus('已到貨');
    setNote('');
    setPhotoUrl('/src/assets/images/idol_character_superstar_1793698981923.jpg');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Collectible) => {
    setEditingItem(item);
    setName(item.name);
    setGroup(item.group);
    setArtist(item.artist);
    setMember(item.member);
    setCategory(item.category);
    setQuantity(item.quantity);
    setPrice(item.price);
    setPurchaseDate(item.purchaseDate);
    setChannel(item.channel);
    setStatus(item.status);
    setNote(item.note);
    setPhotoUrl(item.photoUrl);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      updateCollectible(editingItem.id, {
        name: name.trim(),
        group: group.trim(),
        artist: artist.trim(),
        member: member.trim(),
        category,
        quantity,
        price,
        purchaseDate,
        channel: channel.trim(),
        status,
        note: note.trim(),
        photoUrl
      });
    } else {
      addCollectible({
        name: name.trim(),
        group: group.trim(),
        artist: artist.trim(),
        member: member.trim(),
        category,
        quantity,
        price,
        purchaseDate,
        channel: channel.trim(),
        status,
        note: note.trim(),
        photoUrl
      });
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
            珍藏每一張小卡、手燈與周邊回憶，精準管理商品物流與交易狀態
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

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋收藏名稱、成員或備註..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>

        {/* Group Filter & Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <select
            value={groupFilter}
            onChange={e => setGroupFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">所有偶像團體</option>
            {uniqueGroups.map(g => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

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

      {/* Photo Wall Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredList.length > 0 ? (
            filteredList.map(item => (
              <div
                key={item.id}
                onClick={() => openEditModal(item)}
                className="group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Photo frame */}
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={item.photoUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Status Badge */}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-xs ${
                      item.status === '已到貨'
                        ? 'bg-emerald-500/90 text-white'
                        : item.status === '待到貨'
                        ? 'bg-amber-500/90 text-white'
                        : item.status === '已轉售'
                        ? 'bg-slate-500/90 text-white'
                        : 'bg-pink-500/90 text-white'
                    }`}
                  >
                    {item.status}
                  </span>

                  {item.linkedTransactionId && (
                    <span
                      className="absolute top-2 right-2 p-1 bg-black/60 text-pink-400 rounded-md text-[9px] font-mono"
                      title="已連動記帳系統"
                    >
                      🔗
                    </span>
                  )}
                </div>

                {/* Info block */}
                <div className="p-3">
                  <div className="text-[10px] text-pink-600 dark:text-pink-400 font-semibold truncate">
                    {item.group} · {item.member}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                    {item.name}
                  </h5>
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono">
                      x{item.quantity}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      NT$ {item.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
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
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-pink-500 font-semibold">
                        {item.group} · {item.member}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.purchaseDate} · 管道: {item.channel}
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
          <div className="w-full max-w-md my-8 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
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

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  商品名稱 *
                </label>
                <input
                  type="text"
                  placeholder="例如：CandyBong ∞ 官方手燈"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    團體名稱
                  </label>
                  <input
                    type="text"
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
                  placeholder="例如：官方快閃店、五大唱片、換卡社團"
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
                  placeholder="例如：無損對光漂亮、已放入專用防潮箱..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-16"
                />
              </div>

              {/* Photo Preset selection */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  商品封面照片
                </label>
                <div className="flex gap-2">
                  {[
                    '/src/assets/images/idol_character_trainee_1793698980118.jpg',
                    '/src/assets/images/idol_character_stage_star_1793698980767.jpg',
                    '/src/assets/images/idol_character_superstar_1793698981923.jpg'
                  ].map((imgSrc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPhotoUrl(imgSrc)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        photoUrl === imgSrc ? 'border-pink-500 scale-105' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={imgSrc} alt="Preset" className="w-full h-full object-cover" />
                      {photoUrl === imgSrc && (
                        <span className="absolute bottom-0 right-0 bg-pink-500 text-white p-0.5 rounded-tl">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
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
                  儲存收藏
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
