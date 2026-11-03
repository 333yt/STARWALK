import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
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
  TicketStub,
  AppStateData
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
import { useAuth } from './AuthContext';
import {
  getCleanInitialUserState,
  getDemoInitialUserState,
  loadUserDataFromFirestore,
  saveUserDataToFirestore
} from '../services/userDataService';

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

  // Sync state
  isSyncing: boolean;
  syncError: string | null;
  isCloudSynced: boolean;
  showImportPrompt: boolean;
  importGuestDataToAccount: () => Promise<void>;
  dismissImportPrompt: () => void;

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

  // Demo & Reset
  loadDemoDataForTesting: () => void;
  resetToCleanState: () => void;
  resetAllDataToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function getStoragePrefix(uid?: string | null): string {
  return uid ? `STAR_WALK_USER_${uid}_` : 'STAR_WALK_GUEST_';
}

function loadScopedStorage<T>(prefix: string, key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(prefix + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Storage load error for', prefix + key, e);
    return defaultValue;
  }
}

function saveScopedStorage<T>(prefix: string, key: string, value: T): void {
  try {
    localStorage.setItem(prefix + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error for', prefix + key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isFirebaseReady } = useAuth();
  const currentUid = user?.uid || null;
  const storagePrefix = getStoragePrefix(currentUid);

  // Theme state (global)
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('STAR_WALK_GLOBAL_THEME');
      return (saved as Theme) || 'starlight';
    } catch {
      return 'starlight';
    }
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [showImportPrompt, setShowImportPrompt] = useState<boolean>(false);

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

  const defaultClean = getCleanInitialUserState(user?.displayName || '星途經紀人');

  // Entities initialized from storagePrefix
  const [accounts, setAccounts] = useState<Account[]>(() =>
    loadScopedStorage(storagePrefix, 'ACCOUNTS', defaultClean.accounts)
  );
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadScopedStorage(storagePrefix, 'TRANSACTIONS', defaultClean.transactions)
  );
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, number>>(() =>
    loadScopedStorage(storagePrefix, 'BUDGETS', defaultClean.monthlyBudgets)
  );
  const [concerts, setConcerts] = useState<ConcertGoal[]>(() =>
    loadScopedStorage(storagePrefix, 'CONCERTS', defaultClean.concerts)
  );
  const [concertTasks, setConcertTasks] = useState<ConcertTask[]>(() =>
    loadScopedStorage(storagePrefix, 'CONCERT_TASKS', defaultClean.concertTasks)
  );
  const [fundAllocations, setFundAllocations] = useState<FundAllocationRecord[]>(() =>
    loadScopedStorage(storagePrefix, 'FUND_ALLOCATIONS', defaultClean.fundAllocations)
  );
  const [collectibles, setCollectibles] = useState<Collectible[]>(() =>
    loadScopedStorage(storagePrefix, 'COLLECTIBLES', defaultClean.collectibles)
  );
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() =>
    loadScopedStorage(storagePrefix, 'DAILY_MISSIONS', defaultClean.dailyMissions)
  );
  const [achievements, setAchievements] = useState<Achievement[]>(() =>
    loadScopedStorage(storagePrefix, 'ACHIEVEMENTS', defaultClean.achievements)
  );
  const [characterProfile, setCharacterProfile] = useState<CharacterProfile>(() =>
    loadScopedStorage(storagePrefix, 'CHARACTER', defaultClean.characterProfile)
  );

  // Sync to local scoped storage whenever state changes
  useEffect(() => {
    saveScopedStorage(storagePrefix, 'ACCOUNTS', accounts);
  }, [storagePrefix, accounts]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'TRANSACTIONS', transactions);
  }, [storagePrefix, transactions]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'BUDGETS', monthlyBudgets);
  }, [storagePrefix, monthlyBudgets]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'CONCERTS', concerts);
  }, [storagePrefix, concerts]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'CONCERT_TASKS', concertTasks);
  }, [storagePrefix, concertTasks]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'FUND_ALLOCATIONS', fundAllocations);
  }, [storagePrefix, fundAllocations]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'COLLECTIBLES', collectibles);
  }, [storagePrefix, collectibles]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'DAILY_MISSIONS', dailyMissions);
  }, [storagePrefix, dailyMissions]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'ACHIEVEMENTS', achievements);
  }, [storagePrefix, achievements]);

  useEffect(() => {
    saveScopedStorage(storagePrefix, 'CHARACTER', characterProfile);
  }, [storagePrefix, characterProfile]);

  // Sync to Firestore helper
  const syncToFirestore = useCallback(
    async (overrideData?: Partial<AppStateData>) => {
      if (!currentUid || !isFirebaseReady) return;
      setIsSyncing(true);
      setSyncError(null);
      try {
        const fullState: AppStateData = {
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
          ...overrideData,
          updatedAt: Date.now()
        };
        await saveUserDataToFirestore(currentUid, fullState);
        setIsCloudSynced(true);
      } catch (err: unknown) {
        console.error('Firestore sync error:', err);
        setSyncError(err instanceof Error ? err.message : '雲端資料同步發生錯誤');
      } finally {
        setIsSyncing(false);
      }
    },
    [
      currentUid,
      isFirebaseReady,
      accounts,
      transactions,
      monthlyBudgets,
      concerts,
      concertTasks,
      fundAllocations,
      collectibles,
      dailyMissions,
      achievements,
      characterProfile
    ]
  );

  // When auth user changes (Login / Logout / Switch user)
  useEffect(() => {
    let isCancelled = false;

    const handleUserSwitch = async () => {
      if (currentUid && isFirebaseReady) {
        setIsSyncing(true);
        setSyncError(null);
        try {
          const cloudData = await loadUserDataFromFirestore(currentUid);
          if (isCancelled) return;

          if (cloudData) {
            // Existing cloud account data
            setAccounts(cloudData.accounts || []);
            setTransactions(cloudData.transactions || []);
            setMonthlyBudgets(cloudData.monthlyBudgets || {});
            setConcerts(cloudData.concerts || []);
            setConcertTasks(cloudData.concertTasks || []);
            setFundAllocations(cloudData.fundAllocations || []);
            setCollectibles(cloudData.collectibles || []);
            setDailyMissions(cloudData.dailyMissions || INITIAL_DAILY_MISSIONS);
            setAchievements(cloudData.achievements || INITIAL_ACHIEVEMENTS);
            setCharacterProfile(cloudData.characterProfile || INITIAL_CHARACTER_PROFILE);
            setIsCloudSynced(true);
            setShowImportPrompt(false);
          } else {
            // Brand new registered user account
            // Check if there is guest demo data in localStorage
            const guestTxs = loadScopedStorage('STAR_WALK_GUEST_', 'TRANSACTIONS', []);
            if (guestTxs.length > 0) {
              // Ask user if they wish to import
              setShowImportPrompt(true);
            }

            // Start with clean initial user state as required by Req 11!
            const cleanState = getCleanInitialUserState(user?.displayName || '星途經紀人');
            setAccounts(cleanState.accounts);
            setTransactions(cleanState.transactions);
            setMonthlyBudgets(cleanState.monthlyBudgets);
            setConcerts(cleanState.concerts);
            setConcertTasks(cleanState.concertTasks);
            setFundAllocations(cleanState.fundAllocations);
            setCollectibles(cleanState.collectibles);
            setDailyMissions(cleanState.dailyMissions);
            setAchievements(cleanState.achievements);
            setCharacterProfile(cleanState.characterProfile);

            // Save clean state to Firestore
            await saveUserDataToFirestore(currentUid, cleanState);
            setIsCloudSynced(true);
          }
        } catch (err: unknown) {
          if (!isCancelled) {
            setSyncError('無法載入雲端資料，目前切換至本機暫存模式');
          }
        } finally {
          if (!isCancelled) setIsSyncing(false);
        }
      } else if (!currentUid) {
        // Logged out / Guest: load guest state (loads existing local state or default clean)
        const guestData = getCleanInitialUserState('訪客經紀人');
        setAccounts(loadScopedStorage('STAR_WALK_GUEST_', 'ACCOUNTS', guestData.accounts));
        setTransactions(loadScopedStorage('STAR_WALK_GUEST_', 'TRANSACTIONS', guestData.transactions));
        setMonthlyBudgets(loadScopedStorage('STAR_WALK_GUEST_', 'BUDGETS', guestData.monthlyBudgets));
        setConcerts(loadScopedStorage('STAR_WALK_GUEST_', 'CONCERTS', guestData.concerts));
        setConcertTasks(loadScopedStorage('STAR_WALK_GUEST_', 'CONCERT_TASKS', guestData.concertTasks));
        setFundAllocations(loadScopedStorage('STAR_WALK_GUEST_', 'FUND_ALLOCATIONS', guestData.fundAllocations));
        setCollectibles(loadScopedStorage('STAR_WALK_GUEST_', 'COLLECTIBLES', guestData.collectibles));
        setDailyMissions(loadScopedStorage('STAR_WALK_GUEST_', 'DAILY_MISSIONS', guestData.dailyMissions));
        setAchievements(loadScopedStorage('STAR_WALK_GUEST_', 'ACHIEVEMENTS', guestData.achievements));
        setCharacterProfile(loadScopedStorage('STAR_WALK_GUEST_', 'CHARACTER', guestData.characterProfile));
        setIsCloudSynced(false);
        setShowImportPrompt(false);
      }
    };

    handleUserSwitch();
    return () => {
      isCancelled = true;
    };
  }, [currentUid, isFirebaseReady]);

  // Handle importing guest demo data to user account
  const importGuestDataToAccount = async () => {
    if (!currentUid) return;
    const guestState: AppStateData = {
      accounts: loadScopedStorage('STAR_WALK_GUEST_', 'ACCOUNTS', INITIAL_ACCOUNTS),
      transactions: loadScopedStorage('STAR_WALK_GUEST_', 'TRANSACTIONS', INITIAL_TRANSACTIONS),
      monthlyBudgets: loadScopedStorage('STAR_WALK_GUEST_', 'BUDGETS', { [INITIAL_MONTHLY_BUDGET.yearMonth]: INITIAL_MONTHLY_BUDGET.budgetLimit }),
      concerts: loadScopedStorage('STAR_WALK_GUEST_', 'CONCERTS', INITIAL_CONCERTS),
      concertTasks: loadScopedStorage('STAR_WALK_GUEST_', 'CONCERT_TASKS', INITIAL_CONCERT_TASKS),
      fundAllocations: loadScopedStorage('STAR_WALK_GUEST_', 'FUND_ALLOCATIONS', INITIAL_FUND_ALLOCATIONS),
      collectibles: loadScopedStorage('STAR_WALK_GUEST_', 'COLLECTIBLES', INITIAL_COLLECTIBLES),
      dailyMissions: loadScopedStorage('STAR_WALK_GUEST_', 'DAILY_MISSIONS', INITIAL_DAILY_MISSIONS),
      achievements: loadScopedStorage('STAR_WALK_GUEST_', 'ACHIEVEMENTS', INITIAL_ACHIEVEMENTS),
      characterProfile: loadScopedStorage('STAR_WALK_GUEST_', 'CHARACTER', INITIAL_CHARACTER_PROFILE),
      updatedAt: Date.now()
    };

    // Backup guest data locally before import
    try {
      localStorage.setItem('STAR_WALK_GUEST_BACKUP_' + Date.now(), JSON.stringify(guestState));
    } catch (e) {
      console.warn('Backup error', e);
    }

    setAccounts(guestState.accounts);
    setTransactions(guestState.transactions);
    setMonthlyBudgets(guestState.monthlyBudgets);
    setConcerts(guestState.concerts);
    setConcertTasks(guestState.concertTasks);
    setFundAllocations(guestState.fundAllocations);
    setCollectibles(guestState.collectibles);
    setDailyMissions(guestState.dailyMissions);
    setAchievements(guestState.achievements);
    setCharacterProfile(guestState.characterProfile);

    setShowImportPrompt(false);
    await syncToFirestore(guestState);
    sound.playSuccess();
  };

  const dismissImportPrompt = () => {
    setShowImportPrompt(false);
  };

  // Theme application
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
    localStorage.setItem('STAR_WALK_GLOBAL_THEME', theme);
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

  useEffect(() => {
    sound.enabled = isSoundEnabled;
  }, [isSoundEnabled]);

  // Primary Concert
  const primaryConcert = useMemo(() => {
    return concerts.find(c => c.isPrimary) || concerts[0];
  }, [concerts]);

  const setPrimaryConcert = (id: string) => {
    const nextConcerts = concerts.map(c => ({
      ...c,
      isPrimary: c.id === id
    }));
    setConcerts(nextConcerts);
    syncToFirestore({ concerts: nextConcerts });
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
    return monthlyBudgets[currentYearMonth] ?? 20000;
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

      const updated = {
        ...prev,
        xp: newXp,
        level: newLevel
      };
      syncToFirestore({ characterProfile: updated });
      return updated;
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

    let nextCollectibles = collectibles;

    // Update account balances
    const nextAccounts = accounts.map(acc => {
      if (acc.id === txData.accountId) {
        if (acc.type === 'credit_card') {
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
    });

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
      nextCollectibles = [newCollectible, ...collectibles];
      setCollectibles(nextCollectibles);
    }

    const nextTxs = [newTx, ...transactions];
    setAccounts(nextAccounts);
    setTransactions(nextTxs);

    // Check if daily record mission can be triggered
    const dailyMission = dailyMissions.find(m => m.type === 'daily_record' && !m.isCompleted);
    if (dailyMission) {
      completeDailyMission(dailyMission.id);
    }

    syncToFirestore({
      accounts: nextAccounts,
      transactions: nextTxs,
      collectibles: nextCollectibles
    });

    sound.playCoin();
    return { success: true };
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    const nextTxs = transactions.map(tx => (tx.id === id ? { ...tx, ...updates } : tx));
    setTransactions(nextTxs);
    syncToFirestore({ transactions: nextTxs });
    sound.playClick();
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find(t => t.id === id);
    if (!target) return;

    // Reverse account impact
    const nextAccounts = accounts.map(acc => {
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
    });

    // If linked collectible exists, remove linkage
    let nextCollectibles = collectibles;
    if (target.detailedItem?.linkedCollectibleId) {
      nextCollectibles = collectibles.filter(c => c.id !== target.detailedItem?.linkedCollectibleId);
      setCollectibles(nextCollectibles);
    }

    const nextTxs = transactions.filter(t => t.id !== id);
    setAccounts(nextAccounts);
    setTransactions(nextTxs);

    syncToFirestore({
      accounts: nextAccounts,
      transactions: nextTxs,
      collectibles: nextCollectibles
    });

    sound.playClick();
  };

  // Monthly Budget
  const setMonthlyBudgetLimit = (yearMonth: string, limit: number) => {
    const nextBudgets = {
      ...monthlyBudgets,
      [yearMonth]: Math.max(0, limit)
    };
    setMonthlyBudgets(nextBudgets);
    syncToFirestore({ monthlyBudgets: nextBudgets });
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
    const nextConcerts = [...concerts, newGoal];
    setConcerts(nextConcerts);

    const defaultTasks: ConcertTask[] = [
      { id: 'ct_' + Date.now() + '_1', concertId: newId, title: '確認售票時間與實名制規則', isCompleted: false, xpReward: 15 },
      { id: 'ct_' + Date.now() + '_2', concertId: newId, title: '順利搶到演唱會指定票種', isCompleted: false, xpReward: 25 },
      { id: 'ct_' + Date.now() + '_3', concertId: newId, title: '規劃交通往返方式（高鐵/機票/客運）', isCompleted: false, xpReward: 15 },
      { id: 'ct_' + Date.now() + '_4', concertId: newId, title: '預訂場館鄰近住宿地點', isCompleted: false, xpReward: 15 },
      { id: 'ct_' + Date.now() + '_5', concertId: newId, title: '檢查官方應援棒與備用電池', isCompleted: false, xpReward: 10 }
    ];
    const nextTasks = [...concertTasks, ...defaultTasks];
    setConcertTasks(nextTasks);

    syncToFirestore({ concerts: nextConcerts, concertTasks: nextTasks });
    sound.playSparkle();
  };

  const updateConcertGoal = (id: string, updates: Partial<ConcertGoal>) => {
    const nextConcerts = concerts.map(c => (c.id === id ? { ...c, ...updates } : c));
    setConcerts(nextConcerts);
    syncToFirestore({ concerts: nextConcerts });
    sound.playClick();
  };

  const deleteConcertGoal = (id: string) => {
    const nextConcerts = concerts.filter(c => c.id !== id);
    const nextTasks = concertTasks.filter(t => t.concertId !== id);
    const nextFunds = fundAllocations.filter(f => f.concertId !== id);

    setConcerts(nextConcerts);
    setConcertTasks(nextTasks);
    setFundAllocations(nextFunds);

    syncToFirestore({
      concerts: nextConcerts,
      concertTasks: nextTasks,
      fundAllocations: nextFunds
    });

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

    const nextConcerts = concerts.map(c => {
      if (c.id === concertId) {
        const newAllocated = c.allocatedFund + amount;
        const isTargetReached = newAllocated >= c.budgetPlan.total;
        return {
          ...c,
          allocatedFund: newAllocated,
          status: (isTargetReached ? 'ready' : 'saving') as ConcertGoal['status']
        };
      }
      return c;
    });

    const record: FundAllocationRecord = {
      id: 'fa_' + Date.now(),
      concertId,
      type: 'allocate',
      amount,
      date: todayStr,
      note,
      createdAt: Date.now()
    };
    const nextFunds = [record, ...fundAllocations];

    setConcerts(nextConcerts);
    setFundAllocations(nextFunds);

    syncToFirestore({
      concerts: nextConcerts,
      fundAllocations: nextFunds
    });

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

    const nextConcerts = concerts.map(c => {
      if (c.id === concertId) {
        const newAllocated = Math.max(0, c.allocatedFund - amount);
        return {
          ...c,
          allocatedFund: newAllocated,
          status: (newAllocated >= c.budgetPlan.total ? 'ready' : 'saving') as ConcertGoal['status']
        };
      }
      return c;
    });

    const record: FundAllocationRecord = {
      id: 'fa_' + Date.now(),
      concertId,
      type: 'withdraw',
      amount,
      date: todayStr,
      note,
      createdAt: Date.now()
    };
    const nextFunds = [record, ...fundAllocations];

    setConcerts(nextConcerts);
    setFundAllocations(nextFunds);

    syncToFirestore({
      concerts: nextConcerts,
      fundAllocations: nextFunds
    });

    sound.playCoin();
    return { success: true, message: `已成功由演唱會基金轉回 NT$ ${amount.toLocaleString()} 至未分配資金池` };
  };

  // Concert Tasks
  const toggleConcertTask = (taskId: string) => {
    const nextTasks = concertTasks.map(t => {
      if (t.id === taskId) {
        const nextState = !t.isCompleted;
        if (nextState) {
          awardXP(t.xpReward, `完成演唱會準備任務: ${t.title}`);
        }
        return { ...t, isCompleted: nextState };
      }
      return t;
    });
    setConcertTasks(nextTasks);
    syncToFirestore({ concertTasks: nextTasks });
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
    const nextTasks = [...concertTasks, newTask];
    setConcertTasks(nextTasks);
    syncToFirestore({ concertTasks: nextTasks });
    sound.playSparkle();
  };

  const deleteConcertTask = (taskId: string) => {
    const nextTasks = concertTasks.filter(t => t.id !== taskId);
    setConcertTasks(nextTasks);
    syncToFirestore({ concertTasks: nextTasks });
    sound.playClick();
  };

  // Collectibles
  const addCollectible = (item: Omit<Collectible, 'id'>) => {
    const newId = 'col_' + Date.now();
    const nextCollectibles = [{ ...item, id: newId }, ...collectibles];
    setCollectibles(nextCollectibles);
    syncToFirestore({ collectibles: nextCollectibles });
    sound.playSparkle();
  };

  const updateCollectible = (id: string, updates: Partial<Collectible>) => {
    const nextCollectibles = collectibles.map(c => (c.id === id ? { ...c, ...updates } : c));
    setCollectibles(nextCollectibles);
    syncToFirestore({ collectibles: nextCollectibles });
    sound.playClick();
  };

  const deleteCollectible = (id: string) => {
    const nextCollectibles = collectibles.filter(c => c.id !== id);
    setCollectibles(nextCollectibles);
    syncToFirestore({ collectibles: nextCollectibles });
    sound.playClick();
  };

  // Daily Missions
  const completeDailyMission = (missionId: string) => {
    const mission = dailyMissions.find(m => m.id === missionId);
    if (!mission || mission.isCompleted) return;

    const nextMissions = dailyMissions.map(m =>
      m.id === missionId ? { ...m, isCompleted: true, completedDate: todayStr } : m
    );
    setDailyMissions(nextMissions);
    awardXP(mission.xp, `達成任務: ${mission.title}`);
    syncToFirestore({ dailyMissions: nextMissions });
  };

  const updateCharacterProfile = (updates: Partial<CharacterProfile>) => {
    const nextProfile = { ...characterProfile, ...updates };
    setCharacterProfile(nextProfile);
    syncToFirestore({ characterProfile: nextProfile });
    sound.playSparkle();
  };

  const advanceAgencyStage = () => {
    const nextProfile = {
      ...characterProfile,
      agencyStageIndex: Math.min(5, characterProfile.agencyStageIndex + 1),
      agencyPoints: characterProfile.agencyPoints + 200
    };
    setCharacterProfile(nextProfile);
    syncToFirestore({ characterProfile: nextProfile });
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

    const nextConcerts = concerts.map(c => {
      if (c.id === concertId) {
        return {
          ...c,
          status: 'completed' as ConcertGoal['status'],
          completedAt: todayStr,
          ticketStub: stub
        };
      }
      return c;
    });

    setConcerts(nextConcerts);
    awardXP(50, '圓滿完成演唱會並生成珍藏紀念票根！');
    syncToFirestore({ concerts: nextConcerts });
    sound.playSuccess();
  };

  // Load demo data for developer/testing purposes
  const loadDemoDataForTesting = () => {
    const demo = getDemoInitialUserState();
    setAccounts(demo.accounts);
    setTransactions(demo.transactions);
    setMonthlyBudgets(demo.monthlyBudgets);
    setConcerts(demo.concerts);
    setConcertTasks(demo.concertTasks);
    setFundAllocations(demo.fundAllocations);
    setCollectibles(demo.collectibles);
    setDailyMissions(demo.dailyMissions);
    setAchievements(demo.achievements);
    setCharacterProfile(demo.characterProfile);

    if (currentUid && isFirebaseReady) {
      syncToFirestore(demo);
    }
    sound.playSuccess();
  };

  // Reset to clean state (0 concerts, 0 transactions, 0 collectibles)
  const resetToCleanState = () => {
    const clean = getCleanInitialUserState(user?.displayName || '星途經紀人');
    setAccounts(clean.accounts);
    setTransactions([]);
    setMonthlyBudgets(clean.monthlyBudgets);
    setConcerts([]);
    setConcertTasks([]);
    setFundAllocations([]);
    setCollectibles([]);
    setDailyMissions(clean.dailyMissions);
    setAchievements(clean.achievements);
    setCharacterProfile(clean.characterProfile);

    if (currentUid && isFirebaseReady) {
      syncToFirestore(clean);
    }
    sound.playSuccess();
  };

  // Reset demo
  const resetAllDataToDefault = () => {
    resetToCleanState();
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
        isSyncing,
        syncError,
        isCloudSynced,
        showImportPrompt,
        importGuestDataToAccount,
        dismissImportPrompt,
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
        loadDemoDataForTesting,
        resetToCleanState,
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
