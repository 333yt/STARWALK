import React, { useState, useRef } from 'react';
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
  Star,
  Upload,
  Image as ImageIcon,
  X,
  Edit3
} from 'lucide-react';
import { ConcertGoal } from '../types';
import { processGeneralImage } from '../utils/imageUtils';

export const DEFAULT_CONCERT_COVER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><defs><linearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'><stop offset='0%25' stop-color='%231e1b4b'/><stop offset='50%25' stop-color='%234c1d95'/><stop offset='100%25' stop-color='%23831843'/></linearGradient><linearGradient id='beam1' x1='0%25' y1='0%25' x2='50%25' y2='100%25'><stop offset='0%25' stop-color='%23ec4899' stop-opacity='0.6'/><stop offset='100%25' stop-color='%23ec4899' stop-opacity='0'/></linearGradient><linearGradient id='beam2' x1='100%25' y1='0%25' x2='50%25' y2='100%25'><stop offset='0%25' stop-color='%238b5cf6' stop-opacity='0.6'/><stop offset='100%25' stop-color='%238b5cf6' stop-opacity='0'/></linearGradient></defs><rect width='100%25' height='100%25' fill='url(%23bg)'/><polygon points='100,0 350,450 450,450 200,0' fill='url(%23beam1)'/><polygon points='700,0 450,450 350,450 600,0' fill='url(%23beam2)'/><circle cx='400' cy='225' r='55' fill='%23ffffff' fill-opacity='0.08'/><text x='50%25' y='46%25' dominant-baseline='middle' text-anchor='middle' fill='%23ffffff' font-family='sans-serif' font-weight='bold' font-size='30' letter-spacing='2'>LIVE CONCERT STAGE</text><text x='50%25' y='58%25' dominant-baseline='middle' text-anchor='middle' fill='%23f472b6' font-family='sans-serif' font-size='15'>✨ 專屬演唱會舞台 · 期待開唱 ✨</text></svg>";

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
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingConcert, setEditingConcert] = useState<ConcertGoal | null>(null);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [fundActionType, setFundActionType] = useState<'allocate' | 'withdraw'>('allocate');
  const [fundAmountStr, setFundAmountStr] = useState<string>('');
  const [fundNote, setFundNote] = useState<string>('');
  const [fundErrorMsg, setFundErrorMsg] = useState<string>('');

  // Goal Form state (Add / Edit)
  const [formTitle, setFormTitle] = useState('');
  const [formArtist, setFormArtist] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formIsDateTBA, setFormIsDateTBA] = useState(false);
  const [formCountry, setFormCountry] = useState('台灣');
  const [formCity, setFormCity] = useState('台北');
  const [formVenue, setFormVenue] = useState('台北小巨蛋');
  const [formTicketPrice, setFormTicketPrice] = useState('6800');
  const [formTravelPrice, setFormTravelPrice] = useState('1500');
  const [formLodgingPrice, setFormLodgingPrice] = useState('3000');
  const [formMerchPrice, setFormMerchPrice] = useState('3500');
  const [formOtherPrice, setFormOtherPrice] = useState('1200');
  const [formCoverImage, setFormCoverImage] = useState(DEFAULT_CONCERT_COVER);
  const [formNotes, setFormNotes] = useState('');
  const [isProcessingCover, setIsProcessingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Open Create Goal Modal
  const openCreateGoalModal = () => {
    setEditingConcert(null);
    setFormTitle('');
    setFormArtist('');
    setFormDate('');
    setFormIsDateTBA(false);
    setFormCountry('台灣');
    setFormCity('台北');
    setFormVenue('台北小巨蛋');
    setFormTicketPrice('6800');
    setFormTravelPrice('1500');
    setFormLodgingPrice('3000');
    setFormMerchPrice('3500');
    setFormOtherPrice('1200');
    setFormCoverImage(DEFAULT_CONCERT_COVER);
    setFormNotes('');
    setCoverError(null);
    setIsGoalModalOpen(true);
  };

  // Open Edit Goal Modal
  const openEditGoalModal = (concert: ConcertGoal) => {
    setEditingConcert(concert);
    setFormTitle(concert.title);
    setFormArtist(concert.artist);
    setFormDate(concert.date || '');
    setFormIsDateTBA(!!concert.isDateTBA);
    setFormCountry(concert.country);
    setFormCity(concert.city);
    setFormVenue(concert.venue);
    setFormTicketPrice(String(concert.budgetPlan.ticket));
    setFormTravelPrice(String(concert.budgetPlan.travel));
    setFormLodgingPrice(String(concert.budgetPlan.lodging));
    setFormMerchPrice(String(concert.budgetPlan.merchandise));
    setFormOtherPrice(String(concert.budgetPlan.other));
    setFormCoverImage(concert.coverImage || DEFAULT_CONCERT_COVER);
    setFormNotes(concert.notes);
    setCoverError(null);
    setIsGoalModalOpen(true);
  };

  // Handle Cover Photo Upload
  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverError(null);
    setIsProcessingCover(true);

    try {
      const processed = await processGeneralImage(file, 800, 450, 0.82);
      setFormCoverImage(processed.dataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '上傳封面失敗，請重試';
      setCoverError(msg);
    } finally {
      setIsProcessingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
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

  // Handle Goal Form Submit (Add or Update)
  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formArtist.trim()) {
      alert('請填寫演唱會名稱與藝人/團體名稱');
      return;
    }

    const ticket = parseInt(formTicketPrice, 10) || 0;
    const travel = parseInt(formTravelPrice, 10) || 0;
    const lodging = parseInt(formLodgingPrice, 10) || 0;
    const merchandise = parseInt(formMerchPrice, 10) || 0;
    const other = parseInt(formOtherPrice, 10) || 0;
    const total = ticket + travel + lodging + merchandise + other;

    const payload = {
      title: formTitle.trim(),
      artist: formArtist.trim(),
      date: formIsDateTBA ? undefined : (formDate.trim() || undefined),
      isDateTBA: formIsDateTBA,
      country: formCountry.trim(),
      city: formCity.trim(),
      venue: formVenue.trim(),
      budgetPlan: {
        ticket,
        travel,
        lodging,
        merchandise,
        other,
        total
      },
      coverImage: formCoverImage,
      notes: formNotes.trim()
    };

    if (editingConcert) {
      updateConcertGoal(editingConcert.id, payload);
    } else {
      addConcertGoal(payload);
    }

    setIsGoalModalOpen(false);
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
            設定多場演唱會目標（支援各類型音樂、日韓華語歐美獨立樂團），透過專款儲蓄推動娃娃前進！
          </p>
        </div>

        <button
          onClick={openCreateGoalModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>建立新演唱會目標</span>
        </button>
      </div>

      {/* Goal Switcher Tabs if concerts exist */}
      {concerts.length > 0 && (
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
                  {c.isDateTBA ? (
                    <span className="text-pink-500 font-medium">日期待定</span>
                  ) : c.date ? (
                    <span>{c.date.substring(5)}</span>
                  ) : null}
                  <span>·</span>
                  <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                    {prog.toFixed(1)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* When no concerts exist: Beautiful Empty State */}
      {concerts.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-pink-200 dark:border-pink-900/40 p-10 md:p-14 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
            🎫
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              還沒有建立演唱會旅程，新增你的第一場演唱會吧！
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              不限音樂類型！自由建立華語歌手、日韓藝人、西洋偶像、獨立樂團或音樂祭。可自訂上傳封面照片，日期未定也能標記「日期待公布」，一步步啟動專屬存錢地圖！
            </p>
          </div>
          <button
            onClick={openCreateGoalModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>＋ 建立第一場演唱會</span>
          </button>
        </div>
      ) : activeConcert ? (
        <>
          {/* Main Stage & Doll Continuous Forward Progress Map */}
          <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            {/* Cover Banner & Info Row */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pb-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                {/* Concert Cover Image Preview */}
                <div className="w-full sm:w-36 h-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-950 relative group shadow-sm">
                  <img
                    src={activeConcert.coverImage || DEFAULT_CONCERT_COVER}
                    alt={activeConcert.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                      {activeConcert.artist}
                    </span>
                    <span className="text-xs text-slate-400">
                      📍 {activeConcert.country} · {activeConcert.city} · {activeConcert.venue}
                    </span>
                    {activeConcert.isDateTBA ? (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-300 font-semibold">
                        📅 日期待公布
                      </span>
                    ) : activeConcert.date ? (
                      <span className="text-xs text-slate-400">
                        📅 {activeConcert.date}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">
                        📅 日期待公布
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {activeConcert.title}
                  </h3>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditGoalModal(activeConcert)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-pink-500" />
                  <span>編輯資訊/更換封面</span>
                </button>

                {!activeConcert.isPrimary && (
                  <button
                    onClick={() => setPrimaryConcert(activeConcert.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
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
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl border-2 border-pink-500 bg-white dark:bg-slate-900 shadow-xl overflow-hidden p-0.5 animate-bounce">
                      <img
                        src={characterProfile.avatarUrl}
                        alt="Idol Doll"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    {/* Tooltip bubble showing progress */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
                      {progressPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* 5 Physical Milestone Stations */}
                {[
                  { pos: 0, label: '🏠 出發起點', desc: '0% 蓄力準備' },
                  { pos: 25, label: '🎟️ 搶票成功', desc: '25% 門票基金' },
                  { pos: 50, label: '🚆 交通訂房', desc: '50% 移動住宿' },
                  { pos: 75, label: '🍭 應援周邊', desc: '75% 手燈手幅' },
                  { pos: 100, label: '🏟️ 巨蛋登頂', desc: '100% 盛大開唱' }
                ].map((station, idx) => (
                  <div
                    key={idx}
                    className="absolute -top-3 transform -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${station.pos}%` }}
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        progressPercent >= station.pos
                          ? 'border-pink-500 bg-pink-500 text-white scale-110'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400'
                      }`}
                    >
                      {station.pos}%
                    </div>
                    <div className="mt-2 text-center whitespace-nowrap">
                      <div
                        className={`text-xs font-bold ${
                          progressPercent >= station.pos
                            ? 'text-pink-600 dark:text-pink-400'
                            : 'text-slate-500'
                        }`}
                      >
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

              {/* Add New Task Form */}
              <form onSubmit={handleAddTaskSubmit} className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="新增準備任務（例：預約應援餐廳、準備行動電源）..."
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl"
                >
                  新增
                </button>
              </form>

              {/* Task Items List */}
              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeTasks.length > 0 ? (
                  activeTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleConcertTask(task.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                            task.isCompleted
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-300 dark:border-slate-600 hover:border-pink-500'
                          }`}
                        >
                          {task.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <span
                          className={`text-xs ${
                            task.isCompleted
                              ? 'line-through text-slate-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                          +{task.xpReward} XP
                        </span>
                        <button
                          onClick={() => deleteConcertTask(task.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    尚無準備任務，輸入上方欄位建立專屬清單！
                  </p>
                )}
              </div>
            </div>

            {/* Fund Allocation History */}
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-500" />
                    <span>專款基金存提明細紀錄</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    資金分配與日常生活帳務清晰隔離，確保搶票與出發無虞
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeFundHistory.length > 0 ? (
                  activeFundHistory.map(record => (
                    <div
                      key={record.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              record.type === 'allocate'
                                ? 'bg-pink-100 dark:bg-pink-950/80 text-pink-700 dark:text-pink-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {record.type === 'allocate' ? '分配專款' : '基金退回'}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {record.note}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {record.date}
                        </div>
                      </div>

                      <div
                        className={`font-mono font-bold text-sm tabular-nums ${
                          record.type === 'allocate' ? 'text-pink-600' : 'text-slate-600'
                        }`}
                      >
                        {record.type === 'allocate' ? '+' : '-'} NT$ {record.amount.toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    此目標尚未進行專款分配，點擊上方「分配基金」開始存錢吧！
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Fund Action Modal (Allocate / Withdraw) */}
      {isFundModalOpen && activeConcert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-pink-500" />
              <span>
                {fundActionType === 'allocate' ? '分配演唱會專款' : '提領基金至未分配池'}
              </span>
            </h3>

            <p className="text-xs text-slate-500">
              目標：{activeConcert.title}
              <br />
              當前已分配：NT$ {activeConcert.allocatedFund.toLocaleString()}
              {fundActionType === 'allocate' && (
                <span className="block mt-1 text-emerald-600 dark:text-emerald-400">
                  目前帳戶未分配餘額：NT$ {availableUnallocatedFunds.toLocaleString()}
                </span>
              )}
            </p>

            {fundErrorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-600 text-xs">
                {fundErrorMsg}
              </div>
            )}

            <form onSubmit={handleFundSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  金額 (NT$) *
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="例如：3000"
                  value={fundAmountStr}
                  onChange={e => setFundAmountStr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-base font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  備註說明
                </label>
                <input
                  type="text"
                  placeholder="例如：本月發薪存入門票預備款"
                  value={fundNote}
                  onChange={e => setFundNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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

      {/* Add / Edit Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-pink-500" />
                <span>{editingConcert ? '✏️ 編輯演唱會目標' : '✨ 建立新演唱會目標'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsGoalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4 text-xs">
              {/* Cover Photo Upload & Preview Section */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <label className="block text-slate-800 dark:text-slate-200 font-bold">
                  📸 演唱會封面照片（支援 JPG, PNG, WebP）
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-full sm:w-44 h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 shrink-0 relative shadow-xs">
                    <img
                      src={formCoverImage || DEFAULT_CONCERT_COVER}
                      alt="Cover Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverFileUpload}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isProcessingCover}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 text-white font-bold hover:bg-pink-600 transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isProcessingCover ? '處理壓縮中...' : '上傳專屬封面'}</span>
                      </button>

                      {formCoverImage !== DEFAULT_CONCERT_COVER && (
                        <button
                          type="button"
                          onClick={() => setFormCoverImage(DEFAULT_CONCERT_COVER)}
                          className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          使用預設舞台
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      前端會自動裁切並極致壓縮至 40KB 內儲存，無需額外 Storage 空間。未上傳時將使用專屬星光舞台預設封面。
                    </p>
                    {coverError && (
                      <p className="text-[11px] text-rose-500 font-medium">{coverError}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                  演唱會名稱 *
                </label>
                <input
                  type="text"
                  placeholder="例如：回到那一天 25週年巡迴、The Eras Tour、電光石火..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    藝人 / 團體名稱 *
                  </label>
                  <input
                    type="text"
                    placeholder="例如：五月天、Taylor Swift、YOASOBI、周杰倫、TWICE、告五人"
                    value={formArtist}
                    onChange={e => setFormArtist(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 dark:text-slate-300 font-medium">
                      演唱會日期
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer text-[11px] text-pink-600 dark:text-pink-400 font-semibold">
                      <input
                        type="checkbox"
                        checked={formIsDateTBA}
                        onChange={e => setFormIsDateTBA(e.target.checked)}
                        className="rounded text-pink-500 focus:ring-pink-500"
                      />
                      <span>日期待公布</span>
                    </label>
                  </div>
                  <input
                    type="date"
                    disabled={formIsDateTBA}
                    value={formIsDateTBA ? '' : formDate}
                    onChange={e => setFormDate(e.target.value)}
                    placeholder={formIsDateTBA ? '日期待公布' : ''}
                    className={`w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 ${
                      formIsDateTBA ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">國家</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={e => setFormCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">城市</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={e => setFormCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">場館</label>
                  <input
                    type="text"
                    value={formVenue}
                    onChange={e => setFormVenue(e.target.value)}
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
                      min="0"
                      value={formTicketPrice}
                      onChange={e => setFormTicketPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">預計交通</label>
                    <input
                      type="number"
                      min="0"
                      value={formTravelPrice}
                      onChange={e => setFormTravelPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">預計住宿</label>
                    <input
                      type="number"
                      min="0"
                      value={formLodgingPrice}
                      onChange={e => setFormLodgingPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">應援周邊</label>
                    <input
                      type="number"
                      min="0"
                      value={formMerchPrice}
                      onChange={e => setFormMerchPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">其他預備金</label>
                    <input
                      type="number"
                      min="0"
                      value={formOtherPrice}
                      onChange={e => setFormOtherPrice(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                    />
                  </div>
                  <div className="flex flex-col justify-end">
                    <span className="text-[11px] text-slate-500">預算總計：</span>
                    <span className="font-mono font-bold text-sm text-pink-600">
                      NT${' '}
                      {(
                        (parseInt(formTicketPrice, 10) || 0) +
                        (parseInt(formTravelPrice, 10) || 0) +
                        (parseInt(formLodgingPrice, 10) || 0) +
                        (parseInt(formMerchPrice, 10) || 0) +
                        (parseInt(formOtherPrice, 10) || 0)
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
                  placeholder="例如：準備好搶票實名制驗證，預計提前一天抵達場館排隊..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-16"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl"
                >
                  {editingConcert ? '儲存修改' : '確認建立演唱會目標'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
