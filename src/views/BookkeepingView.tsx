import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Trash2,
  Calendar as CalendarIcon,
  ListFilter
} from 'lucide-react';
import { Transaction } from '../types';
import { HandDrawnSticker } from '../components/HandDrawnSticker';

interface BookkeepingViewProps {
  onOpenQuickTxWithDate: (date: string) => void;
}

export const BookkeepingView: React.FC<BookkeepingViewProps> = ({ onOpenQuickTxWithDate }) => {
  const {
    transactions,
    accounts,
    deleteTransaction,
    selectedDate,
    setSelectedDate,
    currentYearMonth,
    setCurrentYearMonth
  } = useApp();

  // Month navigation
  const [year, month] = useMemo(() => {
    const parts = currentYearMonth.split('-');
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  }, [currentYearMonth]);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'daily' | 'idol' | 'income'>('all');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const ym = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    const ym = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setCurrentYearMonth(ym);
  };

  const handleGoToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setCurrentYearMonth(today.substring(0, 7));
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const startOffset = (firstDayIndex + 6) % 7; // Monday-first

    const daysInMonth = new Date(year, month, 0).getDate();
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = month - 1 < 1 ? 12 : month - 1;
      const prevY = month - 1 < 1 ? year - 1 : year;
      days.push({
        dateStr: `${prevY}-${String(prevM).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: true
      });
    }

    // Next month padding to fill grid
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextM = month + 1 > 12 ? 1 : month + 1;
      const nextY = month + 1 > 12 ? year + 1 : year;
      days.push({
        dateStr: `${nextY}-${String(nextM).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayNum: d,
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  // Map of date -> transactions
  const dailySummaryMap = useMemo(() => {
    const map = new Map<string, { txs: Transaction[]; totalExpense: number; totalIncome: number; hasIdol: boolean }>();
    transactions.forEach(tx => {
      const existing = map.get(tx.date) || { txs: [], totalExpense: 0, totalIncome: 0, hasIdol: false };
      existing.txs.push(tx);
      if (tx.type === 'expense') {
        existing.totalExpense += tx.amount;
        if (tx.categoryGroup === 'idol') existing.hasIdol = true;
      } else {
        existing.totalIncome += tx.amount;
      }
      map.set(tx.date, existing);
    });
    return map;
  }, [transactions]);

  // Selected date info
  const selectedDayInfo = dailySummaryMap.get(selectedDate) || {
    txs: [],
    totalExpense: 0,
    totalIncome: 0,
    hasIdol: false
  };

  // Filtered transactions for list mode
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const isMonth = tx.date.startsWith(currentYearMonth);
      if (!isMonth) return false;

      if (filterType === 'daily' && (tx.type !== 'expense' || tx.categoryGroup !== 'daily')) return false;
      if (filterType === 'idol' && (tx.type !== 'expense' || tx.categoryGroup !== 'idol')) return false;
      if (filterType === 'income' && tx.type !== 'income') return false;

      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchNote = tx.note.toLowerCase().includes(kw);
        const matchCat = tx.category.toLowerCase().includes(kw);
        const matchItem = tx.detailedItem?.itemName.toLowerCase().includes(kw);
        const matchArtist = tx.detailedItem?.artistName.toLowerCase().includes(kw);
        return matchNote || matchCat || matchItem || matchArtist;
      }

      return true;
    });
  }, [transactions, currentYearMonth, filterType, searchKeyword]);

  return (
    <div className="space-y-5 pb-20">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#4A3728] flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#FFE3EC] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728] text-lg">
              📅
            </span>
            <span>公司帳本｜經紀日誌</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-[#8C7365] mt-1">
            完整手繪風月曆、點擊查看每日明細與發票小票
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="inline-flex p-1 rounded-full bg-[#F5EBE1] border-2 border-[#4A3728] shadow-[2px_2px_0px_#4A3728]">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#FF3B75] border border-[#4A3728] shadow-xs'
                  : 'text-[#6E5646]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>月曆模式</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-[#FF3B75] border border-[#4A3728] shadow-xs'
                  : 'text-[#6E5646]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>清單模式</span>
            </button>
          </div>

          <button
            onClick={() => onOpenQuickTxWithDate(selectedDate)}
            className="sticker-btn px-5 py-2.5 rounded-full bg-[#FF2E7E] text-white text-xs sm:text-sm font-black flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>記一筆</span>
          </button>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="sketch-card bg-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="sticker-btn-soft w-9 h-9 rounded-xl bg-[#FFF8EB] flex items-center justify-center text-[#4A3728]"
            title="上個月"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="font-mono-num text-lg sm:text-xl font-black text-[#4A3728] px-2">
            {year} 年 {month} 月
          </div>
          <button
            onClick={handleNextMonth}
            className="sticker-btn-soft w-9 h-9 rounded-xl bg-[#FFF8EB] flex items-center justify-center text-[#4A3728]"
            title="下個月"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleGoToday}
          className="sticker-btn-soft px-3.5 py-1.5 rounded-xl bg-white text-xs font-black text-[#4A3728]"
        >
          回到今天
        </button>
      </div>

      {viewMode === 'calendar' ? (
        /* SPLIT VIEW: SPIRAL CALENDAR (8/12) + RECEIPT PAD (4/12) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 8/12: SPIRAL-BOUND MONTHLY CALENDAR */}
          <div className="lg:col-span-8 sketch-card bg-white p-4 sm:p-6 relative pt-8">
            {/* Spiral Rings Along Top Edge */}
            <div className="absolute -top-3 inset-x-8 flex justify-around pointer-events-none">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3.5 h-6 rounded-full bg-[#FFF8EB] border-2 border-[#4A3728] shadow-[1px_1px_0px_#4A3728]"
                />
              ))}
            </div>

            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 gap-2 mb-3 text-center">
              {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map((dayName, idx) => (
                <div
                  key={dayName}
                  className={`py-1.5 text-xs sm:text-sm font-black rounded-xl ${
                    idx >= 5
                      ? 'text-[#FF2E7E] bg-[#FFF0F6]'
                      : 'text-[#6E5646] bg-[#FFF9F0]'
                  }`}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
              {calendarDays.map((cell, idx) => {
                const isSelected = cell.dateStr === selectedDate;
                const dayTxs = dailySummaryMap.get(cell.dateStr)?.txs || [];
                const dayExp = dailySummaryMap.get(cell.dateStr)?.totalExpense || 0;
                const dayInc = dailySummaryMap.get(cell.dateStr)?.totalIncome || 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(cell.dateStr)}
                    className={`min-h-[82px] sm:min-h-[98px] p-2 rounded-2xl text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                      !cell.isCurrentMonth
                        ? 'bg-[#FAF6F0]/60 border border-dashed border-[#E5D5C5] text-[#C2B2A3]'
                        : isSelected
                        ? 'bg-[#FFE3EE] border-[2.5px] border-[#FF2E7E] shadow-[3px_3px_0px_#FF2E7E] -translate-y-0.5'
                        : 'bg-[#FFFDF9] border-2 border-[#E6D7C3] hover:border-[#4A3728] hover:bg-[#FFF9F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`font-mono-num text-xs sm:text-sm font-black ${
                          isSelected
                            ? 'text-[#FF2E7E]'
                            : !cell.isCurrentMonth
                            ? 'text-[#C2B2A3]'
                            : 'text-[#4A3728]'
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] leading-none">📌</span>
                      )}
                    </div>

                    {/* Hand-Drawn Stamps in Calendar Cell */}
                    {dayTxs.length > 0 && (
                      <div className="my-1 flex flex-wrap gap-1">
                        {dayTxs.slice(0, 3).map(t => (
                          <HandDrawnSticker
                            key={t.id}
                            sticker={t.detailedItem ? 'photocard' : 'sparkles'}
                            size={20}
                          />
                        ))}
                      </div>
                    )}

                    {/* Compact Daily Net Pill */}
                    <div className="w-full space-y-0.5">
                      {dayExp > 0 && (
                        <div className="font-mono-num text-[10px] font-black text-[#FF2E7E] bg-white/90 px-1 py-0.5 rounded-md border border-[#FF94B8] truncate">
                          -${dayExp.toLocaleString()}
                        </div>
                      )}
                      {hasIncome(dayInc) && (
                        <div className="font-mono-num text-[10px] font-black text-[#1E9E73] bg-[#E8FBF4] px-1 py-0.5 rounded-md border border-[#8CE0C2] truncate">
                          +${dayInc.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT 4/12: TEAR-OFF DAILY RECEIPT PAD */}
          <div className="lg:col-span-4 sketch-card bg-[#FFFDF9] p-5 sm:p-6 relative flex flex-col justify-between min-h-[480px]">
            <div
              className="washi-tape-pink absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-5 rounded-sm"
              style={{ transform: 'translateX(-50%) rotate(2deg)' }}
            />

            <div>
              {/* Receipt Header */}
              <div className="flex items-start justify-between gap-2 pb-4 border-b-2 border-dashed border-[#E6D7C3]">
                <div>
                  <div className="text-xs font-bold text-[#8C7365] mb-1">
                    🧾 當日發票小票紀錄
                  </div>
                  <div className="font-mono-num text-xl font-black text-[#4A3728]">
                    {selectedDate}
                  </div>
                </div>
                <button
                  onClick={() => onOpenQuickTxWithDate(selectedDate)}
                  className="sticker-btn-soft px-3.5 py-1.5 rounded-full bg-[#FFE3EC] text-[#FF2E7E] text-xs font-black"
                >
                  + 新增
                </button>
              </div>

              {/* Day Totals */}
              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="p-3.5 rounded-2xl bg-[#FFF5F8] border-2 border-[#4A3728] shadow-[2px_2px_0px_#F5CEDC]">
                  <div className="text-xs font-bold text-[#8C7365] mb-1">
                    今日支出總計
                  </div>
                  <div className="font-mono-num text-lg font-black text-[#FF2E7E]">
                    NT$ {selectedDayInfo.totalExpense.toLocaleString()}
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F2FBF7] border-2 border-[#4A3728] shadow-[2px_2px_0px_#C6EEDF]">
                  <div className="text-xs font-bold text-[#8C7365] mb-1">
                    今日收入總計
                  </div>
                  <div className="font-mono-num text-lg font-black text-[#1E9E73]">
                    NT$ {selectedDayInfo.totalIncome.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              {selectedDayInfo.txs.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3 my-2 rounded-2xl border-2 border-dashed border-[#E6D7C3] bg-white/70">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[#FFF5D6] border-2 border-[#4A3728] flex items-center justify-center text-xl shadow-[2px_2px_0px_#4A3728]">
                    🌟
                  </div>
                  <div className="text-xs font-bold text-[#8C7365]">
                    本日尚無收支明細
                  </div>
                  <button
                    onClick={() => onOpenQuickTxWithDate(selectedDate)}
                    className="text-xs font-black text-[#FF2E7E] hover:underline cursor-pointer inline-block"
                  >
                    點此記錄第一筆
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mt-2 max-h-[380px] overflow-y-auto pr-1">
                  {selectedDayInfo.txs.map(tx => {
                    const acc = accounts.find(a => a.id === tx.accountId);
                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-white border-2 border-[#4A3728] shadow-[2.5px_2.5px_0px_#E6D7C3] flex items-start justify-between gap-2.5 group"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <HandDrawnSticker
                            sticker={tx.detailedItem ? 'photocard' : 'sparkles'}
                            size={36}
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#4A3728] ${
                                  tx.categoryGroup === 'idol'
                                    ? 'bg-[#FFE3EC] text-[#FF2E7E]'
                                    : tx.type === 'income'
                                    ? 'bg-[#E4FBF0] text-[#1E9E73]'
                                    : 'bg-[#FFF3C4] text-[#4A3728]'
                                }`}
                              >
                                {tx.category}
                              </span>
                              <span className="text-[10px] font-bold text-[#8C7365]">
                                {acc?.name || '帳戶'}
                              </span>
                            </div>
                            <div className="text-xs font-black text-[#4A3728] mt-1 break-words">
                              {tx.note || tx.category}
                            </div>
                            {tx.originalCurrency && tx.originalCurrency !== 'TWD' && tx.originalAmount && (
                              <div className="mt-1 text-[10px] font-mono-num font-bold text-[#8A5CF5] bg-[#EFE6FF] px-2 py-0.5 rounded-md border border-[#4A3728] inline-block">
                                🌐 {tx.originalCurrency} {tx.originalAmount.toLocaleString()} (匯率: {tx.exchangeRate?.toFixed(4)})
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span
                            className={`font-mono-num text-xs font-black ${
                              tx.type === 'income' ? 'text-[#1E9E73]' : 'text-[#FF2E7E]'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}NT${' '}
                            {tx.amount.toLocaleString()}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm('確定要刪除這筆收支紀錄嗎？')) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="text-[#C2B2A3] hover:text-rose-500 p-1 cursor-pointer"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t-2 border-dashed border-[#E6D7C3] pt-3 mt-4 flex items-center justify-between text-[11px] font-bold text-[#8C7365]">
              <span>STAR WALK 經紀日記小票</span>
              <span className="font-mono-num">
                共 {selectedDayInfo.txs.length} 筆
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="sketch-card bg-white p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b-2 border-dashed border-[#E6D7C3] pb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C7365]" />
              <input
                type="text"
                placeholder="搜尋備註、分類、商品或藝人..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold rounded-xl border-2 border-[#4A3728] bg-[#FFFDF7]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {(
                [
                  { id: 'all', label: '全部' },
                  { id: 'daily', label: '🍱 日常消費' },
                  { id: 'idol', label: '🎤 追星消費' },
                  { id: 'income', label: '💰 收入' }
                ] as const
              ).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  className={`sticker-btn-soft px-3 py-1.5 rounded-full text-xs font-black whitespace-nowrap ${
                    filterType === f.id
                      ? 'bg-[#4A3728] text-white'
                      : 'bg-white text-[#4A3728]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => {
                const acc = accounts.find(a => a.id === tx.accountId);
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl border-2 border-[#4A3728] bg-[#FFFDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <HandDrawnSticker
                        sticker={tx.detailedItem ? 'photocard' : 'sparkles'}
                        size={38}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num text-xs font-bold text-[#8C7365]">
                            {tx.date}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#4A3728] ${
                              tx.type === 'income'
                                ? 'bg-[#E4FBF0] text-[#1E9E73]'
                                : tx.categoryGroup === 'idol'
                                ? 'bg-[#FFE3EC] text-[#FF2E7E]'
                                : 'bg-[#FFF3C4] text-[#4A3728]'
                            }`}
                          >
                            {tx.category}
                          </span>
                        </div>
                        <div className="text-xs font-black text-[#4A3728] mt-0.5">
                          {tx.note || tx.category}
                        </div>
                        <div className="text-[11px] font-bold text-[#8C7365]">
                          {acc?.name}
                          {tx.originalCurrency && tx.originalCurrency !== 'TWD' && tx.originalAmount && (
                            <span className="ml-2 text-[#8A5CF5] font-mono-num font-bold">
                              (🌐 {tx.originalCurrency} {tx.originalAmount.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-[#E5D5C5]">
                      <span
                        className={`font-mono-num text-sm font-black ${
                          tx.type === 'income' ? 'text-[#1E9E73]' : 'text-[#FF3B75]'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'} NT$ {tx.amount.toLocaleString()}
                      </span>

                      <button
                        onClick={() => {
                          if (window.confirm('確定要刪除這筆收支紀錄嗎？')) {
                            deleteTransaction(tx.id);
                          }
                        }}
                        className="text-[#8C7365] hover:text-rose-500 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs font-bold text-[#8C7365] py-8 text-center">
                沒有符合條件的收支明細 🌟
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function hasIncome(val: number) {
  return val > 0;
}
