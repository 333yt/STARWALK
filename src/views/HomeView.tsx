import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Ticket,
  CalendarCheck,
  CalendarX,
  Plus,
  Compass,
  CheckCircle2,
  Camera,
  ChevronRight,
  Zap
} from 'lucide-react';
import { CharacterPhotoModal } from '../components/CharacterPhotoModal';
import { DEFAULT_CHARACTER_AVATAR } from '../assets/defaultAvatars';
import { HandDrawnSticker } from '../components/HandDrawnSticker';

interface HomeViewProps {
  onOpenQuickTx: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenQuickTx }) => {
  const {
    characterProfile,
    updateCharacterProfile,
    primaryConcert,
    setActiveTab,
    isTodayRecorded,
    monthDailyExpense,
    monthIdolExpense,
    currentMonthBudgetLimit,
    monthBudgetRemaining,
    monthBudgetUsagePercent,
    totalAllocatedFunds,
    dailyMissions,
    completeDailyMission,
    transactions
  } = useApp();

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const latestTransaction = transactions[0];

  // Primary concert progress calculation
  const concertProgress = primaryConcert
    ? Math.min(100, (primaryConcert.allocatedFund / (primaryConcert.budgetPlan.total || 1)) * 100)
    : 0;

  const xpMaxForLevel = characterProfile.level * 50;
  const xpPercent = Math.min(100, Math.round((characterProfile.xp / xpMaxForLevel) * 100));

  return (
    <div className="space-y-6 pb-20">
      <CharacterPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        currentAvatarUrl={characterProfile.avatarUrl || DEFAULT_CHARACTER_AVATAR}
        onSaveAvatar={(newAvatarUrl) => {
          updateCharacterProfile({ avatarUrl: newAvatarUrl });
        }}
      />

      {/* HERO MANAGER GREETING POSTCARD (Hobonichi Style) */}
      <section className="sketch-card relative overflow-hidden bg-gradient-to-r from-[#FFE8F2] via-[#FFF6EB] to-[#F3E8FF] p-6 md:p-7">
        {/* Decorative Washi Tapes */}
        <div
          className="washi-tape-yellow absolute -top-3 left-16 w-28 h-5 rounded-sm"
          style={{ transform: 'rotate(-2deg)' }}
        />
        <div
          className="washi-tape-mint absolute -top-3 right-20 w-24 h-5 rounded-sm hidden sm:block"
          style={{ transform: 'rotate(3deg)' }}
        />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          {/* Avatar & Welcome Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6 text-center sm:text-left">
            {/* Hand-Drawn Polaroid Avatar Frame */}
            <div className="relative shrink-0 group">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                title="點擊更換角色照片"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white border-[2.5px] border-[#4A3728] shadow-[4px_4px_0px_#4A3728] overflow-hidden p-1 relative block focus:outline-none transition-transform group-hover:scale-105 cursor-pointer"
              >
                <img
                  src={characterProfile.avatarUrl || DEFAULT_CHARACTER_AVATAR}
                  alt={characterProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_CHARACTER_AVATAR;
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-black gap-1">
                  <Camera className="w-5 h-5 text-[#FFD84D] animate-bounce" />
                  <span>更換頭貼</span>
                </div>
              </button>

              {/* Level Badge Pill */}
              <span className="absolute -bottom-2 -right-2 bg-[#FF5C8A] text-white font-mono-num text-xs font-black px-2.5 py-0.5 rounded-full border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728] z-20">
                Lv.{characterProfile.level}
              </span>
            </div>

            <div className="space-y-2">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FFD6E6] border-2 border-[#4A3728] text-xs font-black text-[#D9386A] shadow-[2px_2px_0px_#4A3728]">
                  👗 {characterProfile.currentOutfit}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#FFF5CC] border-2 border-[#4A3728] text-xs font-black text-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
                  ✨ 經紀星光幣：
                  <strong className="font-mono-num text-[#E58A1F] ml-1">
                    {characterProfile.agencyPoints} P
                  </strong>
                </span>
              </div>

              {/* Title & Motto */}
              <h1 className="text-2xl sm:text-3xl font-black text-[#4A3728] tracking-tight">
                早安，{characterProfile.name}！💖
              </h1>
              <p className="text-xs sm:text-sm font-bold text-[#6E5646]">
                記帳是工具，收藏是回憶，遊戲是動力，演唱會是目標！
              </p>

              {/* Crayon XP Progress Bar */}
              <div className="pt-1 max-w-md mx-auto sm:mx-0">
                <div className="flex items-center justify-between text-xs font-black text-[#6E5646] mb-1">
                  <span>角色成長經驗值 (XP)</span>
                  <span className="font-mono-num text-[#4A3728]">
                    {characterProfile.xp} / {xpMaxForLevel} XP ({xpPercent}%)
                  </span>
                </div>
                <div className="w-full h-4 rounded-full bg-white border-2 border-[#4A3728] overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full crayon-stripe-pink transition-all duration-500"
                    style={{ width: `${Math.max(6, xpPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Status & Fast Trigger */}
          <div className="flex flex-col items-center lg:items-end gap-3 shrink-0">
            <div
              onClick={() => setActiveTab('bookkeeping')}
              className={`px-4 py-2 rounded-full border-2 border-[#4A3728] shadow-[2.5px_2.5px_0px_#4A3728] text-xs font-black flex items-center gap-1.5 cursor-pointer ${
                isTodayRecorded
                  ? 'bg-[#E4FBF0] text-[#1E8E68]'
                  : 'bg-[#FFF3CD] text-[#B86E14] animate-pulse'
              }`}
            >
              {isTodayRecorded ? (
                <>
                  <CalendarCheck className="w-4 h-4 text-[#1E8E68]" />
                  <span>今日記帳已完成 ✨</span>
                </>
              ) : (
                <>
                  <CalendarX className="w-4 h-4 text-[#B86E14]" />
                  <span>今日尚未記帳 ✍️</span>
                </>
              )}
            </div>

            <button
              onClick={onOpenQuickTx}
              className="sticker-btn px-6 py-3 rounded-full bg-gradient-to-r from-[#FF4785] to-[#B833FF] text-white text-sm font-black flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <Zap className="w-4 h-4 fill-[#FFD84D] text-[#FFD84D]" />
              <span>快速記一筆</span>
            </button>
          </div>
        </div>
      </section>

      {/* BENTO GRID: CONCERT GOAL (LEFT 7/12) + MONTHLY BUDGET ENVELOPE (RIGHT 5/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN (7/12): PRIMARY CONCERT GOAL TICKET CARD */}
        <div className="lg:col-span-7 flex flex-col">
          {primaryConcert ? (
            <div className="sketch-card bg-[#FFF8FA] p-6 md:p-7 flex-1 flex flex-col justify-between relative overflow-hidden">
              {/* Ticket Side Notch Cutouts */}
              <div className="w-7 h-7 rounded-full bg-[#FFFDF7] border-[2.5px] border-[#4A3728] absolute -left-4 top-1/2 -translate-y-1/2" />
              <div className="w-7 h-7 rounded-full bg-[#FFFDF7] border-[2.5px] border-[#4A3728] absolute -right-4 top-1/2 -translate-y-1/2" />

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#FF4785] text-white text-xs font-black border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
                      🎫 進行中主旅程
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#FFF3B0] text-[#4A3728] text-xs font-black border-2 border-[#4A3728]">
                      📍 {primaryConcert.city} · {primaryConcert.venue}
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('concerts')}
                    className="text-xs font-black text-[#FF3B75] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>完整地圖</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-2xl border-2 border-[#4A3728] overflow-hidden shrink-0 shadow-[2px_2px_0px_#4A3728] bg-slate-900">
                    <img
                      src={primaryConcert.coverImage}
                      alt={primaryConcert.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#FF5C8A]">
                      {primaryConcert.artist}
                    </span>
                    <h2 className="text-lg font-black text-[#4A3728] leading-snug">
                      {primaryConcert.title}
                    </h2>
                    <p className="text-xs font-bold text-[#8C7365] mt-1 font-mono-num">
                      📅 {primaryConcert.date || '日期待公布'}
                    </p>
                  </div>
                </div>

                {/* Savings Progress Box */}
                <div className="bg-white p-4 rounded-2xl border-2 border-[#4A3728] shadow-[3px_3px_0px_#F0DCE4] mb-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-black text-[#8C7365]">
                      專屬儲蓄達成率
                    </span>
                    <div className="font-mono-num text-base font-black">
                      <span className="text-[#FF4785]">
                        NT$ {primaryConcert.allocatedFund.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#8C7365] mx-1">/</span>
                      <span className="text-sm text-[#4A3728]">
                        NT$ {primaryConcert.budgetPlan.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-4 rounded-full bg-[#F5EBE1] border-2 border-[#4A3728] overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full crayon-stripe-pink transition-all duration-500"
                      style={{ width: `${concertProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-[#8C7365] mt-2">
                    <span>
                      達成進度：
                      <strong className="font-mono-num text-[#FF4785] ml-0.5">
                        {concertProgress.toFixed(1)}%
                      </strong>
                    </span>
                    <span>
                      剩餘目標：NT${' '}
                      <strong className="font-mono-num text-[#4A3728]">
                        {Math.max(0, primaryConcert.budgetPlan.total - primaryConcert.allocatedFund).toLocaleString()}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Perforated Tear Line & Footer */}
              <div className="border-t-2 border-dashed border-[#4A3728]/35 pt-3 flex items-center justify-between text-xs font-bold text-[#6E5646]">
                <span className="truncate max-w-[220px]">
                  💡 {primaryConcert.notes || '持續儲蓄前進巨蛋！'}
                </span>
                <button
                  onClick={() => setActiveTab('concerts')}
                  className="sticker-btn px-4 py-1.5 rounded-full bg-[#4A3728] text-white text-xs font-black shrink-0"
                >
                  前往分配專款
                </button>
              </div>
            </div>
          ) : (
            <div className="sketch-card bg-[#FFFDF7] p-8 flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div
                className="washi-tape-pink absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 rounded-sm"
                style={{ transform: 'translateX(-50%) rotate(-2deg)' }}
              />
              <div className="w-16 h-16 rounded-full bg-[#FFE3EC] border-[2.5px] border-[#4A3728] shadow-[3px_3px_0px_#4A3728] flex items-center justify-center mb-3 animate-float-slow text-2xl">
                <Compass className="w-8 h-8 text-[#FF4785]" />
              </div>
              <h2 className="text-lg font-black text-[#4A3728] mb-1">
                尚未設定主要演唱會目標
              </h2>
              <p className="text-xs font-bold text-[#8C7365] max-w-sm mb-5">
                設定你想參加的下一場演唱會，啟動專屬存錢與任務地圖！
              </p>
              <button
                onClick={() => setActiveTab('concerts')}
                className="sticker-btn px-6 py-2.5 rounded-full bg-[#FF3B75] text-white text-xs font-black flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>＋ 建立演唱會目標</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN (5/12): MONTHLY CONSUMPTION BUDGET ENVELOPE */}
        <div className="lg:col-span-5 sketch-card bg-white p-6 md:p-7 flex flex-col justify-between relative">
          <div
            className="washi-tape-mint absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 rounded-sm"
            style={{ transform: 'translateX(-50%) rotate(2deg)' }}
          />

          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#E6D7C3] pb-3">
              <span className="text-base font-black text-[#4A3728] flex items-center gap-1.5">
                📊 本月消費預算
              </span>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs font-black text-[#FF3B75] hover:underline px-2.5 py-1 rounded-full bg-[#FFE3EC] border border-[#4A3728] cursor-pointer"
              >
                調整預算
              </button>
            </div>

            {/* Remaining Budget Display */}
            <div>
              <div className="text-xs font-bold text-[#8C7365] mb-1">
                本月剩餘可用額度
              </div>
              <div
                className={`font-mono-num text-3xl sm:text-4xl font-black tracking-tight ${
                  monthBudgetRemaining >= 0 ? 'text-[#4A3728]' : 'text-rose-500'
                }`}
              >
                NT$ {monthBudgetRemaining.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-[#8C7365] mt-1.5">
                預算上限：NT$ {currentMonthBudgetLimit.toLocaleString()} · 已使用{' '}
                <span className="font-mono-num text-[#FF4785] font-black">
                  {monthBudgetUsagePercent}%
                </span>
              </div>
            </div>

            {/* Crayon Progress Bar */}
            <div className="w-full h-3.5 rounded-full bg-[#F5EBE1] border-2 border-[#4A3728] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full crayon-stripe-mint transition-all duration-500"
                style={{ width: `${Math.max(4, monthBudgetUsagePercent)}%` }}
              />
            </div>

            {/* 2 Sub-Envelopes: Daily vs Idol */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-[#FFFDF5] border-2 border-[#4A3728] shadow-[2px_2px_0px_#E6D7C3]">
                <div className="text-xs font-bold text-[#8C7365] flex items-center gap-1 mb-1">
                  <span>🍱 日常生活</span>
                </div>
                <div className="font-mono-num text-base font-black text-[#4A3728]">
                  NT$ {monthDailyExpense.toLocaleString()}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFF2F7] border-2 border-[#4A3728] shadow-[2px_2px_0px_#F5CEDC]">
                <div className="text-xs font-bold text-[#FF3B75] flex items-center gap-1 mb-1">
                  <span>🎤 追星消費</span>
                </div>
                <div className="font-mono-num text-base font-black text-[#FF3B75]">
                  NT$ {monthIdolExpense.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Allocated Concert Fund Row */}
          <div className="border-t-2 border-dashed border-[#E6D7C3] pt-3 mt-4 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-[#6E5646]">
              💎 已分配演唱會專屬基金
            </span>
            <span className="font-mono-num text-base font-black text-[#8A5CF5]">
              NT$ {totalAllocatedFunds.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* ROW: DAILY MISSIONS & RECENT STICKERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Missions (8/12) */}
        <div className="lg:col-span-8 sketch-card bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#E6D7C3] pb-3">
            <div className="flex items-center gap-2">
              <HandDrawnSticker sticker="sparkles" size={32} />
              <h3 className="text-base font-black text-[#4A3728]">
                經紀人日常任務中心（完成領取角色 XP 經驗值）
              </h3>
            </div>
            <span className="text-[11px] font-bold text-[#8C7365] hidden sm:inline">
              經驗值僅來自任務
            </span>
          </div>

          <div className="space-y-2.5">
            {dailyMissions.map(mission => (
              <div
                key={mission.id}
                className="p-3.5 rounded-2xl border-2 border-[#4A3728] bg-[#FFFDF7] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => completeDailyMission(mission.id)}
                    disabled={mission.isCompleted}
                    className={`w-6 h-6 rounded-xl border-2 border-[#4A3728] flex items-center justify-center transition-all cursor-pointer ${
                      mission.isCompleted
                        ? 'bg-[#1E9E73] text-white shadow-[1px_1px_0px_#4A3728]'
                        : 'bg-white hover:bg-[#FFE3EC]'
                    }`}
                  >
                    {mission.isCompleted && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                  </button>
                  <div>
                    <h5
                      className={`text-xs font-black ${
                        mission.isCompleted
                          ? 'line-through text-[#8C7365]'
                          : 'text-[#4A3728]'
                      }`}
                    >
                      {mission.title}
                    </h5>
                    <p className="text-[11px] font-bold text-[#8C7365] mt-0.5">
                      {mission.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-black font-mono-num text-[#8A5CF5]">
                    +{mission.xp} XP
                  </span>
                  {mission.isCompleted ? (
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#E4FBF0] text-[#1E9E73] border border-[#4A3728]">
                      已達成
                    </span>
                  ) : (
                    <button
                      onClick={() => completeDailyMission(mission.id)}
                      className="sticker-btn px-3 py-1 rounded-full bg-[#FF5C8A] text-white text-xs font-black"
                    >
                      領取
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Transaction & Quick Links (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sketch-card bg-white p-5 space-y-3">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#E6D7C3] pb-2">
              <span className="text-xs font-black text-[#8C7365]">
                最近一筆記帳紀錄
              </span>
              <button
                onClick={() => setActiveTab('bookkeeping')}
                className="text-xs font-black text-[#FF3B75] hover:underline"
              >
                查看完整帳本
              </button>
            </div>

            {latestTransaction ? (
              <div className="p-3.5 rounded-2xl border-2 border-[#4A3728] bg-[#FFFDF7] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#4A3728] flex items-center gap-1.5">
                    <HandDrawnSticker sticker={latestTransaction.detailedItem ? 'photocard' : 'sparkles'} size={24} />
                    {latestTransaction.category}
                  </span>
                  <span
                    className={`font-mono-num text-sm font-black ${
                      latestTransaction.type === 'income'
                        ? 'text-[#1E9E73]'
                        : 'text-[#FF3B75]'
                    }`}
                  >
                    {latestTransaction.type === 'income' ? '+' : '-'} NT${' '}
                    {latestTransaction.amount.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#6E5646] truncate">
                  {latestTransaction.note || '無備註'}
                </p>
                <div className="text-[10px] font-mono-num font-bold text-[#8C7365] flex items-center justify-between">
                  <span>{latestTransaction.date}</span>
                  <span>{latestTransaction.categoryGroup === 'idol' ? '🎤 追星' : '🍱 日常'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-[#8C7365] text-center py-6">
                目前尚無收支紀錄，點擊上方快速記一筆吧！
              </p>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('collectibles')}
              className="sketch-card bg-[#FFEBF2] p-3.5 text-left hover:-translate-y-0.5 transition-transform"
            >
              <div className="text-xl">💖</div>
              <div className="text-xs font-black text-[#4A3728] mt-1">
                追星收藏冊
              </div>
              <div className="text-[10px] font-bold text-[#8C7365]">小卡周邊照片牆</div>
            </button>

            <button
              onClick={() => setActiveTab('memories')}
              className="sketch-card bg-[#F2EAFF] p-3.5 text-left hover:-translate-y-0.5 transition-transform"
            >
              <div className="text-xl">🎟️</div>
              <div className="text-xs font-black text-[#4A3728] mt-1">
                星途回憶館
              </div>
              <div className="text-[10px] font-bold text-[#8C7365]">紀念票根年度回顧</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
