import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ticket,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Trash2,
  Star,
  Edit3,
  MoreVertical,
  Archive,
  FolderArchive,
  History
} from 'lucide-react';
import { ConcertGoal, CurrencyCode } from '../types';
import { EditConcertModal } from '../components/EditConcertModal';
import { DeleteConcertModal } from '../components/DeleteConcertModal';
import { DEFAULT_CONCERT_COVER } from '../assets/defaultAvatars';
import { HandDrawnSticker } from '../components/HandDrawnSticker';
import { CURRENCIES, getCurrencyConfig, calculateBudgetCurrencySums, CurrencySumItem } from '../services/currencyService';

export const ConcertsView: React.FC = () => {
  const {
    concerts,
    accounts,
    primaryConcert,
    setPrimaryConcert,
    addConcertGoal,
    updateConcertGoal,
    deleteConcertGoal,
    toggleArchiveConcert,
    allocateConcertFund,
    withdrawConcertFund,
    concertTasks,
    toggleConcertTask,
    addConcertTask,
    deleteConcertTask,
    fundAllocations,
    availableUnallocatedFunds,
    characterProfile
  } = useApp();

  // Tab mode for Active vs Archived
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active');

  const activeConcerts = concerts.filter(c => !c.isArchived);
  const archivedConcerts = concerts.filter(c => c.isArchived);
  const currentList = viewMode === 'archived' ? archivedConcerts : activeConcerts;

  const [selectedConcertId, setSelectedConcertId] = useState<string>(
    primaryConcert?.id || currentList[0]?.id || ''
  );

  // CRITICAL FIX: activeConcert must strictly be drawn from currentList!
  const activeConcert = currentList.find(c => c.id === selectedConcertId) || currentList[0];

  // Action Menu dropdown state
  const [openMenuConcertId, setOpenMenuConcertId] = useState<string | null>(null);

  // Active concert multi-currency budget breakdown
  const activeConcertItems = useMemo(() => {
    if (!activeConcert) return [];
    const p = activeConcert.budgetPlan;
    return [
      { amount: p.ticket, currency: p.ticketCurrency },
      { amount: p.travel, currency: p.travelCurrency },
      { amount: p.lodging, currency: p.lodgingCurrency },
      { amount: p.merchandise, currency: p.merchandiseCurrency },
      { amount: p.other, currency: p.otherCurrency }
    ];
  }, [activeConcert]);

  const activeConcertBreakdown = useMemo(() => {
    if (!activeConcert) return null;
    return calculateBudgetCurrencySums(activeConcertItems, activeConcert.budgetPlan.mainCurrency || 'TWD');
  }, [activeConcert, activeConcertItems]);

  // Switch between Active vs Archived tabs smoothly
  const handleSwitchViewMode = (mode: 'active' | 'archived') => {
    setViewMode(mode);
    setOpenMenuConcertId(null);
    const targetList = mode === 'archived' ? concerts.filter(c => c.isArchived) : concerts.filter(c => !c.isArchived);
    if (targetList.length > 0) {
      setSelectedConcertId(targetList[0].id);
    } else {
      setSelectedConcertId('');
    }
  };

  // Toggle Archive status smoothly and update selected concert
  const handleToggleArchive = (concertId: string) => {
    toggleArchiveConcert(concertId);
    setOpenMenuConcertId(null);

    // After toggling archive status, select the next available item in the current tab list
    const updatedConcerts = concerts.map(c => c.id === concertId ? { ...c, isArchived: !c.isArchived } : c);
    const targetList = viewMode === 'archived'
      ? updatedConcerts.filter(c => c.isArchived)
      : updatedConcerts.filter(c => !c.isArchived);

    if (targetList.length > 0) {
      setSelectedConcertId(targetList[0].id);
    } else {
      setSelectedConcertId('');
    }
  };

  // Unified Create / Edit Modal state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingConcert, setEditingConcert] = useState<ConcertGoal | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [concertToDelete, setConcertToDelete] = useState<ConcertGoal | null>(null);

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundActionType, setFundActionType] = useState<'allocate' | 'withdraw'>('allocate');
  const [fundAmountStr, setFundAmountStr] = useState<string>('');
  const [fundCurrency, setFundCurrency] = useState<CurrencyCode>('TWD');
  const [fundAccountId, setFundAccountId] = useState<string>('');
  const [fundNote, setFundNote] = useState<string>('');
  const [fundErrorMsg, setFundErrorMsg] = useState<string>('');

  // New Task input
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Calculations for active concert
  const totalTargetBudget = activeConcert ? activeConcert.budgetPlan.total : 1;
  const currentAllocated = activeConcert ? activeConcert.allocatedFund : 0;
  const progressPercent = Math.min(100, (currentAllocated / (totalTargetBudget || 1)) * 100);

  // Active concert tasks
  const activeTasks = concertTasks.filter(t => t.concertId === activeConcert?.id);
  const completedTaskCount = activeTasks.filter(t => t.isCompleted).length;
  const taskCompletionRate = activeTasks.length > 0 ? Math.round((completedTaskCount / activeTasks.length) * 100) : 0;

  // Active concert fund allocation history
  const activeFundHistory = fundAllocations.filter(f => f.concertId === activeConcert?.id);

  // Open Create Goal Modal using unified EditConcertModal in create mode
  const openCreateGoalModal = () => {
    setEditingConcert(null);
    setIsGoalModalOpen(true);
  };

  // Handle Fund Submit
  const handleFundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFundErrorMsg('');
    const amount = parseInt(fundAmountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      setFundErrorMsg('請輸入大於 0 的有效金額');
      return;
    }

    if (!activeConcert) return;

    if (fundActionType === 'allocate') {
      const result = allocateConcertFund(
        activeConcert.id,
        amount,
        fundCurrency,
        fundAccountId || undefined,
        fundNote.trim() || '分配演唱會專款'
      );
      if (!result.success) {
        setFundErrorMsg(result.message);
        return;
      }
    } else {
      const result = withdrawConcertFund(
        activeConcert.id,
        amount,
        fundCurrency,
        fundNote.trim() || '提領部分基金'
      );
      if (!result.success) {
        setFundErrorMsg(result.message);
        return;
      }
    }

    setFundAmountStr('');
    setFundNote('');
    setIsFundModalOpen(false);
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
      {/* Unified Create & Edit Concert Goal Modal */}
      <EditConcertModal
        isOpen={isGoalModalOpen || !!editingConcert}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingConcert(null);
        }}
        concert={editingConcert}
        onSaveConcert={(concertId, updatedData) => {
          updateConcertGoal(concertId, updatedData);
        }}
        onCreateConcert={(newConcert) => {
          addConcertGoal(newConcert);
        }}
      />

      <DeleteConcertModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setConcertToDelete(null);
        }}
        concert={concertToDelete}
        onConfirmDelete={(concertId) => {
          deleteConcertGoal(concertId);
        }}
      />

      {/* Backdrop to close action dropdown menu */}
      {openMenuConcertId && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setOpenMenuConcertId(null)}
        />
      )}

      {/* Header Banner */}
      <div className="sketch-card bg-[#FFF9E6] dark:bg-slate-800 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        <div className="washi-tape-pink absolute -top-3 left-10 w-28 h-5 rounded-sm" />
        <div className="flex items-center gap-3.5">
          <HandDrawnSticker sticker="ticket" size={48} />
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#4A3728] dark:text-slate-100">
              🎫 演唱會旅程與專屬基金
            </h2>
            <p className="text-xs md:text-sm font-bold text-[#8C7365] dark:text-slate-400">
              設定多場演唱會目標，透過專款儲蓄推動娃娃連續前進！
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-center">
          {/* Active vs Archive filter tabs */}
          <div className="p-1 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#4A3728] dark:border-slate-700 shadow-[2px_2px_0px_#4A3728] dark:shadow-[2px_2px_0px_#1e293b] flex items-center gap-1 text-xs font-black">
            <button
              type="button"
              onClick={() => handleSwitchViewMode('active')}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                viewMode === 'active'
                  ? 'bg-[#FFE3EC] text-[#FF3B75] border border-[#4A3728]'
                  : 'text-[#8C7365] dark:text-slate-400 hover:text-[#4A3728]'
              }`}
            >
              進行中 ({activeConcerts.length})
            </button>
            <button
              type="button"
              onClick={() => handleSwitchViewMode('archived')}
              className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'archived'
                  ? 'bg-[#EFE6FF] text-[#8A5CF5] border border-[#4A3728]'
                  : 'text-[#8C7365] dark:text-slate-400 hover:text-[#4A3728]'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>已封存 ({archivedConcerts.length})</span>
            </button>
          </div>

          <button
            onClick={openCreateGoalModal}
            className="sticker-btn px-4 py-2.5 rounded-full bg-[#FF5C8A] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>建立新演唱會</span>
          </button>
        </div>
      </div>

      {/* Goal Switcher Tabs if concerts exist */}
      {currentList.length > 0 && (
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {currentList.map(c => {
            const isSelected = c.id === activeConcert?.id;
            const prog = Math.min(100, (c.allocatedFund / (c.budgetPlan.total || 1)) * 100);
            const isMenuOpen = openMenuConcertId === c.id;

            return (
              <div key={c.id} className="relative shrink-0">
                <button
                  onClick={() => setSelectedConcertId(c.id)}
                  className={`px-4 py-2.5 rounded-2xl border-2 border-[#4A3728] dark:border-slate-700 text-left shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFE3EC] dark:bg-rose-950/80 shadow-[3.5px_3.5px_0px_#4A3728] dark:shadow-[3.5px_3.5px_0px_#1e293b] -translate-y-0.5'
                      : 'bg-white dark:bg-slate-800 hover:bg-[#FFF8FA] dark:hover:bg-slate-750 shadow-[2px_2px_0px_#D9C3B0] dark:shadow-[2px_2px_0px_#1e293b]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#4A3728] dark:text-slate-100 truncate max-w-[150px]">
                        {c.title}
                      </span>
                      {c.isPrimary && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black bg-[#FF5C8A] text-white rounded-md border border-[#4A3728]">
                          主旅程
                        </span>
                      )}
                      {c.isArchived && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black bg-[#8C7365] text-white rounded-md border border-[#4A3728]">
                          已封存
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuConcertId(isMenuOpen ? null : c.id);
                      }}
                      className="p-1 rounded-lg text-[#8C7365] hover:text-[#4A3728] hover:bg-white dark:hover:bg-slate-700 transition-colors"
                      title="更多操作選單 (⋯)"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#8C7365] dark:text-slate-400 mt-1">
                    <span>{c.artist}</span>
                    <span>·</span>
                    {c.isDateTBA ? (
                      <span className="text-[#FF5C8A]">日期待定</span>
                    ) : c.date ? (
                      <span className="font-mono-num">{c.date.substring(5)}</span>
                    ) : null}
                    <span>·</span>
                    <span className="font-mono-num font-black text-[#FF3B75] dark:text-rose-400">
                      {prog.toFixed(1)}%
                    </span>
                  </div>
                </button>

                {/* Dropdown Action Menu (⋯) */}
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 z-30 w-44 rounded-2xl bg-white dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 shadow-[4px_4px_0px_#4A3728] dark:shadow-[4px_4px_0px_#1e293b] p-1.5 space-y-0.5 text-xs animate-stamp">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuConcertId(null);
                        setEditingConcert(c);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left font-black text-[#4A3728] dark:text-slate-100 hover:bg-[#FFE3EC] dark:hover:bg-rose-950/60 hover:text-[#FF3B75] flex items-center gap-2 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>✏️ 編輯演唱會</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleArchive(c.id)}
                      className="w-full px-3 py-2 rounded-xl text-left font-black text-[#4A3728] dark:text-slate-100 hover:bg-[#EFE6FF] dark:hover:bg-purple-950/60 hover:text-[#8A5CF5] flex items-center gap-2 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>{c.isArchived ? '🔓 取消封存' : '📁 封存此旅程'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuConcertId(null);
                        setConcertToDelete(c);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left font-black text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>🗑️ 刪除演唱會</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* When no concerts exist: Beautiful Hand-Drawn Empty State */}
      {currentList.length === 0 ? (
        <div className="sketch-dashed-box p-10 md:p-14 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FFE3EC] dark:bg-rose-950 border-2 border-[#4A3728] dark:border-rose-700 shadow-[3px_3px_0px_#4A3728] flex items-center justify-center text-3xl">
            🎫
          </div>
          <div>
            <h3 className="text-lg font-black text-[#4A3728] dark:text-slate-100">
              還沒有建立演唱會旅程，新增你的第一場演唱會吧！
            </h3>
            <p className="text-xs font-bold text-[#8C7365] dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              不限音樂類型！自由建立華語歌手、日韓藝人、西洋偶像、獨立樂團或音樂祭。可自訂上傳封面照片，日期未定也能標記「日期待公布」，一步步啟動專屬存錢地圖！
            </p>
          </div>
          <button
            onClick={openCreateGoalModal}
            className="sticker-btn px-6 py-3 rounded-full bg-[#FF5C8A] text-white text-xs font-black inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>＋ 建立第一場演唱會</span>
          </button>
        </div>
      ) : activeConcert ? (
        <>
          {/* Main Stage & Doll Continuous Forward Progress Map */}
          <div className="sketch-card bg-white dark:bg-slate-900 p-6 relative overflow-hidden">
            {/* Cover Banner & Info Row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b-2 border-dashed border-[#E6D7C3] dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                <div className="w-full sm:w-36 h-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#4A3728] dark:border-slate-700 shrink-0 bg-slate-900 relative shadow-[2px_2px_0px_#4A3728]">
                  <img
                    src={activeConcert.coverImage || DEFAULT_CONCERT_COVER}
                    alt={activeConcert.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#EFE6FF] dark:bg-purple-950 text-[#8A5CF5] dark:text-purple-300 border border-[#4A3728]">
                      {activeConcert.artist}
                    </span>
                    <span className="text-xs font-bold text-[#8C7365] dark:text-slate-400">
                      📍 {activeConcert.country} · {activeConcert.city} · {activeConcert.venue}
                    </span>
                    {activeConcert.isDateTBA ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFE3EC] dark:bg-rose-950 text-[#FF3B75] dark:text-rose-300 font-black border border-[#4A3728]">
                        📅 日期待公布
                      </span>
                    ) : activeConcert.date ? (
                      <span className="text-xs font-bold text-[#8C7365] dark:text-slate-400 font-mono-num">
                        📅 {activeConcert.date}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="text-xl font-black text-[#4A3728] dark:text-slate-100">
                    {activeConcert.title}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setEditingConcert(activeConcert)}
                  className="sticker-btn-soft px-3 py-1.5 text-xs font-black text-[#4A3728] dark:text-slate-200 bg-white dark:bg-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#FF5C8A]" />
                  <span>編輯資訊</span>
                </button>

                {!activeConcert.isPrimary && (
                  <button
                    onClick={() => setPrimaryConcert(activeConcert.id)}
                    className="sticker-btn-soft px-3 py-1.5 text-xs font-black text-[#4A3728] dark:text-slate-200 bg-[#FFF5D6] dark:bg-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-[#E58A1F] text-[#E58A1F]" />
                    <span>設為主旅程</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setFundActionType('allocate');
                    setIsFundModalOpen(true);
                  }}
                  className="sticker-btn px-3.5 py-1.5 text-xs font-black text-white bg-[#FF5C8A] rounded-full cursor-pointer"
                >
                  💰 分配基金
                </button>
                <button
                  onClick={() => {
                    setFundActionType('withdraw');
                    setIsFundModalOpen(true);
                  }}
                  className="sticker-btn-soft px-3.5 py-1.5 text-xs font-black text-[#4A3728] dark:text-slate-200 bg-white dark:bg-slate-800 rounded-full cursor-pointer"
                >
                  ↩️ 提領基金
                </button>
              </div>
            </div>

            {/* Continuous Doll Progression Track */}
            <div className="my-8 px-4 py-8 rounded-3xl bg-[#FFF8FA] dark:bg-slate-800/60 border-2 border-[#4A3728] dark:border-slate-700 relative shadow-inner">
              <div className="flex justify-between items-center mb-6 text-xs font-black text-[#4A3728] dark:text-slate-200">
                <span>🌟 娃娃連續前進系統（依據專屬儲蓄基金達成率連續位移）</span>
                <span className="font-mono-num text-lg text-[#FF3B75] dark:text-rose-400 font-black">
                  {progressPercent.toFixed(1)}% 蓄力達成
                </span>
              </div>

              {/* Milestone Track Line */}
              <div className="relative w-full h-4 bg-[#F5EBE1] dark:bg-slate-700 border-2 border-[#4A3728] dark:border-slate-600 rounded-full my-12">
                <div
                  className="h-full crayon-stripe-pink rounded-full transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />

                {/* Continuous Doll Marker */}
                <div
                  className="absolute -top-7 transition-all duration-700 transform -translate-x-1/2 z-20"
                  style={{ left: `${progressPercent}%` }}
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl border-2 border-[#4A3728] bg-white dark:bg-slate-800 shadow-[3px_3px_0px_#4A3728] overflow-hidden p-0.5 animate-bounce">
                      <img
                        src={characterProfile.avatarUrl}
                        alt="Idol Doll"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-[#4A3728] text-white text-[10px] font-mono-num font-black px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                      {progressPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* 5 Milestone Stations */}
                {[
                  { pos: 0, label: '🏠 出發起點' },
                  { pos: 25, label: '🎟️ 搶票成功' },
                  { pos: 50, label: '🚆 交通訂房' },
                  { pos: 75, label: '🍭 應援周邊' },
                  { pos: 100, label: '🏟️ 巨蛋登頂' }
                ].map((station, idx) => (
                  <div
                    key={idx}
                    className="absolute -top-3 transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${station.pos}%` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 border-[#4A3728] flex items-center justify-center text-xs font-black transition-all shadow-[2px_2px_0px_#4A3728] ${
                        progressPercent >= station.pos
                          ? 'bg-[#FF5C8A] text-white scale-110'
                          : 'bg-white dark:bg-slate-800 text-[#8C7365] dark:text-slate-400'
                      }`}
                    >
                      {station.pos}%
                    </div>
                    <div className="mt-2 text-center whitespace-nowrap">
                      <div
                        className={`text-xs font-black ${
                          progressPercent >= station.pos
                            ? 'text-[#FF3B75] dark:text-rose-400'
                            : 'text-[#8C7365] dark:text-slate-400'
                        }`}
                      >
                        {station.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Breakdown & Available Fund Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <div className="p-4 rounded-2xl bg-[#FFFDF7] dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 shadow-[2.5px_2.5px_0px_#E6D7C3] dark:shadow-[2.5px_2.5px_0px_#1e293b] space-y-2.5">
                <div className="flex flex-col gap-1 text-xs font-bold text-[#8C7365] dark:text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>此目標總預算</span>
                    <span className="font-mono-num font-black text-[#4A3728] dark:text-slate-100">
                      NT$ {activeConcert.budgetPlan.total.toLocaleString()}
                    </span>
                  </div>

                  {activeConcertBreakdown && !activeConcertBreakdown.isSingleCurrency && (
                    <div className="p-1.5 rounded-lg bg-[#FFE3EC]/60 dark:bg-rose-950/40 border border-[#FF5C8A]/40 text-[10px] font-mono-num space-y-0.5 mt-1">
                      <div className="font-bold text-[#FF3B75] dark:text-rose-300">各幣種小計：</div>
                      <div className="flex flex-wrap gap-1">
                        {activeConcertBreakdown.sums.map((s: CurrencySumItem) => (
                          <span key={s.code} className="bg-white dark:bg-slate-800 px-1 py-0.2 rounded border border-[#4A3728]">
                            {s.flag} {s.symbol} {s.amount.toLocaleString()} {s.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-[#8C7365] dark:text-slate-300">
                  <span>已分配專用基金</span>
                  <span className="font-mono-num font-black text-[#FF3B75] dark:text-rose-400 text-sm">
                    NT$ {activeConcert.allocatedFund.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-[#8C7365] dark:text-slate-300">
                  <span>尚需儲蓄額度</span>
                  <span className="font-mono-num font-black text-[#4A3728] dark:text-slate-100">
                    NT$ {Math.max(0, activeConcert.budgetPlan.total - activeConcert.allocatedFund).toLocaleString()}
                  </span>
                </div>
                <div className="pt-2 border-t border-dashed border-[#E6D7C3] dark:border-slate-700 text-[11px] font-bold text-[#8C7365] dark:text-slate-400 flex justify-between">
                  <span>全帳戶未分配流動資金：</span>
                  <span className="font-mono-num font-black text-[#1E9E73] dark:text-emerald-400">
                    NT$ {availableUnallocatedFunds.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF7] dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 shadow-[2.5px_2.5px_0px_#E6D7C3] dark:shadow-[2.5px_2.5px_0px_#1e293b] space-y-2 text-xs">
                <div className="font-black text-[#4A3728] dark:text-slate-100 mb-1">
                  📊 預算細目劃分 (各原幣額度)
                </div>
                <div className="flex justify-between text-[#8C7365] dark:text-slate-300 font-bold">
                  <span>🎟️ 預計門票</span>
                  <span className="font-mono-num text-[#4A3728] dark:text-slate-100">
                    {(() => {
                      const c = activeConcert.budgetPlan.ticketCurrency || activeConcert.budgetPlan.mainCurrency || 'TWD';
                      const cfg = getCurrencyConfig(c);
                      return `${cfg.flag} ${cfg.symbol} ${activeConcert.budgetPlan.ticket.toLocaleString()} ${c}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-[#8C7365] dark:text-slate-300 font-bold">
                  <span>🚆 交通車資</span>
                  <span className="font-mono-num text-[#4A3728] dark:text-slate-100">
                    {(() => {
                      const c = activeConcert.budgetPlan.travelCurrency || activeConcert.budgetPlan.mainCurrency || 'TWD';
                      const cfg = getCurrencyConfig(c);
                      return `${cfg.flag} ${cfg.symbol} ${activeConcert.budgetPlan.travel.toLocaleString()} ${c}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-[#8C7365] dark:text-slate-300 font-bold">
                  <span>🏨 住宿費用</span>
                  <span className="font-mono-num text-[#4A3728] dark:text-slate-100">
                    {(() => {
                      const c = activeConcert.budgetPlan.lodgingCurrency || activeConcert.budgetPlan.mainCurrency || 'TWD';
                      const cfg = getCurrencyConfig(c);
                      return `${cfg.flag} ${cfg.symbol} ${activeConcert.budgetPlan.lodging.toLocaleString()} ${c}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-[#8C7365] dark:text-slate-300 font-bold">
                  <span>🍭 應援周邊</span>
                  <span className="font-mono-num text-[#4A3728] dark:text-slate-100">
                    {(() => {
                      const c = activeConcert.budgetPlan.merchandiseCurrency || activeConcert.budgetPlan.mainCurrency || 'TWD';
                      const cfg = getCurrencyConfig(c);
                      return `${cfg.flag} ${cfg.symbol} ${activeConcert.budgetPlan.merchandise.toLocaleString()} ${c}`;
                    })()}
                  </span>
                </div>
                <div className="flex justify-between text-[#8C7365] dark:text-slate-300 font-bold">
                  <span>📦 雜項預備</span>
                  <span className="font-mono-num text-[#4A3728] dark:text-slate-100">
                    {(() => {
                      const c = activeConcert.budgetPlan.otherCurrency || activeConcert.budgetPlan.mainCurrency || 'TWD';
                      const cfg = getCurrencyConfig(c);
                      return `${cfg.flag} ${cfg.symbol} ${activeConcert.budgetPlan.other.toLocaleString()} ${c}`;
                    })()}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFFDF7] dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 shadow-[2.5px_2.5px_0px_#E6D7C3] dark:shadow-[2.5px_2.5px_0px_#1e293b] flex flex-col justify-between">
                <div>
                  <div className="font-black text-[#4A3728] dark:text-slate-100 text-xs mb-1">
                    📝 經紀人備忘錄
                  </div>
                  <p className="text-xs font-bold text-[#8C7365] dark:text-slate-400 italic leading-relaxed">
                    {activeConcert.notes || '尚無特別備註'}
                  </p>
                </div>

                <div className="pt-3 border-t border-dashed border-[#E6D7C3] dark:border-slate-700 flex justify-between items-center text-xs">
                  <span className="text-[#8C7365] dark:text-slate-400 font-bold">目標管理</span>
                  <button
                    onClick={() => {
                      setConcertToDelete(activeConcert);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 text-xs font-black cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>刪除此演唱會</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Tasks Checklist & Fund History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="sketch-card bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3] dark:border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-[#4A3728] dark:text-slate-100 flex items-center gap-2">
                    📋 演唱會準備任務清單
                  </h4>
                  <p className="text-[11px] font-bold text-[#8C7365] dark:text-slate-400 mt-0.5">
                    任務進度：{completedTaskCount}/{activeTasks.length} ({taskCompletionRate}%)
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddTaskSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="新增準備任務（例：預約應援餐廳、準備行動電源）..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs font-bold rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-[#FFFDF7] dark:bg-slate-800 text-[#4A3728] dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="sticker-btn px-4 py-2 text-xs font-black text-white bg-[#FF5C8A] rounded-xl cursor-pointer"
                >
                  新增
                </button>
              </form>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeTasks.length > 0 ? (
                  activeTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-[#FFFDF7] dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleConcertTask(task.id)}
                          className={`w-5 h-5 rounded-lg border-2 border-[#4A3728] dark:border-slate-600 flex items-center justify-center transition-all cursor-pointer ${
                            task.isCompleted
                              ? 'bg-[#1E9E73] text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 hover:bg-[#FFE3EC]'
                          }`}
                        >
                          {task.isCompleted && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <span
                          className={`text-xs font-bold ${
                            task.isCompleted
                              ? 'line-through text-[#8C7365] dark:text-slate-500'
                              : 'text-[#4A3728] dark:text-slate-100'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono-num font-black text-[#8A5CF5] dark:text-purple-300">
                          +{task.xpReward} XP
                        </span>
                        <button
                          onClick={() => deleteConcertTask(task.id)}
                          className="text-[#8C7365] dark:text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-[#8C7365] dark:text-slate-400 text-center py-6">
                    尚無準備任務，輸入上方欄位建立專屬清單！
                  </p>
                )}
              </div>
            </div>

            {/* Fund Allocation History */}
            <div className="sketch-card bg-white dark:bg-slate-900 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-[#E6D7C3] dark:border-slate-800">
                <div>
                  <h4 className="font-black text-sm text-[#4A3728] dark:text-slate-100 flex items-center gap-2">
                    <History className="w-4 h-4 text-[#8A5CF5]" />
                    <span>專款基金存提明細紀錄</span>
                  </h4>
                  <p className="text-[11px] font-bold text-[#8C7365] dark:text-slate-400 mt-0.5">
                    資金劃分與日常生活帳務清晰隔離
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeFundHistory.length > 0 ? (
                  activeFundHistory.map(record => (
                    <div
                      key={record.id}
                      className="p-3 rounded-2xl bg-[#FFFDF7] dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 flex items-center justify-between text-xs font-bold"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black border border-[#4A3728] ${
                              record.type === 'allocate'
                                ? 'bg-[#FFE3EC] dark:bg-rose-950 text-[#FF3B75] dark:text-rose-300'
                                : 'bg-[#E2CFC0] dark:bg-slate-700 text-[#4A3728] dark:text-slate-200'
                            }`}
                          >
                            {record.type === 'allocate' ? '分配專款' : '基金退回'}
                          </span>
                          <span className="text-[#4A3728] dark:text-slate-100">{record.note}</span>
                        </div>
                        <div className="text-[10px] font-mono-num text-[#8C7365] dark:text-slate-400 mt-1">
                          {record.date}
                        </div>
                      </div>

                      <div
                        className={`font-mono-num font-black text-sm ${
                          record.type === 'allocate' ? 'text-[#FF3B75] dark:text-rose-400' : 'text-[#8C7365] dark:text-slate-400'
                        }`}
                      >
                        {record.type === 'allocate' ? '+' : '-'} NT$ {record.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-[#8C7365] dark:text-slate-400 text-center py-6">
                    此目標尚未進行專款分配，點擊上方「分配基金」開始存錢吧！
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Fund Action Modal */}
      {isFundModalOpen && activeConcert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A3728]/45 backdrop-blur-xs">
          <div className="sketch-card relative w-full max-w-sm bg-[#FFFDF7] dark:bg-slate-900 p-6 animate-stamp space-y-4">
            <h3 className="text-base font-black text-[#4A3728] dark:text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#FF5C8A]" />
              <span>
                {fundActionType === 'allocate' ? '分配演唱會專款' : '提領基金至未分配池'}
              </span>
            </h3>

            <p className="text-xs font-bold text-[#8C7365] dark:text-slate-300">
              目標：{activeConcert.title}
              <br />
              當前已分配：NT$ {activeConcert.allocatedFund.toLocaleString()}
              {fundActionType === 'allocate' && (
                <span className="block mt-1 text-[#1E9E73] dark:text-emerald-400">
                  帳戶未分配餘額：NT$ {availableUnallocatedFunds.toLocaleString()}
                </span>
              )}
            </p>

            {fundErrorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 border-2 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
                {fundErrorMsg}
              </div>
            )}

            <form onSubmit={handleFundSubmit} className="space-y-3 text-xs">
              {fundActionType === 'allocate' && accounts.length > 0 && (
                <div>
                  <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                    劃撥資產帳戶
                  </label>
                  <select
                    value={fundAccountId}
                    onChange={e => {
                      setFundAccountId(e.target.value);
                      const acc = accounts.find(a => a.id === e.target.value);
                      if (acc?.currency) setFundCurrency(acc.currency);
                    }}
                    className="w-full px-3 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100"
                  >
                    <option value="">-- 使用未分配流動資金總池 --</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency || 'TWD'} {acc.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                    金額 *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="例如：3000"
                    value={fundAmountStr}
                    onChange={e => setFundAmountStr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-num text-base font-bold text-[#FF5C8A] dark:text-rose-400"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                    幣種
                  </label>
                  <select
                    value={fundCurrency}
                    onChange={e => setFundCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-2 py-2.5 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-[#4A3728] dark:text-slate-100"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#4A3728] dark:text-slate-200 font-black mb-1">
                  備註說明
                </label>
                <input
                  type="text"
                  placeholder="例如：發薪存入門票預備款"
                  value={fundNote}
                  onChange={e => setFundNote(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border-2 border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#4A3728] dark:text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFundModalOpen(false)}
                  className="sticker-btn-soft flex-1 py-2 text-xs font-black bg-white dark:bg-slate-800 text-[#4A3728] dark:text-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="sticker-btn flex-1 py-2 text-xs font-black text-white bg-[#FF5C8A]"
                >
                  確認{fundActionType === 'allocate' ? '分配' : '提領'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
