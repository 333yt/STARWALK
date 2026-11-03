import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Ticket,
  CalendarCheck,
  CalendarX,
  PlusCircle,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowUpRight,
  Compass,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HomeViewProps {
  onOpenQuickTx: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenQuickTx }) => {
  const {
    characterProfile,
    primaryConcert,
    setActiveTab,
    isTodayRecorded,
    monthTotalIncome,
    monthTotalExpense,
    monthDailyExpense,
    monthIdolExpense,
    currentMonthBudgetLimit,
    monthBudgetRemaining,
    monthBudgetUsagePercent,
    totalAllocatedFunds,
    dailyMissions,
    completeDailyMission,
    transactions,
    achievements
  } = useApp();

  const latestTransaction = transactions[0];

  // Primary concert progress
  const concertProgress = primaryConcert
    ? Math.min(100, (primaryConcert.allocatedFund / (primaryConcert.budgetPlan.total || 1)) * 100)
    : 0;

  const xpMaxForLevel = characterProfile.level * 50;
  const xpPercent = Math.min(100, Math.round((characterProfile.xp / xpMaxForLevel) * 100));

  return (
    <div className="space-y-6 pb-20">
      {/* Top Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-200/60 dark:border-pink-900/40 p-6 md:p-8 backdrop-blur-sm">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar and Welcome Greetings */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl shadow-pink-500/20 group">
                <img
                  src={characterProfile.avatarUrl}
                  alt={characterProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md">
                Lv.{characterProfile.level}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-100/80 dark:bg-pink-950/80 px-2.5 py-0.5 rounded-full border border-pink-200/50">
                  {characterProfile.currentOutfit}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  ✨ 經紀星光幣：{characterProfile.agencyPoints} P
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                早安，{characterProfile.name}！💖
              </h1>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                記帳是工具，收藏是回憶，遊戲是動力，演唱會是目標！
              </p>

              {/* XP Progress Bar */}
              <div className="pt-2 max-w-xs">
                <div className="flex justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1">
                  <span>角色成長經驗值 (XP)</span>
                  <span className="font-mono tabular-nums">
                    {characterProfile.xp} / {xpMaxForLevel} XP ({xpPercent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Bookkeeping Status & Fast Trigger */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-pink-200/40">
            <div className="flex items-center gap-2">
              {isTodayRecorded ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  <span>今日記帳已完成 ✨</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold animate-pulse">
                  <CalendarX className="w-4 h-4 text-amber-500" />
                  <span>今日尚未記帳 ✍️</span>
                </div>
              )}
            </div>

            <button
              onClick={onOpenQuickTx}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4" />
              <span>快速記一筆</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Main Concert Journey Highlight & Monthly Budget Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Concert Journey Card (2 cols) */}
        {primaryConcert ? (
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow transition-shadow relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-pink-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  進行中的主要演唱會旅程
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('concerts')}
                className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-0.5"
              >
                <span>完整旅程地圖</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 relative group">
                <img
                  src={primaryConcert.coverImage}
                  alt={primaryConcert.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold bg-black/70 text-white rounded-md backdrop-blur-xs">
                  {primaryConcert.artist}
                </span>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    {primaryConcert.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    📍 {primaryConcert.city} · {primaryConcert.venue} · 📅 {primaryConcert.date || '日期規劃中'}
                  </p>
                </div>

                {/* Progress calculation */}
                <div>
                  <div className="flex justify-between items-baseline text-xs mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      專屬基金達成率
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-pink-600 dark:text-pink-400 font-mono tabular-nums">
                        {concertProgress.toFixed(1)}%
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        (NT$ {primaryConcert.allocatedFund.toLocaleString()} / NT$ {primaryConcert.budgetPlan.total.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  {/* Smooth Progress Bar with Doll Marker */}
                  <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-visible">
                    <div
                      className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${concertProgress}%` }}
                    />
                    <div
                      className="absolute -top-3 transition-all duration-700 transform -translate-x-1/2"
                      style={{ left: `${concertProgress}%` }}
                    >
                      <div className="w-7 h-7 rounded-full border-2 border-pink-400 bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-xs">
                        🧸
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span>🏠 出發起點</span>
                  <span>🎟️ 搶票</span>
                  <span>🚆 住宿交通</span>
                  <span>🏟️ 巨蛋舞台</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center">
            <Compass className="w-10 h-10 text-pink-400 mb-2" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200">
              尚未設定主要演唱會目標
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              設定你想參加的下一場偶像舞台，啟動專屬存錢地圖！
            </p>
            <button
              onClick={() => setActiveTab('concerts')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-pink-500 hover:bg-pink-600"
            >
              + 建立第一個演唱會目標
            </button>
          </div>
        )}

        {/* Monthly Budget Summary (1 col) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                本月消費預算
              </span>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs font-semibold text-pink-500 hover:underline"
              >
                調整預算
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs text-slate-400">本月剩餘可用額度</div>
              <div
                className={`text-2xl font-black font-mono tabular-nums mt-0.5 ${
                  monthBudgetRemaining >= 0
                    ? 'text-slate-900 dark:text-white'
                    : 'text-rose-500'
                }`}
              >
                NT$ {monthBudgetRemaining.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                預算上限：NT$ {currentMonthBudgetLimit.toLocaleString()} · 已使用 {monthBudgetUsagePercent}%
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    monthBudgetUsagePercent > 90
                      ? 'bg-rose-500'
                      : monthBudgetUsagePercent > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, monthBudgetUsagePercent)}%` }}
                />
              </div>
            </div>

            {/* Daily vs Idol Breakdown */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="text-slate-400 text-[11px]">🍱 日常生活</div>
                <div className="font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums mt-0.5">
                  NT$ {monthDailyExpense.toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/30">
                <div className="text-pink-500 dark:text-pink-400 text-[11px]">🎤 追星消費</div>
                <div className="font-bold text-pink-700 dark:text-pink-300 font-mono tabular-nums mt-0.5">
                  NT$ {monthIdolExpense.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>💎 已分配演唱會基金</span>
            <span className="font-bold font-mono text-purple-600 dark:text-purple-400">
              NT$ {totalAllocatedFunds.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Row: Daily Missions & Recent Bookkeeping Transaction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Quests (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                經紀人日常任務中心（完成領取角色經驗值）
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              經驗值僅來自任務，消費不增加 XP
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
            {dailyMissions.map(mission => (
              <div
                key={mission.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => completeDailyMission(mission.id)}
                    disabled={mission.isCompleted}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      mission.isCompleted
                        ? 'bg-emerald-500 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-700 hover:border-pink-500'
                    }`}
                  >
                    {mission.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <h5
                      className={`text-xs font-semibold ${
                        mission.isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {mission.title}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {mission.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                    +{mission.xp} XP
                  </span>
                  {mission.isCompleted ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-medium">
                      已達成
                    </span>
                  ) : (
                    <button
                      onClick={() => completeDailyMission(mission.id)}
                      className="px-2.5 py-1 text-xs font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/40 rounded-lg border border-pink-200 dark:border-pink-900/50"
                    >
                      領取獎勵
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Transaction & Quick Links (1 col) */}
        <div className="space-y-6">
          {/* Latest Transaction */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                最近一筆記帳紀錄
              </span>
              <button
                onClick={() => setActiveTab('bookkeeping')}
                className="text-xs font-semibold text-pink-500 hover:underline"
              >
                查看完整帳本
              </button>
            </div>

            {latestTransaction ? (
              <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {latestTransaction.category}
                  </span>
                  <span
                    className={`text-sm font-bold font-mono tabular-nums ${
                      latestTransaction.type === 'income'
                        ? 'text-emerald-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {latestTransaction.type === 'income' ? '+' : '-'} NT${' '}
                    {latestTransaction.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                  {latestTransaction.note || '無備註'}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{latestTransaction.date}</span>
                  <span className="capitalize">{latestTransaction.categoryGroup === 'idol' ? '🎤 追星' : '🍱 日常'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-4 text-center py-4">
                目前尚無收支紀錄，點擊上方快速記一筆吧！
              </p>
            )}
          </div>

          {/* Quick Shortcuts to Collection & Memories */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('collectibles')}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-200/60 dark:border-pink-900/40 text-left hover:scale-[1.02] transition-transform"
            >
              <div className="text-lg">💖</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                追星收藏冊
              </div>
              <div className="text-[10px] text-slate-500">小卡周邊照片牆</div>
            </button>

            <button
              onClick={() => setActiveTab('memories')}
              className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200/60 dark:border-purple-900/40 text-left hover:scale-[1.02] transition-transform"
            >
              <div className="text-lg">🎟️</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                星途回憶館
              </div>
              <div className="text-[10px] text-slate-500">紀念票根與年度回顧</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
