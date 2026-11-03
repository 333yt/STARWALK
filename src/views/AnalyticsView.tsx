import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Wallet,
  Sparkles
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const {
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
    '#EC4899', '#A855F7', '#3B82F6', '#10B981', '#F59E0B',
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-500" />
            <span>📊 財務管理室｜消費分析報告</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            精準區分日常生活與追星開銷、預算上限監控與資金池健康度
          </p>
        </div>

        {/* Budget Setting Trigger */}
        <div className="flex items-center gap-2">
          {isEditingBudget ? (
            <form onSubmit={handleSaveBudget} className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={budgetInput}
                onChange={e => setBudgetInput(e.target.value)}
                className="w-32 px-2.5 py-1.5 text-xs font-mono font-bold rounded-xl border border-pink-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl"
              >
                儲存
              </button>
              <button
                type="button"
                onClick={() => setIsEditingBudget(false)}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800"
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50"
            >
              <Target className="w-3.5 h-3.5 text-pink-500" />
              <span>設定本月預算上限</span>
            </button>
          )}
        </div>
      </div>

      {/* Warning State Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
          warningState.type === 'danger'
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900 text-rose-800 dark:text-rose-200'
            : warningState.type === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-900 text-amber-800 dark:text-amber-200'
            : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
        }`}
      >
        {warningState.type === 'danger' ? (
          <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
        ) : warningState.type === 'warning' ? (
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-sm font-bold">{warningState.title}</h4>
          <p className="text-xs mt-1 leading-relaxed opacity-90">
            {warningState.message}
          </p>
        </div>
      </div>

      {/* 5-Item Rigorous Financial Distinction Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">1. 本月總收入</div>
          <div className="text-base font-black font-mono tabular-nums text-emerald-500 mt-1">
            NT$ {monthTotalIncome.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">2. 本月總支出</div>
          <div className="text-base font-black font-mono tabular-nums text-rose-500 mt-1">
            NT$ {monthTotalExpense.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">3. 預算剩餘額度</div>
          <div
            className={`text-base font-black font-mono tabular-nums mt-1 ${
              monthBudgetRemaining >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'
            }`}
          >
            NT$ {monthBudgetRemaining.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-400">4. 可分配流動資金</div>
          <div className="text-base font-black font-mono tabular-nums text-purple-600 dark:text-purple-400 mt-1">
            NT$ {availableUnallocatedFunds.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 col-span-2 lg:col-span-1">
          <div className="text-[11px] text-slate-400">5. 已分配演唱會基金</div>
          <div className="text-base font-black font-mono tabular-nums text-pink-600 dark:text-pink-400 mt-1">
            NT$ {totalAllocatedFunds.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Daily vs Idol Spending Comparison */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          🍱 日常生活 vs 🎤 追星消費比較
        </h4>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-400">
                🍱 日常生活開銷（飲食、交通、日常購物等）
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                NT$ {monthDailyExpense.toLocaleString()} (
                {monthTotalExpense > 0 ? ((monthDailyExpense / monthTotalExpense) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{
                  width: `${monthTotalExpense > 0 ? (monthDailyExpense / monthTotalExpense) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-pink-600 dark:text-pink-400">
                🎤 追星應援消費（小卡、手燈、專輯、票券等）
              </span>
              <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                NT$ {monthIdolExpense.toLocaleString()} (
                {monthTotalExpense > 0 ? ((monthIdolExpense / monthTotalExpense) * 100).toFixed(1) : 0}%)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full transition-all duration-500"
                style={{
                  width: `${monthTotalExpense > 0 ? (monthIdolExpense / monthTotalExpense) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section: Pie Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Pie & Legend) */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            🥧 本月各類別支出占比
          </h4>

          {categoryBreakdown.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* SVG Conic Pie Visual */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {pieSlices.map((slice, i) => {
                    const strokeDasharray = `${slice.percentage} ${100 - slice.percentage}`;
                    // Calculate strokeDashoffset based on cumulative prior slices
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
                  <span className="text-[10px] text-slate-400">支出總額</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    NT${(monthTotalExpense / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 w-full space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {pieSlices.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-400 text-[11px]">
                        {item.percentage.toFixed(1)}%
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        NT$ {item.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">
              本月份尚未記錄支出，記錄後自動生成精緻圖表 🍰
            </p>
          )}
        </div>

        {/* Category Comparison Bar Chart */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            📊 各分類消費金額比較
          </h4>

          {categoryBreakdown.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {categoryBreakdown.map((item, idx) => {
                const maxAmount = categoryBreakdown[0]?.amount || 1;
                const barPercent = Math.min(100, Math.round((item.amount / maxAmount) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <span className="text-[11px]">{item.group === 'idol' ? '🎤' : '🍱'}</span>
                        <span>{item.category}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        NT$ {item.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.group === 'idol' ? 'bg-pink-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${barPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">
              尚無分類比較資料 📊
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
