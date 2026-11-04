import React, { useState, useEffect } from 'react';
import { X, RefreshCw, ArrowRightLeft, AlertCircle, Check, Globe } from 'lucide-react';
import { Account, CurrencyCode } from '../types';
import { CURRENCIES, getCurrencyConfig, fetchLiveExchangeRateToTWD, calculateTwdAmount } from '../services/currencyService';

interface CurrencyTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onTransfer: (
    fromAccountId: string,
    toAccountId: string,
    fromAmount: number,
    toAmount: number,
    feeTWD?: number,
    note?: string
  ) => { success: boolean; message: string };
}

export const CurrencyTransferModal: React.FC<CurrencyTransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onTransfer
}) => {
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');

  const [fromAmountStr, setFromAmountStr] = useState<string>('');
  const [toAmountStr, setToAmountStr] = useState<string>('');
  const [customRateStr, setCustomRateStr] = useState<string>('');
  const [feeTwdStr, setFeeTwdStr] = useState<string>('0');
  const [note, setNote] = useState<string>('外幣兌換與跨帳戶轉帳');

  const [useLiveRate, setUseLiveRate] = useState<boolean>(true);
  const [liveRate, setLiveRate] = useState<number>(1.0);
  const [rateSource, setRateSource] = useState<string>('');
  const [isFetchingRate, setIsFetchingRate] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fromAcc = accounts.find(a => a.id === fromAccountId) || accounts[0];
  const toAcc = accounts.find(a => a.id === toAccountId) || accounts[1] || accounts[0];

  const fromCurr = fromAcc?.currency || 'TWD';
  const toCurr = toAcc?.currency || 'TWD';

  useEffect(() => {
    if (!isOpen) return;

    if (accounts.length >= 2) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[1].id);
    } else if (accounts.length === 1) {
      setFromAccountId(accounts[0].id);
      setToAccountId(accounts[0].id);
    }
    setFromAmountStr('');
    setToAmountStr('');
    setErrorMsg(null);
  }, [isOpen, accounts]);

  // Fetch rate when currencies change
  useEffect(() => {
    if (!isOpen || !fromCurr || !toCurr) return;

    if (fromCurr === toCurr) {
      setLiveRate(1.0);
      setCustomRateStr('1.0');
      setRateSource('同幣種轉帳 (1:1)');
      return;
    }

    fetchRates();
  }, [fromCurr, toCurr, isOpen]);

  const fetchRates = async () => {
    setIsFetchingRate(true);
    try {
      const fromRes = await fetchLiveExchangeRateToTWD(fromCurr);
      const toRes = await fetchLiveExchangeRateToTWD(toCurr);

      // 1 fromCurr = (fromRate / toRate) toCurr
      const relativeRate = toRes.rate > 0 ? fromRes.rate / toRes.rate : 1;
      setLiveRate(relativeRate);
      setCustomRateStr(relativeRate.toFixed(4));
      setRateSource(`${fromRes.provider}`);
    } catch (e) {
      console.warn('Transfer rate fetch error', e);
    } finally {
      setIsFetchingRate(false);
    }
  };

  // Recalculate target amount when source amount or rate changes
  useEffect(() => {
    const fromVal = parseFloat(fromAmountStr) || 0;
    if (fromVal <= 0) {
      setToAmountStr('');
      return;
    }

    const activeRate = useLiveRate ? liveRate : (parseFloat(customRateStr) || liveRate);
    const convertedTo = fromVal * activeRate;
    setToAmountStr(convertedTo > 0 ? String(Math.round(convertedTo * 100) / 100) : '');
  }, [fromAmountStr, useLiveRate, liveRate, customRateStr]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (fromAccountId === toAccountId) {
      setErrorMsg('請選擇不同的轉出與轉入帳戶！');
      return;
    }

    const fromVal = parseFloat(fromAmountStr);
    const toVal = parseFloat(toAmountStr);
    const feeVal = parseFloat(feeTwdStr) || 0;

    if (isNaN(fromVal) || fromVal <= 0 || isNaN(toVal) || toVal <= 0) {
      setErrorMsg('請輸入有效的轉帳金額！');
      return;
    }

    const result = onTransfer(
      fromAccountId,
      toAccountId,
      fromVal,
      toVal,
      feeVal,
      note.trim() || '外幣兌換／帳戶轉帳'
    );

    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    onClose();
  };

  const fromConfig = getCurrencyConfig(fromCurr);
  const toConfig = getCurrencyConfig(toCurr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/45 backdrop-blur-xs">
      <div className="sketch-card relative w-full max-w-lg bg-[#FFFDF7] dark:bg-slate-900 border-2 border-[#4A3728] dark:border-slate-700 shadow-[6px_6px_0px_#4A3728] dark:shadow-[6px_6px_0px_#1e293b] p-6 space-y-4 animate-stamp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#8A5CF5]" />
            <h3 className="font-black text-base md:text-lg text-[#4A3728] dark:text-slate-100">
              💱 外幣兌換與跨帳戶轉帳
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
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border-2 border-rose-300 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold">
          {/* Source Account & Target Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                📤 轉出帳戶 (Source) *
              </label>
              <select
                value={fromAccountId}
                onChange={e => setFromAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
              >
                {accounts.map(acc => {
                  const cConfig = getCurrencyConfig(acc.currency || 'TWD');
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({cConfig.symbol} {acc.balance.toLocaleString()} {acc.currency || 'TWD'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                📥 轉入帳戶 (Destination) *
              </label>
              <select
                value={toAccountId}
                onChange={e => setToAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
              >
                {accounts.map(acc => {
                  const cConfig = getCurrencyConfig(acc.currency || 'TWD');
                  return (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({cConfig.symbol} {acc.balance.toLocaleString()} {acc.currency || 'TWD'})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Amounts & Exchange Rate */}
          <div className="p-3.5 rounded-2xl bg-[#EFE6FF] dark:bg-purple-950/40 border-2 border-[#4A3728] dark:border-purple-800 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#4A3728] dark:text-purple-200 font-black mb-1">
                  扣除金額 ({fromConfig.symbol} {fromCurr})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={fromAmountStr}
                  onChange={e => setFromAmountStr(e.target.value)}
                  placeholder="例如：4500"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num font-bold text-sm text-[#4A3728] dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-[#4A3728] dark:text-purple-200 font-black mb-1">
                  存入金額 ({toConfig.symbol} {toCurr})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={toAmountStr}
                  onChange={e => setToAmountStr(e.target.value)}
                  placeholder="例如：21000"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num font-bold text-sm text-[#FF5C8A] dark:text-rose-300 outline-none"
                />
              </div>
            </div>

            {/* Exchange Rate Toggle */}
            {fromCurr !== toCurr && (
              <div className="pt-2 border-t border-dashed border-[#4A3728]/20 dark:border-purple-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#8C7365] dark:text-purple-300">
                  <span>匯率模式：</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="transferRateMode"
                        checked={useLiveRate}
                        onChange={() => setUseLiveRate(true)}
                        className="accent-[#8A5CF5]"
                      />
                      <span>⚡ 即時匯率</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="transferRateMode"
                        checked={!useLiveRate}
                        onChange={() => setUseLiveRate(false)}
                        className="accent-[#8A5CF5]"
                      />
                      <span>✍️ 自訂匯率</span>
                    </label>
                  </div>
                </div>

                {useLiveRate ? (
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-[#4A3728]/20 text-[11px] font-mono-num font-bold text-[#4A3728] dark:text-slate-200 flex justify-between items-center">
                    <span>1 {fromCurr} = {liveRate.toFixed(4)} {toCurr}</span>
                    <button
                      type="button"
                      disabled={isFetchingRate}
                      onClick={fetchRates}
                      className="p-1 rounded-lg hover:bg-purple-100 text-[#8A5CF5]"
                      title="刷新即時匯率"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRate ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] text-[#8C7365] dark:text-purple-300 mb-1">
                      自訂 1 {fromCurr} 兌換 {toCurr} 匯率：
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.00001"
                      value={customRateStr}
                      onChange={e => setCustomRateStr(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono-num font-bold text-[#4A3728] dark:text-slate-100 outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Optional Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                手續費 (NT$ 折合)
              </label>
              <input
                type="number"
                min="0"
                value={feeTwdStr}
                onChange={e => setFeeTwdStr(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono-num font-bold text-[#4A3728] dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                備註說明
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="例：臨櫃換日幣現金、線上網銀換匯"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
              />
            </div>
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
              className="sticker-btn flex-1 py-2.5 text-xs font-black text-white bg-[#8A5CF5] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>確認完成轉帳／換匯</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
