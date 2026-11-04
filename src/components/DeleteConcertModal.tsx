import React from 'react';
import { AlertTriangle, Trash2, X, RefreshCw, ShieldCheck } from 'lucide-react';
import { ConcertGoal } from '../types';

interface DeleteConcertModalProps {
  isOpen: boolean;
  onClose: () => void;
  concert: ConcertGoal | null;
  onConfirmDelete: (concertId: string) => Promise<void> | void;
}

export const DeleteConcertModal: React.FC<DeleteConcertModalProps> = ({
  isOpen,
  onClose,
  concert,
  onConfirmDelete
}) => {
  if (!isOpen || !concert) return null;

  const hasAllocatedFunds = concert.allocatedFund > 0;
  const hasTicketStub = !!concert.ticketStub;

  const handleConfirm = async () => {
    await onConfirmDelete(concert.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-rose-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-black text-lg text-slate-900 dark:text-white">
              確認刪除演唱會旅程？
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Concert Overview Card */}
        <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/40 flex items-center gap-3">
          <img
            src={concert.coverImage}
            alt={concert.title}
            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-rose-200/60"
          />
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
              {concert.artist}
            </span>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
              {concert.title}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              📅 {concert.date || '日期未定'} · 📍 {concert.city}
            </p>
          </div>
        </div>

        {/* Warnings & Explanations */}
        <div className="space-y-2.5 text-xs">
          {hasAllocatedFunds && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">資金自動釋放：</span>
                目前已為此演唱會分配之專屬儲蓄基金 <strong>NT$ {concert.allocatedFund.toLocaleString()}</strong> 將自動解除鎖定，回歸未分配儲蓄金庫中，不會建立虛假的收入紀錄。
              </div>
            </div>
          )}

          {hasTicketStub && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">珍藏票根提醒：</span>
                此演唱會包含一張紀念票根照片與感言，刪除演唱會後票根紀錄亦將移除。
              </div>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">真實收支安全：</span>
              您過去為搶票、交通或住宿所記錄的真實財務明細將完全保留在帳本中，不影響總資產結算。
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>確認刪除演唱會</span>
          </button>
        </div>
      </div>
    </div>
  );
};
