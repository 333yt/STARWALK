import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar as CalendarIcon,
  ShoppingBag,
  Heart,
  TrendingDown,
  TrendingUp,
  X
} from 'lucide-react';
import { Transaction } from '../types';

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

  // Month helpers
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

  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 is Sun, 1 is Mon...
    // We want Monday as first day (0: Mon ... 6: Sun)
    const startOffset = (firstDayIndex + 6) % 7;

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

    // Next month padding to fill complete grid of 35 or 42
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

  // Map of date -> transactions & total daily expense
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

  // Selected date's transactions
  const selectedDayInfo = dailySummaryMap.get(selectedDate) || {
    txs: [],
    totalExpense: 0,
    totalIncome: 0,
    hasIdol: false
  };

  // Month-filtered transactions for list mode / search
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Month match
      const isMonth = tx.date.startsWith(currentYearMonth);
      if (!isMonth) return false;

      // Filter type
      if (filterType === 'daily' && (tx.type !== 'expense' || tx.categoryGroup !== 'daily')) return false;
      if (filterType === 'idol' && (tx.type !== 'expense' || tx.categoryGroup !== 'idol')) return false;
      if (filterType === 'income' && tx.type !== 'income') return false;

      // Search
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
    <div className="space-y-6 pb-20">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-pink-500" />
            <span>📅 經紀日誌｜月曆記帳</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            完整互動月曆、點擊查看每日明細、即時新增收支紀錄
          </p>
        </div>

        {/* View mode toggle and Add button */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📅 月曆檢視
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📋 清單檢視
            </button>
          </div>

          <button
            onClick={() => onOpenQuickTxWithDate(selectedDate)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>記一筆</span>
          </button>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-black text-slate-900 dark:text-white font-mono">
            {year} 年 {month} 月
          </span>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleGoToday}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
        >
          回到今天
        </button>
      </div>

      {viewMode === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid (2 cols) */}
          <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            {/* Weekday headers: Mon - Sun */}
            <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-slate-400">
              <span>週一</span>
              <span>週二</span>
              <span>週三</span>
              <span>週四</span>
              <span>週五</span>
              <span className="text-pink-500">週六</span>
              <span className="text-pink-500">週日</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {calendarDays.map((item, idx) => {
                const isSelected = item.dateStr === selectedDate;
                const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                const daySummary = dailySummaryMap.get(item.dateStr);
                const hasExpense = daySummary && daySummary.totalExpense > 0;
                const hasIncome = daySummary && daySummary.totalIncome > 0;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`relative min-h-[68px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all group ${
                      isSelected
                        ? 'border-pink-500 bg-pink-500/10 dark:bg-pink-950/40 shadow-sm ring-2 ring-pink-500/30'
                        : isToday
                        ? 'border-purple-300 dark:border-purple-700 bg-purple-50/40 dark:bg-slate-800/80'
                        : item.isCurrentMonth
                        ? 'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                        : 'border-transparent opacity-40 bg-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold font-mono ${
                          isSelected
                            ? 'text-pink-600 dark:text-pink-400'
                            : isToday
                            ? 'text-purple-600 font-black'
                            : item.isCurrentMonth
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {item.dayNum}
                      </span>

                      {/* Small badge if idol spending occurred */}
                      {daySummary?.hasIdol && (
                        <span className="text-[10px]" title="包含追星應援消費">
                          💖
                        </span>
                      )}
                    </div>

                    {/* Expense summary indicator */}
                    <div className="space-y-0.5 mt-1">
                      {hasExpense && (
                        <div className="text-[10px] font-mono font-bold text-rose-500 truncate">
                          -NT${daySummary.totalExpense.toLocaleString()}
                        </div>
                      )}
                      {hasIncome && (
                        <div className="text-[10px] font-mono font-bold text-emerald-500 truncate">
                          +NT${daySummary.totalIncome.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Transaction Detail Panel (1 col) */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-400">
                    🗂️ 當日收支紀錄
                  </span>
                  <h4 className="text-base font-black text-slate-900 dark:text-white font-mono">
                    {selectedDate}
                  </h4>
                </div>

                <button
                  onClick={() => onOpenQuickTxWithDate(selectedDate)}
                  className="px-3 py-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 rounded-xl hover:bg-pink-100 transition-colors"
                >
                  + 新增本日帳目
                </button>
              </div>

              {/* Day stats */}
              <div className="grid grid-cols-2 gap-2 my-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-[11px] text-slate-400">今日支出總計</div>
                  <div className="font-mono font-black text-rose-500 mt-0.5 text-sm">
                    NT$ {selectedDayInfo.totalExpense.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                  <div className="text-[11px] text-slate-400">今日收入總計</div>
                  <div className="font-mono font-black text-emerald-500 mt-0.5 text-sm">
                    NT$ {selectedDayInfo.totalIncome.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
                {selectedDayInfo.txs.length > 0 ? (
                  selectedDayInfo.txs.map(tx => {
                    const acc = accounts.find(a => a.id === tx.accountId);
                    return (
                      <div
                        key={tx.id}
                        className="py-3 flex items-start justify-between gap-3 group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                tx.categoryGroup === 'idol'
                                  ? 'bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {tx.category}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {acc?.name || '帳戶'}
                            </span>
                          </div>

                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                            {tx.note || tx.category}
                          </p>

                          {tx.detailedItem && (
                            <div className="mt-1 text-[11px] text-pink-600 dark:text-pink-400 flex items-center gap-1">
                              <span>偶像商品：{tx.detailedItem.itemName}</span>
                              {tx.detailedItem.linkedCollectibleId && (
                                <span className="text-[9px] bg-pink-100 dark:bg-pink-950 px-1 rounded">已加入收藏</span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <div
                            className={`font-mono font-bold text-sm tabular-nums ${
                              tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'} NT${' '}
                            {tx.amount.toLocaleString()}
                          </div>

                          <button
                            onClick={() => {
                              if (window.confirm('確定要刪除這筆收支紀錄嗎？')) {
                                deleteTransaction(tx.id);
                              }
                            }}
                            className="text-slate-300 hover:text-rose-500 p-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <p>本日尚無收支明細 🌟</p>
                    <button
                      onClick={() => onOpenQuickTxWithDate(selectedDate)}
                      className="text-pink-500 font-semibold hover:underline"
                    >
                      點此為 {selectedDate} 記錄第一筆
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List & Search View Mode */
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="搜尋備註、分類、商品或藝人..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
                    filterType === f.id
                      ? 'bg-pink-500 text-white border-pink-500'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Table */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[600px] overflow-y-auto">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => {
                const acc = accounts.find(a => a.id === tx.accountId);
                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 w-24">
                        {tx.date}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-lg text-xs font-semibold ${
                          tx.type === 'income'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                            : tx.categoryGroup === 'idol'
                            ? 'bg-pink-50 dark:bg-pink-950/60 text-pink-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {tx.category}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {tx.note || tx.category}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {acc?.name}
                          {tx.detailedItem && ` · ${tx.detailedItem.groupName} ${tx.detailedItem.itemName}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
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
                        className="text-slate-300 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-8 text-center">
                沒有符合條件的收支明細 🌟
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
