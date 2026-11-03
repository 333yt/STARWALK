import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Theme,
  Account,
  Transaction,
  MonthlyBudget,
  ConcertGoal,
  ConcertTask,
  FundAllocationRecord,
  Collectible,
  DailyMission,
  Achievement,
  CharacterProfile,
  TicketStub
} from '../types';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CONCERTS,
  INITIAL_CONCERT_TASKS,
  INITIAL_FUND_ALLOCATIONS,
  INITIAL_TRANSACTIONS,
  INITIAL_COLLECTIBLES,
  INITIAL_MONTHLY_BUDGET,
  INITIAL_DAILY_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_CHARACTER_PROFILE
} from '../data/initialData';
import { sound } from '../utils/sound';

interface AppContextType {
  // Theme & Mode
  theme: Theme;
  setTheme: (t: Theme) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  isFirebaseModalOpen: boolean;
  setIsFirebaseModalOpen: (open: boolean) => void;

  // Selected date & month
  selectedDate: string; // YYYY-MM-DD
  setSelectedDate: (d: string) => void;
  currentYearMonth: string; // YYYY-MM
  setCurrentYearMonth: (ym: string) => void;

  // State
  accounts: Account[];
  transactions: Transaction[];
  monthlyBudgets: Record<string, number>; // yearMonth -> limit
  concerts: ConcertGoal[];
  concertTasks: ConcertTask[];
  fundAllocations: FundAllocationRecord[];
  collectibles: Collectible[];
  dailyMissions: DailyMission[];
  achievements: Achievement[];
  characterProfile: CharacterProfile;

  // Calculated Metrics
  monthTransactions: Transaction[];
  monthTotalIncome: number;
  monthTotalExpense: number;
  monthDailyExpense: number;
  monthIdolExpense: number;
  currentMonthBudgetLimit: number;
  monthBudgetRemaining: number;
  monthBudgetUsagePercent: number;
  totalLiquidAssets: number;
  totalAllocatedFunds: number;
  availableUnallocatedFunds: number;
  isTodayRecorded: boolean;

  // Actions - Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Actions - Budget
  setMonthlyBudgetLimit: (yearMonth: string, limit: number) => void;

  // Actions - Concerts & Goals
  primaryConcert: ConcertGoal | undefined;
  setPrimaryConcert: (id: string) => void;
  addConcertGoal: (goal: Omit<ConcertGoal, 'id' | 'allocatedFund' | 'status' | 'isPrimary'>) => void;
  updateConcertGoal: (id: string, updates: Partial<ConcertGoal>) => void;
  deleteConcertGoal: (id: string) => void;

  // Actions - Fund Allocation
  allocateConcertFund: (concertId: string, amount: number, note?: string) => { success: boolean; message: string };
  withdrawConcertFund: (concertId: string, amount: number, note?: string) => { success: boolean; message: string };

  // Actions - Concert Tasks
  toggleConcertTask: (taskId: string) => void;
  addConcertTask: (concertId: string, title: string, xpReward?: number) => void;
  deleteConcertTask: (taskId: string) => void;

  // Actions - Collectibles
  addCollectible: (item: Omit<Collectible, 'id'>) => void;
  updateCollectible: (id: string, updates: Partial<Collectible>) => void;
  deleteCollectible: (id: string) => void;

  // Actions - Missions & XP
  completeDailyMission: (missionId: string) => void;
  awardXP: (amount: number, reason: string) => void;
  updateCharacterProfile: (updates: Partial<CharacterProfile>) => void;
  advanceAgencyStage: () => void;

  // Actions - Ticket Stubs & Concert Completion
  completeConcertWithStub: (concertId: string, stub: Omit<TicketStub, 'id' | 'concertId' | 'createdAt'>) => void;

  // Reset demo data
  resetAllDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_PREFIX = 'STAR_WALK_V2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Storage load error for', key, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error for', key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => loadFromStorage<Theme>('THEME', 'starlight'));
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);

  // Today Date & Active Month
  const todayStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(todayStr.substring(0, 7));

  // Entities
  const [accounts, setAccounts] = useState<Account[]>(() => loadFromStorage('ACCOUNTS', INITIAL_ACCOUNTS));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadFromStorage('TRANSACTIONS', INITIAL_TRANSACTIONS));
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, number>>(() =>
    loadFromStorage('BUDGETS', { [INITIAL_MONTHLY_BUDGET.yearMonth]: INITIAL_MONTHLY_BUDGET.budgetLimit })
  );
  const [concerts, setConcerts] = useState<ConcertGoal[]>(() => loadFromStorage('CONCERTS', INITIAL_CONCERTS));
  const [concertTasks, setConcertTasks] = useState<ConcertTask[]>(() => loadFromStorage('CONCERT_TASKS', INITIAL_CONCERT_TASKS));
  const [fundAllocations, setFundAllocations] = useState<FundAllocationRecord[]>(() => loadFromStorage('FUND_ALLOCATIONS', INITIAL_FUND_ALLOCATIONS));
  const [collectibles, setCollectibles] = useState<Collectible[]>(() => loadFromStorage('COLLECTIBLES', INITIAL_COLLECTIBLES));
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => loadFromStorage('DAILY_MISSIONS', INITIAL_DAILY_MISSIONS));
  const [achievements, setAchievements] = useState<Achievement[]>(() => loadFromStorage('ACHIEVEMENTS', INITIAL_ACHIEVEMENTS));
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile>(() => loadFromStorage('CHARACTER', INITIAL_CHARACTER_PROFILE));

  // Persist to localStorage
  useEffect(() => { saveToStorage('THEME', theme); }, [theme]);
  useEffect(() => { saveToStorage('ACCOUNTS', accounts); }, [accounts]);
  useEffect(() => { saveToStorage('TRANSACTIONS', transactions); }, [transactions]);
  useEffect(() => { saveToStorage('BUDGETS', monthlyBudgets); }, [monthlyBudgets]);
  useEffect(() => { saveToStorage('CONCERTS', concerts); }, [concerts]);
  useEffect(() => { saveToStorage('CONCERT_TASKS', concertTasks); }, [concertTasks]);
  useEffect(() => { saveToStorage('FUND_ALLOCATIONS', fundAllocations); }, [fundAllocations]);
  useEffect(() => { saveToStorage('COLLECTIBLES', collectibles); }, [collectibles]);
  useEffect(() => { saveToStorage('DAILY_MISSIONS', dailyMissions); }, [dailyMissions]);
  useEffect(() => { saveToStorage('ACHIEVEMENTS', achievements); }, [achievements]);
  useEffect(() => { saveToStorage('CHARACTER', characterProfile); }, [characterProfile]);

  // Apply Theme class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-starlight', 'theme-pink', 'theme-midnight', 'dark');
    if (theme === 'midnight') {
      root.classList.add('dark', 'theme-midnight');
    } else if (theme === 'pink') {
      root.classList.add('theme-pink');
    } else {
      root.classList.add('theme-starlight');
    }
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    sound.playClick();
  };

  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setIsSoundEnabled(sound.enabled);
    if (sound.enabled) sound.playCoin();
  };

  // Sound toggle sync
  useEffect(() => {
    sound.enabled = isSoundEnabled;
  }, [isSoundEnabled]);

  // Primary Concert
  const primaryConcert = useMemo(() => {
    return concerts.find(c => c.isPrimary) || concerts[0];
  }, [concerts]);

  const setPrimaryConcert = (id: string) => {
    setConcerts(prev => prev.map(c => ({
      ...c,
      isPrimary: c.id === id
    })));
    sound.playSparkle();
  };

  // Month-filtered transactions
  const monthTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date.startsWith(currentYearMonth));
  }, [transactions, currentYearMonth]);

  const monthTotalIncome = useMemo(() => {
    return monthTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  const monthTotalExpense = useMemo(() => {
    return monthTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  const monthDailyExpense = useMemo(() => {
    return monthTransactions
      .filter(tx => tx.type === 'expense' && tx.categoryGroup === 'daily')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  const monthIdolExpense = useMemo(() => {
    return monthTransactions
      .filter(tx => tx.type === 'expense' && tx.categoryGroup === 'idol')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [monthTransactions]);

  const currentMonthBudgetLimit = useMemo(() => {
    return monthlyBudgets[currentYearMonth] ?? 22000;
  }, [monthlyBudgets, currentYearMonth]);

  const monthBudgetRemaining = useMemo(() => {
    return currentMonthBudgetLimit - monthTotalExpense;
  }, [currentMonthBudgetLimit, monthTotalExpense]);

  const monthBudgetUsagePercent = useMemo(() => {
    if (currentMonthBudgetLimit <= 0) return 0;
    return Math.min(100, Math.round((monthTotalExpense / currentMonthBudgetLimit) * 100));
  }, [monthTotalExpense, currentMonthBudgetLimit]);

  // Liquid assets & concert funds
  const totalLiquidAssets = useMemo(() => {
    // Sum cash + bank + linepay, minus unpaid credit card
    return accounts.reduce((acc, account) => {
      if (account.type === 'credit_card') {
        return acc - account.balance;
      }
      return acc + account.balance;
    }, 0);
  }, [accounts]);

  const totalAllocatedFunds = useMemo(() => {
    return concerts.reduce((sum, c) => sum + (c.allocatedFund || 0), 0);
  }, [concerts]);

  const availableUnallocatedFunds = useMemo(() => {
    return Math.max(0, totalLiquidAssets - totalAllocatedFunds);
  }, [totalLiquidAssets, totalAllocatedFunds]);

  const isTodayRecorded = useMemo(() => {
    return transactions.some(tx => tx.date === todayStr);
  }, [transactions, todayStr]);

  // XP & Level calculations
  const awardXP = (amount: number, reason: string) => {
    if (amount <= 0) return;
    sound.playSparkle();
    setCharacterProfile(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      const xpForNext = newLevel * 50;

      while (newXp >= xpForNext) {
        newXp -= xpForNext;
        newLevel += 1;
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel
      };
    });
  };

  // Add Transaction
  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newId = 'tx_' + Date.now();
    const newTx: Transaction = {
      ...txData,
      id: newId,
      createdAt: Date.now()
    };

    // Update account balances
    setAccounts(prevAccounts =>
      prevAccounts.map(acc => {
        if (acc.id === txData.accountId) {
          if (acc.type === 'credit_card') {
            // Credit card: expense increases unpaid balance; income (e.g. paying bill) decreases it
            return {
              ...acc,
              balance: txData.type === 'expense' ? acc.balance + txData.amount : Math.max(0, acc.balance - txData.amount)
            };
          } else {
            return {
              ...acc,
              balance: txData.type === 'income' ? acc.balance + txData.amount : acc.balance - txData.amount
            };
          }
        }
        return acc;
      })
    );

    // If detailed idol item and marked syncToCollection
    if (txData.detailedItem && txData.detailedItem.syncToCollection) {
      const colId = 'col_' + Date.now();
      newTx.detailedItem = {
        ...txData.detailedItem,
        linkedCollectibleId: colId
      };

      const newCollectible: Collectible = {
        id: colId,
        name: txData.detailedItem.itemName || txData.note || '追星周邊商品',
        photoUrl: txData.detailedItem.photoUrl || '/src/assets/images/idol_character_trainee_1793698980118.jpg',
        group: txData.detailedItem.groupName || '未指定團體',
        artist: txData.detailedItem.artistName || '未指定藝人',
        member: txData.detailedItem.memberName || '全體',
        category: txData.detailedItem.itemType || txData.category,
        quantity: txData.detailedItem.quantity || 1,
        price: txData.amount,
        purchaseDate: txData.date,
        channel: txData.detailedItem.platform || '實體/線上通路',
        status: txData.detailedItem.isArrived ? '已到貨' : '待到貨',
        note: txData.note,
        linkedTransactionId: newId
      };
      setCollectibles(prev => [newCollectible, ...prev]);
    }

    setTransactions(prev => [newTx, ...prev]);

    // Check if daily record mission can be triggered
    const dailyMission = dailyMissions.find(m => m.type === 'daily_record' && !m.isCompleted);
    if (dailyMission) {
      completeDailyMission(dailyMission.id);
    }

    sound.playCoin();
    return { success: true };
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.id === id) {
          return { ...tx, ...updates };
        }
        return tx;
      })
    );
    sound.playClick();
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    // Reverse account impact
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === target.accountId) {
          if (acc.type === 'credit_card') {
            return {
              ...acc,
              balance: target.type === 'expense' ? Math.max(0, acc.balance - target.amount) : acc.balance + target.amount
            };
          } else {
            return {
              ...acc,
              balance: target.type === 'income' ? acc.balance - target.amount : acc.balance + target.amount
            };
          }
        }
        return acc;
      })
    );

    // If linked collectible exists, remove linkage
    if (target.detailedItem?.linkedCollectibleId) {
      setCollectibles(prev => prev.filter(c => c.id !== target.detailedItem?.linkedCollectibleId));
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
    sound.playClick();
  };

  // Monthly Budget
  const setMonthlyBudgetLimit = (yearMonth: string, limit: number) => {
    setMonthlyBudgets(prev => ({
      ...prev,
      [yearMonth]: Math.max(0, limit)
    }));
    sound.playSuccess();
  };

  // Concert Goals
  const addConcertGoal = (goalData: Omit<ConcertGoal, 'id' | 'allocatedFund' | 'status' | 'isPrimary'>) => {
    const newId = 'cg_' + Date.now();
    const newGoal: ConcertGoal = {
      ...goalData,
      id: newId,
      allocatedFund: 0,
      status: 'saving',
      isPrimary: concerts.length === 0
    };
    setConcerts(prev => [...prev, newGoal]);

    // Default template tasks
    const defaultTasks: ConcertTask[] = [
      { id: 'ct_' + Date.now() + '_1', concertId: newId, title: '確認售票時間與實名制規則', isCompleted: false, xpReward: 15 },
      { id: 'ct_' + Date.now() + '_2', concertId: newId, title: '順利搶到演唱會指定票種', isCompleted: false, xpReward: 25 },
      { id: 'ct_' + Date.now() + '_3', concertId: newId, title: '規劃交通往返方式（高鐵/機票/客運）', isCompleted: false, xpReward: 15 },
      { id: 'ct_' + Date.now() + '_4', concertId: newId, title: '預訂場館鄰近住宿地點', isCompleted: false, xpReward: 15 },
      { id: 'ct_' + Date.now() + '_5', concertId: newId, title: '檢查官方應援棒與備用電池', isCompleted: false, xpReward: 10 }
    ];
    setConcertTasks(prev => [...prev, ...defaultTasks]);
    sound.playSparkle();
  };

  const updateConcertGoal = (id: string, updates: Partial<ConcertGoal>) => {
    setConcerts(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    sound.playClick();
  };

  const deleteConcertGoal = (id: string) => {
    const target = concerts.find(c => c.id === id);
    if (!target) return;
    setConcerts(prev => prev.filter(c => c.id !== id));
    setConcertTasks(prev => prev.filter(t => t.concertId !== id));
    setFundAllocations(prev => prev.filter(f => f.concertId !== id));
    sound.playClick();
  };

  // Fund allocation
  const allocateConcertFund = (concertId: string, amount: number, note: string = '分配演唱會專款') => {
    if (amount <= 0) {
      return { success: false, message: '分配金額必須大於 0 元' };
    }
    if (amount > availableUnallocatedFunds) {
      return {
        success: false,
        message: `資金不足！目前可用未分配流動資金為 NT$ ${availableUnallocatedFunds.toLocaleString()}，無法分配 NT$ ${amount.toLocaleString()}`
      };
    }

    setConcerts(prev =>
      prev.map(c => {
        if (c.id === concertId) {
          const newAllocated = c.allocatedFund + amount;
          const isTargetReached = newAllocated >= c.budgetPlan.total;
          return {
            ...c,
            allocatedFund: newAllocated,
            status: isTargetReached ? 'ready' : 'saving'
          };
        }
        return c;
      })
    );

    const record: FundAllocationRecord = {
      id: 'fa_' + Date.now(),
      concertId,
      type: 'allocate',
      amount,
      date: todayStr,
      note,
      createdAt: Date.now()
    };
    setFundAllocations(prev => [record, ...prev]);

    sound.playSuccess();
    return { success: true, message: `成功為目標分配 NT$ ${amount.toLocaleString()} 專款基金！` };
  };

  const withdrawConcertFund = (concertId: string, amount: number, note: string = '提領部分基金') => {
    const concert = concerts.find(c => c.id === concertId);
    if (!concert) return { success: false, message: '找不到該演唱會目標' };
    if (amount <= 0) return { success: false, message: '提領金額必須大於 0 元' };
    if (amount > concert.allocatedFund) {
      return {
        success: false,
        message: `超過可提領額度！此演唱會目前已分配基金僅 NT$ ${concert.allocatedFund.toLocaleString()}`
      };
    }

    setConcerts(prev =>
      prev.map(c => {
        if (c.id === concertId) {
          const newAllocated = Math.max(0, c.allocatedFund - amount);
          return {
            ...c,
            allocatedFund: newAllocated,
            status: newAllocated >= c.budgetPlan.total ? 'ready' : 'saving'
          };
        }
        return c;
      })
    );

    const record: FundAllocationRecord = {
      id: 'fa_' + Date.now(),
      concertId,
      type: 'withdraw',
      amount,
      date: todayStr,
      note,
      createdAt: Date.now()
    };
    setFundAllocations(prev => [record, ...prev]);

    sound.playCoin();
    return { success: true, message: `已成功由演唱會基金轉回 NT$ ${amount.toLocaleString()} 至未分配資金池` };
  };

  // Concert Tasks
  const toggleConcertTask = (taskId: string) => {
    setConcertTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextState = !t.isCompleted;
          if (nextState) {
            awardXP(t.xpReward, `完成演唱會準備任務: ${t.title}`);
          }
          return { ...t, isCompleted: nextState };
        }
        return t;
      })
    );
    sound.playClick();
  };

  const addConcertTask = (concertId: string, title: string, xpReward: number = 15) => {
    const newTask: ConcertTask = {
      id: 'ct_' + Date.now(),
      concertId,
      title,
      isCompleted: false,
      xpReward
    };
    setConcertTasks(prev => [...prev, newTask]);
    sound.playSparkle();
  };

  const deleteConcertTask = (taskId: string) => {
    setConcertTasks(prev => prev.filter(t => t.id !== taskId));
    sound.playClick();
  };

  // Collectibles
  const addCollectible = (item: Omit<Collectible, 'id'>) => {
    const newId = 'col_' + Date.now();
    setCollectibles(prev => [{ ...item, id: newId }, ...prev]);
    sound.playSparkle();
  };

  const updateCollectible = (id: string, updates: Partial<Collectible>) => {
    setCollectibles(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    sound.playClick();
  };

  const deleteCollectible = (id: string) => {
    setCollectibles(prev => prev.filter(c => c.id !== id));
    sound.playClick();
  };

  // Daily Missions
  const completeDailyMission = (missionId: string) => {
    const mission = dailyMissions.find(m => m.id === missionId);
    if (!mission || mission.isCompleted) return;

    setDailyMissions(prev =>
      prev.map(m =>
        m.id === missionId ? { ...m, isCompleted: true, completedDate: todayStr } : m
      )
    );
    awardXP(mission.xp, `達成任務: ${mission.title}`);
  };

  const updateCharacterProfile = (updates: Partial<CharacterProfile>) => {
    setCharacterProfile(prev => ({ ...prev, ...updates }));
    sound.playSparkle();
  };

  const advanceAgencyStage = () => {
    setCharacterProfile(prev => ({
      ...prev,
      agencyStageIndex: Math.min(5, prev.agencyStageIndex + 1),
      agencyPoints: prev.agencyPoints + 200
    }));
    sound.playSuccess();
  };

  // Complete concert with stub
  const completeConcertWithStub = (concertId: string, stubData: Omit<TicketStub, 'id' | 'concertId' | 'createdAt'>) => {
    const stub: TicketStub = {
      ...stubData,
      id: 'stub_' + Date.now(),
      concertId,
      createdAt: todayStr
    };

    setConcerts(prev =>
      prev.map(c => {
        if (c.id === concertId) {
          return {
            ...c,
            status: 'completed',
            completedAt: todayStr,
            ticketStub: stub
          };
        }
        return c;
      })
    );

    awardXP(50, '圓滿完成演唱會並生成珍藏紀念票根！');
    sound.playSuccess();
  };

  // Reset demo
  const resetAllDataToDefault = () => {
    setAccounts(INITIAL_ACCOUNTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setMonthlyBudgets({ [INITIAL_MONTHLY_BUDGET.yearMonth]: INITIAL_MONTHLY_BUDGET.budgetLimit });
    setConcerts(INITIAL_CONCERTS);
    setConcertTasks(INITIAL_CONCERT_TASKS);
    setFundAllocations(INITIAL_FUND_ALLOCATIONS);
    setCollectibles(INITIAL_COLLECTIBLES);
    setDailyMissions(INITIAL_DAILY_MISSIONS);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setCharacterProfile(INITIAL_CHARACTER_PROFILE);
    sound.playSuccess();
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        isSoundEnabled,
        toggleSound,
        isFirebaseModalOpen,
        setIsFirebaseModalOpen,
        selectedDate,
        setSelectedDate,
        currentYearMonth,
        setCurrentYearMonth,
        accounts,
        transactions,
        monthlyBudgets,
        concerts,
        concertTasks,
        fundAllocations,
        collectibles,
        dailyMissions,
        achievements,
        characterProfile,
        monthTransactions,
        monthTotalIncome,
        monthTotalExpense,
        monthDailyExpense,
        monthIdolExpense,
        currentMonthBudgetLimit,
        monthBudgetRemaining,
        monthBudgetUsagePercent,
        totalLiquidAssets,
        totalAllocatedFunds,
        availableUnallocatedFunds,
        isTodayRecorded,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        setMonthlyBudgetLimit,
        primaryConcert,
        setPrimaryConcert,
        addConcertGoal,
        updateConcertGoal,
        deleteConcertGoal,
        allocateConcertFund,
        withdrawConcertFund,
        toggleConcertTask,
        addConcertTask,
        deleteConcertTask,
        addCollectible,
        updateCollectible,
        deleteCollectible,
        completeDailyMission,
        awardXP,
        updateCharacterProfile,
        advanceAgencyStage,
        completeConcertWithStub,
        resetAllDataToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
