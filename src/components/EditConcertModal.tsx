import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Ticket, DollarSign, Upload, AlertCircle, Plus, Globe } from 'lucide-react';
import { ConcertGoal, CurrencyCode } from '../types';
import { processGeneralImage } from '../utils/imageUtils';
import { DEFAULT_CONCERT_COVER } from '../assets/defaultAvatars';
import { CURRENCIES, getCurrencyConfig, calculateBudgetCurrencySums } from '../services/currencyService';

interface EditConcertModalProps {
  isOpen: boolean;
  onClose: () => void;
  concert: ConcertGoal | null; // null = CREATE MODE, non-null = EDIT MODE
  onSaveConcert: (concertId: string, updatedData: Partial<ConcertGoal>) => Promise<void> | void;
  onCreateConcert?: (newConcert: Omit<ConcertGoal, 'id' | 'allocatedFund' | 'status' | 'isPrimary'>) => Promise<void> | void;
}

export const EditConcertModal: React.FC<EditConcertModalProps> = ({
  isOpen,
  onClose,
  concert,
  onSaveConcert,
  onCreateConcert
}) => {
  const isEditMode = !!concert;

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [isDateTBA, setIsDateTBA] = useState(false);
  const [country, setCountry] = useState('台灣');
  const [city, setCity] = useState('台北');
  const [venue, setVenue] = useState('台北小巨蛋');
  const [coverImage, setCoverImage] = useState(DEFAULT_CONCERT_COVER);
  const [notes, setNotes] = useState('');

  // Multi-currency Budget plan
  const [mainCurrency, setMainCurrency] = useState<CurrencyCode>('TWD');
  const [ticketBudget, setTicketBudget] = useState(6800);
  const [ticketCurrency, setTicketCurrency] = useState<CurrencyCode>('TWD');

  const [travelBudget, setTravelBudget] = useState(1500);
  const [travelCurrency, setTravelCurrency] = useState<CurrencyCode>('TWD');

  const [lodgingBudget, setLodgingBudget] = useState(3000);
  const [lodgingCurrency, setLodgingCurrency] = useState<CurrencyCode>('TWD');

  const [merchBudget, setMerchBudget] = useState(3500);
  const [merchCurrency, setMerchCurrency] = useState<CurrencyCode>('TWD');

  const [otherBudget, setOtherBudget] = useState(1200);
  const [otherCurrency, setOtherCurrency] = useState<CurrencyCode>('TWD');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync main currency to items when user changes main currency
  const handleMainCurrencyChange = (newCurr: CurrencyCode) => {
    setMainCurrency(newCurr);
    setTicketCurrency(newCurr);
    setTravelCurrency(newCurr);
    setLodgingCurrency(newCurr);
    setMerchCurrency(newCurr);
    setOtherCurrency(newCurr);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (concert) {
      // Pre-fill Edit mode
      setTitle(concert.title || '');
      setArtist(concert.artist || '');
      setDate(concert.date || '');
      setIsDateTBA(!!concert.isDateTBA);
      setCountry(concert.country || '台灣');
      setCity(concert.city || '台北');
      setVenue(concert.venue || '台北小巨蛋');
      setCoverImage(concert.coverImage || DEFAULT_CONCERT_COVER);
      setNotes(concert.notes || '');

      const plan = concert.budgetPlan;
      const mCurr = plan?.mainCurrency || 'TWD';
      setMainCurrency(mCurr);

      setTicketBudget(plan?.ticket ?? 6800);
      setTicketCurrency(plan?.ticketCurrency || mCurr);

      setTravelBudget(plan?.travel ?? 1500);
      setTravelCurrency(plan?.travelCurrency || mCurr);

      setLodgingBudget(plan?.lodging ?? 3000);
      setLodgingCurrency(plan?.lodgingCurrency || mCurr);

      setMerchBudget(plan?.merchandise ?? 3500);
      setMerchCurrency(plan?.merchandiseCurrency || mCurr);

      setOtherBudget(plan?.other ?? 1200);
      setOtherCurrency(plan?.otherCurrency || mCurr);
    } else {
      // Reset for Create mode
      setTitle('');
      setArtist('');
      setDate('');
      setIsDateTBA(false);
      setCountry('台灣');
      setCity('台北');
      setVenue('台北小巨蛋');
      setCoverImage(DEFAULT_CONCERT_COVER);
      setNotes('');

      setMainCurrency('TWD');
      setTicketBudget(6800);
      setTicketCurrency('TWD');
      setTravelBudget(1500);
      setTravelCurrency('TWD');
      setLodgingBudget(3000);
      setLodgingCurrency('TWD');
      setMerchBudget(3500);
      setMerchCurrency('TWD');
      setOtherBudget(1200);
      setOtherCurrency('TWD');
    }

    setErrorMsg(null);
  }, [concert, isOpen]);

  if (!isOpen) return null;

  // Calculate converted TWD amounts for each item
  const ticketTwd = ticketBudget * (getCurrencyConfig(ticketCurrency).defaultRateToTWD || 1);
  const travelTwd = travelBudget * (getCurrencyConfig(travelCurrency).defaultRateToTWD || 1);
  const lodgingTwd = lodgingBudget * (getCurrencyConfig(lodgingCurrency).defaultRateToTWD || 1);
  const merchTwd = merchBudget * (getCurrencyConfig(merchCurrency).defaultRateToTWD || 1);
  const otherTwd = otherBudget * (getCurrencyConfig(otherCurrency).defaultRateToTWD || 1);

  const budgetItems = [
    { amount: ticketBudget, currency: ticketCurrency },
    { amount: travelBudget, currency: travelCurrency },
    { amount: lodgingBudget, currency: lodgingCurrency },
    { amount: merchBudget, currency: merchCurrency },
    { amount: otherBudget, currency: otherCurrency }
  ];
  const budgetBreakdown = calculateBudgetCurrencySums(budgetItems, mainCurrency);
  const totalBudgetTWD = budgetBreakdown.totalTWD;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setIsProcessingCover(true);

    try {
      const processed = await processGeneralImage(file, 800, 450, 0.82);
      setCoverImage(processed.dataUrl);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '封面圖片處理失敗');
    } finally {
      setIsProcessingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !artist.trim()) {
      setErrorMsg('請填寫演唱會名稱與藝人名稱！');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const budgetPlan = {
        ticket: ticketBudget,
        ticketCurrency,
        travel: travelBudget,
        travelCurrency,
        lodging: lodgingBudget,
        lodgingCurrency,
        merchandise: merchBudget,
        merchandiseCurrency: merchCurrency,
        other: otherBudget,
        otherCurrency,
        mainCurrency,
        total: totalBudgetTWD
      };

      const payload = {
        title: title.trim(),
        artist: artist.trim(),
        date: isDateTBA ? undefined : (date.trim() || undefined),
        isDateTBA,
        country: country.trim(),
        city: city.trim(),
        venue: venue.trim(),
        coverImage: coverImage || DEFAULT_CONCERT_COVER,
        notes: notes.trim(),
        budgetPlan
      };

      if (isEditMode && concert) {
        await onSaveConcert(concert.id, payload);
      } else if (onCreateConcert) {
        await onCreateConcert(payload);
      }

      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '處理失敗，請重試。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/45 backdrop-blur-xs overflow-y-auto">
      <div className="sketch-card relative w-full max-w-xl my-6 bg-[#FFFDF7] dark:bg-slate-900 border-2 border-[#4A3728] dark:border-slate-700 shadow-[6px_6px_0px_#4A3728] dark:shadow-[6px_6px_0px_#1e293b] p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-stamp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#FF5C8A]" />
            <h3 className="font-black text-base md:text-lg text-[#4A3728] dark:text-white">
              {isEditMode ? '✏️ 編輯演唱會旅程資料' : '✨ 建立新演唱會目標'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sticker-btn-soft w-8 h-8 rounded-full bg-[#FFE3EC] dark:bg-slate-800 flex items-center justify-center text-[#4A3728] dark:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                演唱會活動名稱 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：2026 WORLD TOUR..."
                className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                演出藝人 / 團體 *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="例：五月天 / SEVENTEEN / 周傑倫"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1 flex items-center justify-between">
                <span>演出日期</span>
                <label className="text-[11px] font-black text-[#FF5C8A] flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDateTBA}
                    onChange={(e) => setIsDateTBA(e.target.checked)}
                    className="accent-[#FF5C8A]"
                  />
                  <span>日期待公布</span>
                </label>
              </label>
              <input
                type="date"
                disabled={isDateTBA}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono-num font-bold text-[#4A3728] dark:text-slate-100 outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                國家與城市
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="國家 (台灣)"
                  className="w-full px-2.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
                />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="城市 (台北)"
                  className="w-full px-2.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                演出場館
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="台北小巨蛋 / 高雄巨蛋"
                className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Cover Photo */}
          <div className="p-3.5 rounded-2xl bg-[#FFF8EB] dark:bg-slate-800/80 border-2 border-[#4A3728] dark:border-slate-700 space-y-2">
            <label className="block text-[#4A3728] dark:text-slate-200 font-black">
              📸 演唱會主視覺封面照片
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-36 h-20 rounded-xl overflow-hidden border-2 border-[#4A3728] dark:border-slate-700 bg-slate-900 shrink-0">
                <img src={coverImage || DEFAULT_CONCERT_COVER} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-2 w-full">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isProcessingCover}
                    onClick={() => fileInputRef.current?.click()}
                    className="sticker-btn px-3.5 py-1.5 rounded-full bg-[#FF5C8A] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isProcessingCover ? '圖片處理中...' : '上傳專屬封面'}</span>
                  </button>

                  {coverImage !== DEFAULT_CONCERT_COVER && (
                    <button
                      type="button"
                      onClick={() => setCoverImage(DEFAULT_CONCERT_COVER)}
                      className="sticker-btn-soft px-3 py-1.5 rounded-full bg-white dark:bg-slate-700 text-[#4A3728] dark:text-slate-200 text-xs font-black"
                    >
                      使用預設
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Currency Budget Breakdown */}
          <div className="p-4 rounded-2xl bg-[#FFE3EC] dark:bg-rose-950/40 border-2 border-[#4A3728] dark:border-rose-800 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 border-b-2 border-dashed border-[#4A3728]/20 dark:border-rose-800 gap-2">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#FF5C8A]" />
                <span className="text-xs font-black text-[#4A3728] dark:text-rose-200">
                  多幣種預算劃分
                </span>
                <div className="flex items-center gap-1 ml-2 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-[#4A3728]">
                  <Globe className="w-3 h-3 text-[#FF5C8A]" />
                  <span className="text-[10px] text-[#8C7365] dark:text-slate-300">主幣種:</span>
                  <select
                    value={mainCurrency}
                    onChange={(e) => handleMainCurrencyChange(e.target.value as CurrencyCode)}
                    className="bg-transparent text-[11px] font-bold text-[#4A3728] dark:text-slate-100 outline-none cursor-pointer"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col items-end text-right">
                {budgetBreakdown.isSingleCurrency ? (
                  <span className="text-xs font-mono-num font-black text-[#FF3B75] dark:text-rose-300">
                    總預算：{budgetBreakdown.sums[0].flag} {budgetBreakdown.sums[0].symbol} {budgetBreakdown.sums[0].amount.toLocaleString()} ({budgetBreakdown.sums[0].code})
                    {budgetBreakdown.sums[0].code !== 'TWD' && (
                      <span className="text-[10px] text-[#8C7365] dark:text-slate-400 font-bold ml-1">
                        (≈ NT$ {totalBudgetTWD.toLocaleString()})
                      </span>
                    )}
                  </span>
                ) : (
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono-num font-black text-[#FF3B75] dark:text-rose-300 flex flex-wrap items-center justify-end gap-1">
                      <span className="text-[#4A3728] dark:text-slate-200 text-xs font-bold">各幣種小計：</span>
                      {budgetBreakdown.sums.map((sumItem, idx) => (
                        <span key={sumItem.code} className="inline-flex items-center gap-0.5 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-[#FF5C8A]">
                          <span>{sumItem.flag}</span>
                          <span>{sumItem.symbol} {sumItem.amount.toLocaleString()}</span>
                          <span className="text-[10px] text-[#8C7365] dark:text-slate-400 font-bold">{sumItem.code}</span>
                          {idx < budgetBreakdown.sums.length - 1 && <span className="text-[#FF5C8A] font-black ml-1">+</span>}
                        </span>
                      ))}
                    </div>
                    <div className="text-[10px] font-mono-num font-bold text-[#8C7365] dark:text-slate-400 text-right">
                      ≈ 預估折合 NT$ {totalBudgetTWD.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Ticket */}
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-[#4A3728]/30">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8C7365] dark:text-slate-300 font-bold">
                    🎟️ 門票預算
                  </label>
                  <select
                    value={ticketCurrency}
                    onChange={(e) => setTicketCurrency(e.target.value as CurrencyCode)}
                    className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-[#4A3728] rounded px-1 py-0.5"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  value={ticketBudget || ''}
                  onChange={(e) => setTicketBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num font-bold text-[#4A3728] dark:text-slate-100"
                />
                {ticketCurrency !== 'TWD' && (
                  <p className="text-[10px] text-[#8C7365] dark:text-slate-400 mt-1 font-mono-num">
                    ≈ NT$ {Math.round(ticketTwd).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Travel */}
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-[#4A3728]/30">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8C7365] dark:text-slate-300 font-bold">
                    🚆 交通機票
                  </label>
                  <select
                    value={travelCurrency}
                    onChange={(e) => setTravelCurrency(e.target.value as CurrencyCode)}
                    className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-[#4A3728] rounded px-1 py-0.5"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  value={travelBudget || ''}
                  onChange={(e) => setTravelBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num font-bold text-[#4A3728] dark:text-slate-100"
                />
                {travelCurrency !== 'TWD' && (
                  <p className="text-[10px] text-[#8C7365] dark:text-slate-400 mt-1 font-mono-num">
                    ≈ NT$ {Math.round(travelTwd).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Lodging */}
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-[#4A3728]/30">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8C7365] dark:text-slate-300 font-bold">
                    🏨 飯店住宿
                  </label>
                  <select
                    value={lodgingCurrency}
                    onChange={(e) => setLodgingCurrency(e.target.value as CurrencyCode)}
                    className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-[#4A3728] rounded px-1 py-0.5"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  value={lodgingBudget || ''}
                  onChange={(e) => setLodgingBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num font-bold text-[#4A3728] dark:text-slate-100"
                />
                {lodgingCurrency !== 'TWD' && (
                  <p className="text-[10px] text-[#8C7365] dark:text-slate-400 mt-1 font-mono-num">
                    ≈ NT$ {Math.round(lodgingTwd).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Merchandise */}
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-[#4A3728]/30">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8C7365] dark:text-slate-300 font-bold">
                    🍭 周邊周邊
                  </label>
                  <select
                    value={merchCurrency}
                    onChange={(e) => setMerchCurrency(e.target.value as CurrencyCode)}
                    className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-[#4A3728] rounded px-1 py-0.5"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  value={merchBudget || ''}
                  onChange={(e) => setMerchBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num font-bold text-[#4A3728] dark:text-slate-100"
                />
                {merchCurrency !== 'TWD' && (
                  <p className="text-[10px] text-[#8C7365] dark:text-slate-400 mt-1 font-mono-num">
                    ≈ NT$ {Math.round(merchTwd).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Other */}
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-[#4A3728]/30 sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[#8C7365] dark:text-slate-300 font-bold">
                    📦 雜項預備金
                  </label>
                  <select
                    value={otherCurrency}
                    onChange={(e) => setOtherCurrency(e.target.value as CurrencyCode)}
                    className="text-[10px] font-bold bg-white dark:bg-slate-800 border border-[#4A3728] rounded px-1 py-0.5"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="number"
                  min="0"
                  value={otherBudget || ''}
                  onChange={(e) => setOtherBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num font-bold text-[#4A3728] dark:text-slate-100"
                />
                {otherCurrency !== 'TWD' && (
                  <p className="text-[10px] text-[#8C7365] dark:text-slate-400 mt-1 font-mono-num">
                    ≈ NT$ {Math.round(otherTwd).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
              📝 搶票備忘錄 / 應援計畫
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="記錄搶票時間、同行友人、應援物或搶票密碼策略..."
              className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="sticker-btn-soft flex-1 py-2.5 text-xs font-black bg-white dark:bg-slate-800 text-[#4A3728] dark:text-slate-200 rounded-xl"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="sticker-btn flex-1 py-2.5 text-xs font-black text-white bg-[#FF5C8A] hover:bg-[#FF4785] rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4 stroke-[3]" />}
              <span>{isSaving ? '處理中...' : isEditMode ? '儲存演唱會修改' : '確認建立演唱會'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
