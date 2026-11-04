import React, { useState, useEffect } from 'react';
import { X, Wallet, DollarSign, Check, AlertCircle } from 'lucide-react';
import { Account, AccountType, CurrencyCode } from '../types';
import { CURRENCIES, getCurrencyConfig } from '../services/currencyService';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null; // null = Create Mode, non-null = Edit Mode
  onSaveAccount: (accountData: Omit<Account, 'id'> | Partial<Account>, id?: string) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onSaveAccount
}) => {
  const isEditMode = !!account;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState<CurrencyCode>('TWD');
  const [balanceStr, setBalanceStr] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (account) {
      setName(account.name);
      setType(account.type);
      setCurrency(account.currency || 'TWD');
      setBalanceStr(String(account.balance));
      setNote(account.note || '');
    } else {
      setName('');
      setType('bank');
      setCurrency('TWD');
      setBalanceStr('0');
      setNote('');
    }
    setErrorMsg(null);
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('請輸入帳戶名稱！');
      return;
    }

    const bal = parseFloat(balanceStr);
    if (isNaN(bal)) {
      setErrorMsg('請輸入有效的餘額數值！');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      currency,
      balance: bal,
      note: note.trim()
    };

    if (isEditMode && account) {
      onSaveAccount(payload, account.id);
    } else {
      onSaveAccount(payload);
    }

    onClose();
  };

  const currConfig = getCurrencyConfig(currency);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/45 backdrop-blur-xs">
      <div className="sketch-card relative w-full max-w-md bg-[#FFFDF7] dark:bg-slate-900 border-2 border-[#4A3728] dark:border-slate-700 shadow-[6px_6px_0px_#4A3728] dark:shadow-[6px_6px_0px_#1e293b] p-6 space-y-4 animate-stamp">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3] dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#FF5C8A]" />
            <h3 className="font-black text-base md:text-lg text-[#4A3728] dark:text-slate-100">
              {isEditMode ? '✏️ 編輯資產帳戶' : '💳 新增多幣種帳戶 / 錢包'}
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
          {/* Account Name */}
          <div>
            <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
              帳戶名稱 *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例如：🇯🇵 日圓隨身錢包、🏦 台新 Richart 帳戶"
              className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100 outline-none"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
              帳戶類型
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cash', label: '💵 現金錢包' },
                { id: 'bank', label: '🏦 銀行存款' },
                { id: 'line_pay', label: '📱 電子支付' },
                { id: 'credit_card', label: '💳 信用卡' }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id as AccountType)}
                  className={`py-2 px-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    type === item.id
                      ? 'bg-[#FFE3EC] dark:bg-rose-950 text-[#FF3B75] dark:text-rose-300 border-[#4A3728] dark:border-rose-700'
                      : 'bg-white dark:bg-slate-800 text-[#8C7365] dark:text-slate-400 border-[#4A3728]/30 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency Code */}
          <div>
            <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
              帳戶結算貨幣 (Currency)
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#FF5C8A] dark:text-rose-300 outline-none"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
              {type === 'credit_card' ? '目前待繳帳單金額' : '帳戶初期／現有餘額'} ({currConfig.symbol} {currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-black font-mono-num text-[#FF5C8A]">
                {currConfig.symbol}
              </span>
              <input
                type="number"
                step="any"
                value={balanceStr}
                onChange={e => setBalanceStr(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono-num font-black text-[#4A3728] dark:text-slate-100 outline-none"
              />
            </div>
            {currency !== 'TWD' && (
              <p className="text-[11px] text-[#8C7365] dark:text-slate-400 mt-1">
                約合 NT$ {Math.round((parseFloat(balanceStr) || 0) * currConfig.defaultRateToTWD).toLocaleString()} (依基準參考匯率)
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
              備註說明
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="備註用途或發卡銀行..."
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
              className="sticker-btn flex-1 py-2.5 text-xs font-black text-white bg-[#FF5C8A] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isEditMode ? '儲存帳戶修改' : '確認新增帳戶'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
