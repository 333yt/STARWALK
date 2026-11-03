import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ticket,
  Plus,
  Compass,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  History,
  Trash2,
  Star
} from 'lucide-react';
import { ConcertGoal } from '../types';

export const ConcertsView: React.FC = () => {
  const {
    concerts,
    primaryConcert,
    setPrimaryConcert,
    addConcertGoal,
    updateConcertGoal,
    deleteConcertGoal,
    allocateConcertFund,
    withdrawConcertFund,
    concertTasks,
    toggleConcertTask,
    addConcertTask,
    deleteConcertTask,
    fundAllocations,
    availableUnallocatedFunds,
    totalLiquidAssets,
    characterProfile
  } = useApp();

  const [selectedConcertId, setSelectedConcertId] = useState<string>(
    primaryConcert?.id || concerts[0]?.id || ''
  );

  const activeConcert = concerts.find(c => c.id === selectedConcertId) || primaryConcert || concerts[0];

  // Modals state
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundActionType, setFundActionType] = useState<'allocate' | 'withdraw'>('allocate');
  const [fundAmountStr, setFundAmountStr] = useState<string>('');
  const [fundNote, setFundNote] = useState<string>('');
  const [fundErrorMsg, setFundErrorMsg] = useState<string>('');

  // New Goal Form state
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCountry, setNewCountry] = useState('台灣');
  const [newCity, setNewCity] = useState('台北');
  const [newVenue, setNewVenue] = useState('台北小巨蛋');
  const [newTicketPrice, setNewTicketPrice] = useState('6800');
  const [newTravelPrice, setNewTravelPrice] = useState('1500');
  const [newLodgingPrice, setNewLodgingPrice] = useState('3000');
  const [newMerchPrice, setNewMerchPrice] = useState('3500');
  const [newOtherPrice, setNewOtherPrice] = useState('1200');
  const [newCoverImage, setNewCoverImage] = useState('/src/assets/images/idol_character_superstar_1793698981923.jpg');
  const [newNotes, setNewNotes] = useState('');

  // New Task input
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Calculations for active concert
  const totalTargetBudget = activeConcert ? activeConcert.budgetPlan.total : 1;
  const currentAllocated = activeConcert ? activeConcert.allocatedFund : 0;
  const progressPercent = Math.min(100, (currentAllocated / totalTargetBudget) * 100);

  // Active concert tasks
  const activeTasks = concertTasks.filter(t => t.concertId === activeConcert?.id);
  const completedTaskCount = activeTasks.filter(t => t.isCompleted).length;
  const taskCompletionRate = activeTasks.length > 0 ? Math.round((completedTaskCount / activeTasks.length) * 100) : 0;

  // Active concert fund allocation history
  const activeFundHistory = fundAllocations.filter(f => f.concertId === activeConcert?.id);

  // Handle Fund Submit
  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFundErrorMsg('');
    const amount = parseInt(fundAmountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      setFundErrorMsg('請輸入大於 0 的有效金額');
      return;
    }

    if (fundActionType === 'allocate') {
      const result = allocateConcertFund(activeConcert.id, amount, fundNote.trim() || '分配演唱會專款');
      if (!result.success) {
        setFundErrorMsg(result.message);
        return;
      }
    } else {
      const result = withdrawConcertFund(activeConcert.id, amount, fundNote.trim() || '提領部分基金');
      if (!result.success) {
        setFundErrorMsg(result.message);
        return;
      }
    }

    setFundAmountStr('');
    setFundNote('');
    setIsFundModalOpen(false);
  };

  // Handle Add Goal Submit
  const handleAddGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newArtist.trim()) {
      alert('請填寫演唱會名稱與藝人/團體名稱');
      return;
    }

    const ticket = parseInt(newTicketPrice, 10) || 0;
    const travel = parseInt(newTravelPrice, 10) || 0;
    const lodging = parseInt(newLodgingPrice, 10) || 0;
    const merchandise = parseInt(newMerchPrice, 10) || 0;
    const other = parseInt(newOtherPrice, 10) || 0;
    const total = ticket + travel + lodging + merchandise + other;

    addConcertGoal({
      title: newTitle.trim(),
      artist: newArtist.trim(),
      date: newDate || undefined,
      country: newCountry.trim(),
      city: newCity.trim(),
      venue: newVenue.trim(),
      budgetPlan: {
        ticket,
        travel,
        lodging,
        merchandise,
        other,
        total
      },
      coverImage: newCoverImage,
      notes: newNotes.trim()
    });

    setIsAddGoalOpen(false);
    // Reset form
    setNewTitle('');
    setNewArtist('');
  };

  // Handle Add Task
  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeConcert) return;
    addConcertTask(activeConcert.id, newTaskTitle.trim(), 15);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header and Goal Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-pink-500" />
            <span>🎫 演唱會旅程與專屬基金</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            設定多場偶像舞台目標，透過專款儲蓄推動娃娃前進，不與生活消費混淆！
          </p>
        </div>

        <button
          onClick={() => setIsAddGoalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>建立新演唱會目標</span>
        </button>
      </div>

      {/* Goal Switcher Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {concerts.map(c => {
          const isSelected = c.id === activeConcert?.id;
          const prog = Math.min(100, (c.allocatedFund / (c.budgetPlan.total || 1)) * 100);
          return (
            <button
              key={c.id}
              onClick={() => setSelectedConcertId(c.id)}
              className={`px-4 py-2.5 rounded-2xl border text-left shrink-0 transition-all ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 border-pink-400 dark:border-pink-500 shadow-sm ring-2 ring-pink-500/20'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:bg-white'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                  {c.title}
                </span>
                {c.isPrimary && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold bg-pink-500 text-white rounded-md">
                    主旅程
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                <span>{c.artist}</span>
                <span>·</span>
                <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                  {prog.toFixed(1)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {activeConcert && (
        <>
          {/* Main Stage & Doll Continuous Forward Progress Map */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            {/* Top row info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                    {activeConcert.artist}
                  </span>
                  <span className="text-xs text-slate-400">
                    📍 {activeConcert.country} · {activeConcert.city} · {activeConcert.venue}
                  </span>
                  {activeConcert.date && (
                    <span className="text-xs text-slate-400">
                      📅 {activeConcert.date}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {activeConcert.title}
                </h3>
              </div>

              {/* Fund Action Buttons */}
              <div className="flex items-center gap-2">
                {!activeConcert.isPrimary && (
                  <button
                    onClick={() => setPrimaryConcert(activeConcert.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 rounded-xl"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>設為首頁主旅程</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setFundActionType('allocate');
                    setIsFundModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-xl shadow-sm"
                >
                  💰 分配基金
                </button>
                <button
                  onClick={() => {
                    setFundActionType('withdraw');
                    setIsFundModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  ↩️ 提領基金
                </button>
              </div>
            </div>

            {/* Continuous Doll Progression Map Canvas / UI */}
            <div className="my-8 px-4 py-8 rounded-2xl bg-gradient-to-b from-pink-50/50 via-purple-50/20 to-transparent dark:from-slate-800/40 dark:via-slate-800/20 dark:to-transparent border border-pink-100 dark:border-slate-800 relative">
              <div className="flex justify-between items-center mb-6 text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>🌟 娃娃連續前進系統（依據專屬儲蓄基金達成率連續位移）</span>
                <span className="font-mono text-base text-pink-600 dark:text-pink-400 font-black">
                  {progressPercent.toFixed(1)}% 蓄力達成
                </span>
              </div>

              {/* The Milestone Track */}
              <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full my-12">
                {/* Active Colored Bar */}
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />

                {/* The Continuous Doll Marker! */}
                <div
                  className="absolute -top-7 transition-all duration-700 transform -translate-x-1/2 z-20 group cursor-pointer"
                  style={{ left: `${progressPercent}%` }}
                >
                  <div className="relative flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full border-3 border-pink-500 bg-white dark:bg-slate-900 shadow-xl overflow-hidden ring-4 ring-pink-300/40 transform group-hover:scale-110 transition-transform">
                      <img
                        src={characterProfile.avatarUrl}
                        alt="My Doll"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-600 text-white shadow-md whitespace-nowrap">
                      {progressPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 6 Fixed Milestones on the route */}
                {[
                  { pos: 0, label: '🏠 出發準備', desc: '啟動夢想' },
                  { pos: 20, label: '💰 儲蓄計畫', desc: '自律日常' },
                  { pos: 40, label: '🎟️ 購票準備', desc: '備戰搶票' },
                  { pos: 60, label: '🚆 交通與住宿', desc: '早鳥訂購' },
                  { pos: 80, label: '🎁 應援準備', desc: '手燈手幅' },
                  { pos: 100, label: '🏟️ 演唱會現場', desc: '巨蛋發光' }
                ].map((station, i) => (
                  <div
                    key={i}
                    className="absolute -top-3 transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${station.pos}%` }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full border-2 transition-colors ${
                        progressPercent >= station.pos
                          ? 'bg-pink-500 border-white dark:border-slate-900'
                          : 'bg-slate-300 dark:bg-slate-700 border-white dark:border-slate-900'
                      }`}
                    />
                    <div className="mt-6 text-center whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {station.label}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {station.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Breakdown & Available Fund Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Financial Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">此目標總預算</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    NT$ {activeConcert.budgetPlan.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">已分配專用基金</span>
                  <span className="font-mono font-bold text-pink-600 dark:text-pink-400 text-sm">
                    NT$ {activeConcert.allocatedFund.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">尚需儲蓄額度</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    NT$ {Math.max(0, activeConcert.budgetPlan.total - activeConcert.allocatedFund).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex justify-between">
                  <span>全帳戶未分配流動資金：</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    NT$ {availableUnallocatedFunds.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Sub-budget Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white mb-1">
                  📊 預算細目自訂規劃
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>🎟️ 預計門票</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    NT$ {activeConcert.budgetPlan.ticket.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>🚆 交通車資</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    NT$ {activeConcert.budgetPlan.travel.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>🏨 住宿費用</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    NT$ {activeConcert.budgetPlan.lodging.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>🍭 應援周邊</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    NT$ {activeConcert.budgetPlan.merchandise.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Goal Notes & Action */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                    📝 經紀人備忘錄
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                    {activeConcert.notes || '尚無特別備註'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-slate-400">目標管理</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`確定要刪除「${activeConcert.title}」目標嗎？已分配的基金將會退回未分配池。`)) {
                        deleteConcertGoal(activeConcert.id);
                      }
                    }}
                    className="text-rose-500 hover:text-rose-600 flex items-center gap-1 text-[11px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>刪除此演唱會</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Concert Preparation Tasks & Allocation History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preparation Tasks (Checklist) */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>📋 演唱會準備任務清單</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    任務進度：{completedTaskCount}/{activeTasks.length} ({taskCompletionRate}%) · 基金達成與任務分開獨立
                  </p>
                </div>
              </div>

              {/* Add custom task */}
              <form onSubmit={handleAddTaskSubmit} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="新增專屬準備任務（如：買水、列印購票證明）..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shrink-0"
                >
                  新增
                </button>
              </form>

              {/* Task list */}
              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                {activeTasks.map(task => (
                  <div
                    key={task.id}
                    className="py-2.5 flex items-center justify-between gap-3 group"
                  >
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => toggleConcertTask(task.id)}
                        className="rounded text-pink-500 focus:ring-pink-400 w-4 h-4 cursor-pointer"
                      />
                      <span
                        className={`text-xs ${
                          task.isCompleted
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200 font-medium'
                        }`}
                      >
                        {task.title}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                        +{task.xpReward} XP
                      </span>
                      <button
                        onClick={() => deleteConcertTask(task.id)}
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fund Allocation History */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-purple-500" />
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    基金分配與異動紀錄
                  </h4>
                </div>
                <span className="text-xs text-slate-400">專款專用記錄</span>
              </div>

              <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                {activeFundHistory.length > 0 ? (
                  activeFundHistory.map(record => (
                    <div key={record.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {record.type === 'allocate' ? '💎 分配專款存入' : '↩️ 提領資金至資金池'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {record.date} · {record.note}
                        </div>
                      </div>
                      <div
                        className={`font-mono font-bold text-sm tabular-nums ${
                          record.type === 'allocate' ? 'text-pink-600 dark:text-pink-400' : 'text-slate-500'
                        }`}
                      >
                        {record.type === 'allocate' ? '+' : '-'} NT$ {record.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    目前尚未有基金分配紀錄，點擊上方「分配基金」開始存錢吧！
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fund Allocate / Withdraw Modal */}
      {isFundModalOpen && activeConcert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {fundActionType === 'allocate' ? '💰 分配演唱會專款基金' : '↩️ 提領已分配基金'}
            </h3>
            <p className="text-xs text-slate-500">
              目標：{activeConcert.title}
            </p>

            {fundErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 text-xs">
                {fundErrorMsg}
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">可用未分配總流動資金：</span>
                <span className="font-mono font-bold text-emerald-500">
                  NT$ {availableUnallocatedFunds.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">此演唱會目前已存基金：</span>
                <span className="font-mono font-bold text-pink-500">
                  NT$ {activeConcert.allocatedFund.toLocaleString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleFundSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {fundActionType === 'allocate' ? '要分配的金額 (NT$)' : '要提領退回的金額 (NT$)'}
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="例如：3000"
                  value={fundAmountStr}
                  onChange={e => setFundAmountStr(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-sm font-bold font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  異動備註
                </label>
                <input
                  type="text"
                  placeholder="例如：發薪日分配、省下手搖杯錢"
                  value={fundNote}
                  onChange={e => setFundNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl"
                >
                  確認{fundActionType === 'allocate' ? '分配' : '提領'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddGoalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-pink-500" />
              <span>建立新演唱會目標</span>
            </h3>

            <form onSubmit={handleAddGoalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  演唱會名稱 *
                </label>
                <input
                  type="text"
                  placeholder="例如：TWICE 6TH WORLD TOUR IN TAIPEI"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    藝人 / 團體名稱 *
                  </label>
                  <input
                    type="text"
                    placeholder="例如：TWICE / SEVENTEEN"
                    value={newArtist}
                    onChange={e => setNewArtist(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    演唱會日期（未定可不填）
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">國家</label>
                  <input
                    type="text"
                    value={newCountry}
                    onChange={e => setNewCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">城市</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">場館</label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={e => setNewVenue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Budget Details Inputs */}
              <div className="p-3 rounded-xl bg-pink-50/50 dark:bg-slate-800/60 border border-pink-100 dark:border-slate-700 space-y-2">
                <span className="font-bold text-pink-600 dark:text-pink-400 block">
                  各項預算規劃（新台幣 NT$）
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block">預計門票</label>
                    <input
                      type="number"
                      value={newTicketPrice}
                      onChange={e => setNewTicketPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">預計交通</label>
                    <input
                      type="number"
                      value={newTravelPrice}
                      onChange={e => setNewTravelPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">預計住宿</label>
                    <input
                      type="number"
                      value={newLodgingPrice}
                      onChange={e => setNewLodgingPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">應援周邊</label>
                    <input
                      type="number"
                      value={newMerchPrice}
                      onChange={e => setNewMerchPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">其他預備金</label>
                    <input
                      type="number"
                      value={newOtherPrice}
                      onChange={e => setNewOtherPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-[11px] text-slate-500">預算總計：</span>
                    <span className="font-mono font-bold text-sm text-pink-600">
                      NT${' '}
                      {(
                        (parseInt(newTicketPrice, 10) || 0) +
                        (parseInt(newTravelPrice, 10) || 0) +
                        (parseInt(newLodgingPrice, 10) || 0) +
                        (parseInt(newMerchPrice, 10) || 0) +
                        (parseInt(newOtherPrice, 10) || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  備註
                </label>
                <textarea
                  placeholder="例如：準備好實名制驗證，預計提前一天抵達場館排隊..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-16"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl"
                >
                  確認建立演唱會目標
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
