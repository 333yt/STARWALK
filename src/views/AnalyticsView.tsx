import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Wallet,
  Plus,
  ArrowRightLeft,
  Edit3,
  Trash2,
  Globe
} from 'lucide-react';
import { Account, CurrencyCode } from '../types';
import { AccountModal } from '../components/AccountModal';
import { CurrencyTransferModal } from '../components/CurrencyTransferModal';
import { getCurrencyConfig } from '../services/currencyService';
import { HandDrawnSticker } from '../components/HandDrawnSticker';

export const AnalyticsView: React.FC = () => {
  const {
    accounts,
    transfers,
    addAccount,
    updateAccount,
    deleteAccount,
    transferCurrency,
    currentYearMonth,
    monthTransactions,
    monthTotalIncome,
    monthTotalExpense,
    monthDailyExpense,
    monthIdolExpense,
    currentMonthBudgetLimit,
    monthBudgetRemaining,
    monthBudgetUsagePercent,
    setMonthlyBudgetLimit,
    totalLiquidAssets,
    totalAllocatedFunds,
    availableUnallocatedFunds
  } = useApp();

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(currentMonthBudgetLimit));

  // Multi-currency account modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { category: string; amount: number; group: 'daily' | 'idol' }>();
    monthTransactions
      .filter(tx => tx.type === 'expense')
      .forEach(tx => {
        const existing = map.get(tx.category) || { category: tx.category, amount: 0, group: tx.categoryGroup };
        existing.amount += tx.amount;
        map.set(tx.category, existing);
      });

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions]);

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(budgetInput, 10);
    if (!isNaN(val) && val >= 0) {
      setMonthlyBudgetLimit(currentYearMonth, val);
      setIsEditingBudget(false);
    }
  };

  // Warning state level
  const warningState = useMemo(() => {
    if (monthBudgetUsagePercent > 100) {
      return {
        type: 'danger',
        title: '⚠️ 經紀公司財務警報！',
        message: '本月支出已超出預算，公司必須暫緩部分通告安排！快來調整經營計畫，一起讓偶像重新站上舞台吧！'
      };
    } else if (monthBudgetUsagePercent >= 80) {
      return {
        type: 'warning',
        title: '🚨 經紀室緊急通知！',
        message: '本月預算即將用完！為了讓接下來的活動順利進行，先檢查支出並重新安排資源吧！'
      };
    } else {
      return {
        type: 'healthy',
        title: '🌱 經紀室營運狀況良好！',
        message: '消費預算控制得宜，各項演唱會基金穩定累積中！繼續保持健康的生活自律～'
      };
    }
  }, [monthBudgetUsagePercent]);

  // Colors for category chart slices
  const COLORS = [
    '#FF6B9D', '#A779FF', '#2BB58A', '#FFB84D', '#FF5C77',
    '#6366F1', '#14B8A6', '#F43F5E', '#8B5CF6', '#F97316'
  ];

  // SVG Pie calculations
  const pieSlices = useMemo(() => {
    if (monthTotalExpense <= 0) return [];
    let cumulative = 0;
    return categoryBreakdown.map((item, idx) => {
      const percentage = (item.amount / monthTotalExpense) * 100;
      const startAngle = (cumulative / 100) * 360;
      cumulative += percentage;
      const endAngle = (cumulative / 100) * 360;
      return {
        ...item,
        percentage,
        startAngle,
        endAngle,
        color: COLORS[idx % COLORS.length]
      };
    });
  }, [categoryBreakdown, monthTotalExpense]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="sketch-card bg-[#F4EEFF] p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
        <div
          className="washi-tape-lilac absolute -top-3 left-10 w-28 h-5 rounded-sm"
          style={{ transform: 'rotate(-2deg)' }}
        />
        <div className="flex items-center gap-3.5">
          <HandDrawnSticker sticker="sparkles" size={48} />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#4A3728]">
              📊 財務管理室｜消費分析報告
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#8C7365]">
              精準區分日常生活與追星開銷、預算上限監控與資金池健康度
            </p>
          </div>
        </div>

        {/* Budget Setting Trigger */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                className="w-32 px-3 py-1.5 text-xs font-mono-num font-black rounded-xl border-2 border-[#4A3728] bg-white text-[#4A3728]"
              />
              <button
                type="submit"
                className="sticker-btn px-3 py-1.5 text-xs font-black text-white bg-[#FF5C8A] rounded-xl"
              >
                儲存
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="sticker-btn-soft px-2 py-1.5 text-xs font-bold bg-white text-[#8C7365]"
              >
                取消
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setBudgetInput(String(currentMonthBudgetLimit));
                setIsEditingBudget(true);
              }}
              className="sticker-btn-soft px-4 py-2 text-xs font-black text-[#4A3728] bg-white rounded-full flex items-center gap-1.5"
            >
              <Target className="w-4 h-4 text-[#FF5C8A]" />
              <span>設定本月預算上限</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning State Banner */}
      <div
        className={`p-4 rounded-2xl border-2 border-[#4A3728] shadow-[3px_3px_0px_#4A3728] flex items-start gap-3.5 transition-all ${
          warningState.type === 'danger'
            ? 'bg-[#FFE3EC] text-[#FF2E7E]'
            : warningState.type === 'warning'
            ? 'bg-[#FFF5D6] text-[#B86E14]'
            : 'bg-[#E8FBF4] text-[#1E9E73]'
        }`}
      >
        {warningState.type === 'danger' ? (
          <ShieldAlert className="w-6 h-6 text-[#FF2E7E] shrink-0 mt-0.5" />
        ) : warningState.type === 'warning' ? (
          <AlertTriangle className="w-6 h-6 text-[#B86E14] shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-6 h-6 text-[#1E9E73] shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-sm font-black">{warningState.title}</h4>
          <p className="text-xs font-bold mt-0.5 leading-relaxed">
            {warningState.message}
          </p>
        </div>
      </div>

      {/* 5-Item Rigorous Financial Distinction Postcards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="sketch-card bg-[#E6FAF2] p-4 relative">
          <div className="text-[11px] font-black text-[#8C7365]">1. 本月總收入</div>
          <div className="text-base font-black font-mono-num text-[#2BB58A] mt-1">
            NT$ {monthTotalIncome.toLocaleString()}
          </div>
        </div>

        <div className="sketch-card bg-[#FFEBF2] p-4 relative">
          <div className="text-[11px] font-black text-[#8C7365]">2. 本月總支出</div>
          <div className="text-base font-black font-mono-num text-[#FF5C8A] mt-1">
            NT$ {monthTotalExpense.toLocaleString()}
          </div>
        </div>

        <div className="sketch-card bg-[#FFFDF7] p-4 relative">
          <div className="text-[11px] font-black text-[#8C7365]">3. 預算剩餘額度</div>
          <div
            className={`text-base font-black font-mono-num mt-1 ${
              monthBudgetRemaining >= 0 ? 'text-[#4A3728]' : 'text-rose-500'
            }`}
          >
            NT$ {monthBudgetRemaining.toLocaleString()}
          </div>
        </div>

        <div className="sketch-card bg-[#F2EAFF] p-4 relative">
          <div className="text-[11px] font-black text-[#8C7365]">4. 可分配流動資金</div>
          <div className="text-base font-black font-mono-num text-[#8A5CF5] mt-1">
            NT$ {availableUnallocatedFunds.toLocaleString()}
          </div>
        </div>

        <div className="sketch-card bg-[#FFF5D6] p-4 relative col-span-2 lg:col-span-1">
          <div className="text-[11px] font-black text-[#8C7365]">5. 已分配演唱會基金</div>
          <div className="text-base font-black font-mono-num text-[#E58A28] mt-1">
            NT$ {totalAllocatedFunds.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Daily vs Idol Spending Comparison */}
      <div className="sketch-card bg-white p-6 space-y-4 relative">
        <h4 className="text-sm font-black text-[#4A3728]">
          🍱 日常生活 vs 🎤 追星消費比較
        </h4>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#8C7365]">
                🍱 日常生活開銷（飲食、交通、日常購物等）
              </span>
              <span className="font-mono-num text-[#4A3728]">
                NT$ {monthDailyExpense.toLocaleString()} (
                {monthTotalExpense > 0 ? ((monthDailyExpense / monthTotalExpense) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-[#F5EBE1] border-2 border-[#4A3728] overflow-hidden p-0.5">
              <div
                className="h-full crayon-stripe-mint rounded-full transition-all duration-500"
                style={{
                  width: `${monthTotalExpense > 0 ? (monthDailyExpense / monthTotalExpense) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[#FF5C8A]">
                🎤 追星應援消費（小卡、手燈、專輯、票券等）
              </span>
              <span className="font-mono-num text-[#FF5C8A]">
                NT$ {monthIdolExpense.toLocaleString()} (
                {monthTotalExpense > 0 ? ((monthIdolExpense / monthTotalExpense) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-[#F5EBE1] border-2 border-[#4A3728] overflow-hidden p-0.5">
              <div
                className="h-full crayon-stripe-pink rounded-full transition-all duration-500"
                style={{
                  width: `${monthTotalExpense > 0 ? (monthIdolExpense / monthTotalExpense) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="sketch-card bg-white p-6 relative">
          <div
            className="washi-tape-yellow absolute -top-3 left-12 w-28 h-5 rounded-sm"
            style={{ transform: 'rotate(-2deg)' }}
          />
          <h3 className="text-base font-black text-[#4A3728] mb-4">
            🥧 本月各類別支出占比
          </h3>

          {categoryBreakdown.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {pieSlices.map((slice, i) => {
                    const strokeDasharray = `${slice.percentage} ${100 - slice.percentage}`;
                    const prevPercent = pieSlices.slice(0, i).reduce((sum, s) => sum + s.percentage, 0);
                    const strokeDashoffset = -prevPercent;
                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r="35"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="20"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        pathLength="100"
                        className="transition-all duration-500"
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-[#8C7365]">支出總額</span>
                  <span className="text-xs font-mono-num font-black text-[#4A3728]">
                    NT${(monthTotalExpense / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto pr-1">
                {pieSlices.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-[#4A3728]"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-[#4A3728] truncate max-w-[120px]">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono-num">
                      <span className="text-[#8C7365] text-[11px]">
                        {item.percentage.toFixed(1)}%
                      </span>
                      <span className="font-black text-[#4A3728]">
                        NT$ {item.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs font-bold text-[#8C7365] py-12 text-center">
              本月份尚未記錄支出，記錄後自動生成圖表 🍰
            </p>
          )}
        </div>

        {/* Category Comparison Bars */}
        <div className="sketch-card bg-white p-6 relative">
          <h3 className="text-base font-black text-[#4A3728] mb-4">
            📊 各分類消費金額比較
          </h3>

          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
              {categoryBreakdown.map((item, idx) => {
                const maxAmount = categoryBreakdown[0]?.amount || 1;
                const barPercent = Math.min(100, Math.round((item.amount / maxAmount) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#4A3728] flex items-center gap-1.5">
                        <span>{item.group === 'idol' ? '🎤' : '🍱'}</span>
                        <span>{item.category}</span>
                      </span>
                      <span className="font-mono-num font-black text-[#4A3728]">
                        NT$ {item.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#F5EBE1] border-2 border-[#4A3728] overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full ${
                          item.group === 'idol' ? 'crayon-stripe-pink' : 'crayon-stripe-mint'
                        }`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs font-bold text-[#8C7365] py-12 text-center">
              尚無分類比較資料 📊
            </p>
          )}
        </div>
      </div>

      {/* Multi-Currency Asset Accounts & Exchange Section */}
      <div className="sketch-card bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3] dark:border-slate-800 gap-3">
          <div>
            <h3 className="font-black text-base text-[#4A3728] dark:text-slate-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#FF5C8A]" />
              <span>多幣種資產帳戶與現金錢包管理</span>
            </h3>
            <p className="text-xs font-bold text-[#8C7365] dark:text-slate-400 mt-0.5">
              各帳戶獨立原幣餘額，信用卡消費不重複扣款，即時轉換台幣淨資產 NT$ {totalLiquidAssets.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(true)}
              className="sticker-btn px-3.5 py-2 rounded-full bg-[#8A5CF5] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>外幣兌換與轉帳</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingAccount(null);
                setIsAccountModalOpen(true);
              }}
              className="sticker-btn px-3.5 py-2 rounded-full bg-[#FF5C8A] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>新增資產帳戶</span>
            </button>
          </div>
        </div>

        {/* Account Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {accounts.map(acc => {
            const curr = acc.currency || 'TWD';
            const config = getCurrencyConfig(curr);
            const rate = config.defaultRateToTWD || 1;
            const twdEquivalent = Math.round(acc.balance * rate);

            return (
              <div
                key={acc.id}
                className="p-4 rounded-2xl bg-[#FFFDF7] dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 shadow-[3px_3px_0px_#4A3728] dark:shadow-[3px_3px_0px_#1e293b] flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{config.flag}</span>
                    <div>
                      <h4 className="font-black text-sm text-[#4A3728] dark:text-slate-100">
                        {acc.name}
                      </h4>
                      <span className="text-[10px] font-bold text-[#8C7365] dark:text-slate-400">
                        {acc.type === 'credit_card'
                          ? '💳 信用卡 (待繳帳單)'
                          : acc.type === 'cash'
                          ? '💵 現金錢包'
                          : '🏦 銀行帳戶'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccount(acc);
                        setIsAccountModalOpen(true);
                      }}
                      className="p-1 rounded-lg hover:bg-[#FFE3EC] dark:hover:bg-slate-700 text-[#8C7365] dark:text-slate-300"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteAccount(acc.id)}
                        className="p-1 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-[#E6D7C3] dark:border-slate-700 flex items-baseline justify-between">
                  <span className="text-xs font-bold text-[#8C7365] dark:text-slate-400">
                    原幣餘額
                  </span>
                  <div className="text-right">
                    <span className="font-mono-num font-black text-base text-[#4A3728] dark:text-slate-100">
                      {config.symbol} {acc.balance.toLocaleString()} {curr}
                    </span>
                    {curr !== 'TWD' && (
                      <div className="text-[10px] font-mono-num font-bold text-[#8C7365] dark:text-slate-400">
                        ≈ NT$ {twdEquivalent.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setEditingAccount(null);
        }}
        account={editingAccount}
        onSaveAccount={(accData, id) => {
          if (id) {
            updateAccount(id, accData);
          } else {
            addAccount(accData as Omit<Account, 'id'>);
          }
        }}
      />

      {/* Currency Transfer Modal */}
      <CurrencyTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onTransfer={transferCurrency}
      />
    </div>
  );
};
