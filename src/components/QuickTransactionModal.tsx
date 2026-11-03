import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { TxType, CategoryGroup, DailyCategory, IdolCategory, IncomeCategory } from '../types';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

const DAILY_CATEGORIES: DailyCategory[] = [
  '飲食',
  '交通',
  '購物',
  '娛樂',
  '生活用品',
  '其他'
];

const IDOL_CATEGORIES: IdolCategory[] = [
  '小卡、特典卡',
  '專輯、唱片',
  '官方周邊',
  '非官方周邊、娃娃',
  '演唱會、見面會',
  '交通、住宿、旅遊',
  '應援、集資、生日活動',
  '代購、代付、運費',
  '影音、會員、平台訂閱',
  '拍立得、簽售、線下活動',
  '其他追星支出'
];

const INCOME_CATEGORIES: IncomeCategory[] = [
  '薪水',
  '零用錢',
  '獎金',
  '其他收入'
];

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultDate
}) => {
  const { accounts, addTransaction, selectedDate } = useApp();

  const [isDetailed, setIsDetailed] = useState(false);
  const [type, setType] = useState<TxType>('expense');
  const [date, setDate] = useState<string>(defaultDate || selectedDate || new Date().toISOString().split('T')[0]);
  const [categoryGroup, setCategoryGroup] = useState<CategoryGroup>('daily');
  const [category, setCategory] = useState<string>('飲食');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || 'acc_linepay');
  const [amountStr, setAmountStr] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [itemName, setItemName] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('');
  const [artistName, setArtistName] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');
  const [itemType, setItemType] = useState<string>('官方周邊');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [otherFee, setOtherFee] = useState<number>(0);
  const [platform, setPlatform] = useState<string>('官方通路');
  const [isArrived, setIsArrived] = useState<boolean>(true);
  const [syncToCollection, setSyncToCollection] = useState<boolean>(true);
  const [photoPreset, setPhotoPreset] = useState<string>('/src/assets/images/idol_character_stage_star_1793698980767.jpg');

  if (!isOpen) return null;

  // Auto calculate amount in detailed mode when prices change
  const handleCalculateDetailedAmount = (qty: number, price: number, ship: number, other: number) => {
    const total = qty * price + ship + other;
    if (total > 0) {
      setAmountStr(String(total));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = parseInt(amountStr, 10);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert('請輸入有效的交易金額！');
      return;
    }

    addTransaction({
      date,
      type,
      amount: finalAmount,
      categoryGroup: type === 'income' ? 'daily' : categoryGroup,
      category,
      accountId,
      note: note.trim() || (isDetailed ? itemName : `${category}支出`),
      detailedItem:
        type === 'expense' && (isDetailed || categoryGroup === 'idol')
          ? {
              itemName: itemName || note || category,
              photoUrl: photoPreset,
              groupName,
              artistName,
              memberName: memberName || '全體',
              itemType: itemType || category,
              quantity,
              unitPrice: unitPrice || finalAmount,
              shippingFee,
              otherFee,
              platform,
              isArrived,
              syncToCollection
            }
          : undefined
    });

    // Reset form
    setAmountStr('');
    setNote('');
    setItemName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ⚡ 經紀室｜快速記帳
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                記錄每一筆日常與應援消費，積少成多前進演唱會！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Top Switcher: Simple vs Detailed */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            {/* Income / Expense Tabs */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setType('expense');
                  setCategory(DAILY_CATEGORIES[0]);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                💸 支出
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('income');
                  setCategory(INCOME_CATEGORIES[0]);
                }}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  type === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                💰 收入
              </button>
            </div>

            {/* Detailed Mode Toggle (only for expenses) */}
            {type === 'expense' && (
              <button
                type="button"
                onClick={() => setIsDetailed(!isDetailed)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isDetailed
                    ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800'
                    : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{isDetailed ? '詳細追星模式 (開)' : '切換詳細模式'}</span>
              </button>
            )}
          </div>

          {/* Date & Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                ✍️ 選擇交易日期
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                💳 收付款帳戶或方式
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type === 'credit_card' ? '未結帳單' : '餘額'}: NT$ {acc.balance.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expense Category Group (Daily vs Idol) */}
          {type === 'expense' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                🏷️ 收支分類類別
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setCategoryGroup('daily');
                    setCategory(DAILY_CATEGORIES[0]);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    categoryGroup === 'daily'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🍱 日常生活開銷
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryGroup('idol');
                    setCategory(IDOL_CATEGORIES[0]);
                  }}
                  className={`py-1.5 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    categoryGroup === 'idol'
                      ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-300 dark:border-pink-800 text-pink-700 dark:text-pink-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  🎤 追星應援消費
                </button>
              </div>

              {/* Specific Category Pill Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                {(categoryGroup === 'daily' ? DAILY_CATEGORIES : IDOL_CATEGORIES).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-1.5 text-xs rounded-lg text-center transition-all truncate ${
                      category === cat
                        ? 'bg-pink-500 text-white font-medium shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Income Categories */}
          {type === 'income' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                💰 收入來源分類
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {INCOME_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1.5 text-xs rounded-xl text-center transition-all ${
                      category === cat
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              💰 交易金額（NT$ 新台幣）
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-pink-500">
                NT$
              </span>
              <input
                type="number"
                min="1"
                placeholder="0"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              📝 消費備註／應援項目
            </label>
            <input
              type="text"
              placeholder="例如：午餐便當、打歌服材料、演唱會交通費、特典小卡"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Detailed Mode Section */}
          {type === 'expense' && isDetailed && (
            <div className="p-4 rounded-xl bg-pink-50/50 dark:bg-slate-800/60 border border-pink-200 dark:border-pink-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                  💖 追星商品詳細資訊與收藏庫連動
                </span>
                <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncToCollection}
                    onChange={e => setSyncToCollection(e.target.checked)}
                    className="rounded text-pink-500 focus:ring-pink-400"
                  />
                  <span>同步加入追星收藏冊</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">商品名稱</label>
                  <input
                    type="text"
                    placeholder="例如：紀念演唱會T恤、官方手燈、特典小卡"
                    value={itemName}
                    onChange={e => setItemName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">團體 / 藝人</label>
                  <input
                    type="text"
                    placeholder="例如：五月天、Taylor Swift、周杰倫、TWICE"
                    value={groupName}
                    onChange={e => {
                      setGroupName(e.target.value);
                      setArtistName(e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">成員（可選）</label>
                  <input
                    type="text"
                    placeholder="例如：全體、阿信、泰勒絲"
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">購買管道 / 平台</label>
                  <input
                    type="text"
                    placeholder="例如：官方通路、唱片行、現場、社團"
                    value={platform}
                    onChange={e => setPlatform(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Math breakdown */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">數量</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => {
                      const q = parseInt(e.target.value, 10) || 1;
                      setQuantity(q);
                      handleCalculateDetailedAmount(q, unitPrice, shippingFee, otherFee);
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">單價</label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={e => {
                      const p = parseInt(e.target.value, 10) || 0;
                      setUnitPrice(p);
                      handleCalculateDetailedAmount(quantity, p, shippingFee, otherFee);
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">運費</label>
                  <input
                    type="number"
                    min="0"
                    value={shippingFee}
                    onChange={e => {
                      const s = parseInt(e.target.value, 10) || 0;
                      setShippingFee(s);
                      handleCalculateDetailedAmount(quantity, unitPrice, s, otherFee);
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">其他手續費</label>
                  <input
                    type="number"
                    min="0"
                    value={otherFee}
                    onChange={e => {
                      const o = parseInt(e.target.value, 10) || 0;
                      setOtherFee(o);
                      handleCalculateDetailedAmount(quantity, unitPrice, shippingFee, o);
                    }}
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-center"
                  />
                </div>
              </div>

              {/* Arrival status */}
              <div className="flex items-center gap-4 text-xs">
                <span className="text-slate-500 dark:text-slate-400">物流到貨狀態：</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="arrival"
                    checked={isArrived}
                    onChange={() => setIsArrived(true)}
                  />
                  <span>已收到實體</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="arrival"
                    checked={!isArrived}
                    onChange={() => setIsArrived(false)}
                  />
                  <span>運送待到貨中</span>
                </label>
              </div>

              {/* Photo Preset selection */}
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  📸 選擇商品封面插畫
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
                      onClick={() => setPhotoPreset(imgSrc)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        photoPreset === imgSrc ? 'border-pink-500 scale-105 shadow-sm' : 'border-transparent opacity-60'
                      }`}
                    >
                      <img src={imgSrc} alt="Preset" className="w-full h-full object-cover" />
                      {photoPreset === imgSrc && (
                        <span className="absolute bottom-0 right-0 bg-pink-500 text-white p-0.5 rounded-tl">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all transform active:scale-98 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>✨ 儲存本次收支紀錄</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
