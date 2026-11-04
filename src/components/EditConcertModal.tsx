import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, MapPin, DollarSign, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { ConcertGoal } from '../types';
import { processGeneralImage } from '../utils/imageUtils';
import { DEFAULT_CONCERT_COVER } from '../assets/defaultAvatars';

interface EditConcertModalProps {
  isOpen: boolean;
  onClose: () => void;
  concert: ConcertGoal | null;
  onSaveConcert: (concertId: string, updatedData: Partial<ConcertGoal>) => Promise<void> | void;
}

export const EditConcertModal: React.FC<EditConcertModalProps> = ({
  isOpen,
  onClose,
  concert,
  onSaveConcert
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [date, setDate] = useState('');
  const [isDateTBA, setIsDateTBA] = useState(false);
  const [country, setCountry] = useState('台灣');
  const [city, setCity] = useState('台北');
  const [venue, setVenue] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [notes, setNotes] = useState('');

  // Budget plan
  const [ticketBudget, setTicketBudget] = useState(0);
  const [travelBudget, setTravelBudget] = useState(0);
  const [lodgingBudget, setLodgingBudget] = useState(0);
  const [merchBudget, setMerchBudget] = useState(0);
  const [otherBudget, setOtherBudget] = useState(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (concert && isOpen) {
      setTitle(concert.title);
      setArtist(concert.artist);
      setDate(concert.date || '');
      setIsDateTBA(!!concert.isDateTBA);
      setCountry(concert.country);
      setCity(concert.city);
      setVenue(concert.venue);
      setCoverImage(concert.coverImage || DEFAULT_CONCERT_COVER);
      setNotes(concert.notes || '');

      setTicketBudget(concert.budgetPlan.ticket || 0);
      setTravelBudget(concert.budgetPlan.travel || 0);
      setLodgingBudget(concert.budgetPlan.lodging || 0);
      setMerchBudget(concert.budgetPlan.merchandise || 0);
      setOtherBudget(concert.budgetPlan.other || 0);

      setErrorMsg(null);
    }
  }, [concert, isOpen]);

  if (!isOpen || !concert) return null;

  const totalBudget = ticketBudget + travelBudget + lodgingBudget + merchBudget + otherBudget;

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await processGeneralImage(file, 800, 800, 0.8);
      setCoverImage(processed.dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || '封面圖片處理失敗');
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
      const updatedPlan = {
        ticket: ticketBudget,
        travel: travelBudget,
        lodging: lodgingBudget,
        merchandise: merchBudget,
        other: otherBudget,
        total: totalBudget
      };

      await onSaveConcert(concert.id, {
        title: title.trim(),
        artist: artist.trim(),
        date: isDateTBA ? undefined : date,
        isDateTBA,
        country: country.trim(),
        city: city.trim(),
        venue: venue.trim(),
        coverImage,
        notes: notes.trim(),
        budgetPlan: updatedPlan
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '更新失敗，請稍後再試。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              編輯演唱會旅程資料
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

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Title & Artist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                演唱會活動名稱 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例：READY TO BE WORLD TOUR"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                演出藝人 / 團體 *
              </label>
              <input
                type="text"
                required
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="例：TWICE / SEVENTEEN"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>

          {/* Date & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>演出日期</span>
                <label className="text-[11px] font-normal text-pink-500 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDateTBA}
                    onChange={(e) => setIsDateTBA(e.target.checked)}
                    className="accent-pink-500"
                  />
                  <span>待公布</span>
                </label>
              </label>
              <input
                type="date"
                disabled={isDateTBA}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                城市與國家
              </label>
              <input
                type="text"
                value={`${city} (${country})`}
                onChange={(e) => setCity(e.target.value)}
                placeholder="台北 (台灣)"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                演出場館
              </label>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="台北小巨蛋 / 高雄巨蛋"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              演唱會主視覺封面圖片
            </label>
            <div className="flex items-center gap-3">
              <div className="w-20 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
              <label className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-pink-500" />
                <span>上傳新封面</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Budget Breakdown */}
          <div className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/50 dark:border-pink-900/30 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-pink-200/40">
              <span className="text-xs font-bold text-pink-700 dark:text-pink-300 flex items-center gap-1">
                <DollarSign className="w-4 h-4" /> 預算規劃細項 (NT$)
              </span>
              <span className="text-xs font-black font-mono text-purple-600 dark:text-purple-400">
                總預算：NT$ {totalBudget.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  🎟️ 門票預算
                </label>
                <input
                  type="number"
                  min="0"
                  value={ticketBudget || ''}
                  onChange={(e) => setTicketBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  🚆 交通開銷
                </label>
                <input
                  type="number"
                  min="0"
                  value={travelBudget || ''}
                  onChange={(e) => setTravelBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  🏨 住宿費用
                </label>
                <input
                  type="number"
                  min="0"
                  value={lodgingBudget || ''}
                  onChange={(e) => setLodgingBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  🛍️ 周邊商品
                </label>
                <input
                  type="number"
                  min="0"
                  value={merchBudget || ''}
                  onChange={(e) => setMerchBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-0.5">
                  📦 雜項預備
                </label>
                <input
                  type="number"
                  min="0"
                  value={otherBudget || ''}
                  onChange={(e) => setOtherBudget(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              搶票備忘錄 / 應援計畫
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="記錄搶票時間、同行友人、應援物或搶票密碼策略..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-pink-500 outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-pink-500/25 hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? '儲存變更中...' : '儲存演唱會修改'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
