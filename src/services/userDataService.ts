import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AppStateData } from '../types';
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

// Generates a clean empty state for newly registered accounts
export function getCleanInitialUserState(userName = '星途經紀人'): AppStateData {
  const currentYM = new Date().toISOString().substring(0, 7);
  return {
    accounts: [
      { id: 'acc_cash', name: '💵 現金錢包', type: 'cash', balance: 0, note: '隨身現金' },
      { id: 'acc_bank', name: '🏦 銀行帳戶', type: 'bank', balance: 0, note: '主要存款' },
      { id: 'acc_linepay', name: '📱 LINE Pay', type: 'line_pay', balance: 0, note: '行動支付' },
      { id: 'acc_card', name: '💳 信用卡', type: 'credit_card', balance: 0, note: '信用卡消費' }
    ],
    transactions: [],
    monthlyBudgets: {
      [currentYM]: 20000
    },
    concerts: [],
    concertTasks: [],
    fundAllocations: [],
    collectibles: [],
    dailyMissions: INITIAL_DAILY_MISSIONS.map(m => ({ ...m, isCompleted: false })),
    achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a, isUnlocked: false, progress: 0 })),
    characterProfile: {
      name: userName,
      level: 1,
      xp: 0,
      avatarUrl: '/src/assets/images/idol_character_trainee_1793698980118.jpg',
      currentOutfit: '粉嫩帽T練舞服',
      unlockedOutfits: ['粉嫩帽T練舞服'],
      agencyPoints: 100,
      agencyStageIndex: 0
    },
    updatedAt: Date.now()
  };
}

// Demo showcase state (for guest / preview mode)
export function getDemoInitialUserState(): AppStateData {
  return {
    accounts: INITIAL_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    monthlyBudgets: { [INITIAL_MONTHLY_BUDGET.yearMonth]: INITIAL_MONTHLY_BUDGET.budgetLimit },
    concerts: INITIAL_CONCERTS,
    concertTasks: INITIAL_CONCERT_TASKS,
    fundAllocations: INITIAL_FUND_ALLOCATIONS,
    collectibles: INITIAL_COLLECTIBLES,
    dailyMissions: INITIAL_DAILY_MISSIONS,
    achievements: INITIAL_ACHIEVEMENTS,
    characterProfile: INITIAL_CHARACTER_PROFILE,
    updatedAt: Date.now()
  };
}

// Load user state from Firestore
export async function loadUserDataFromFirestore(uid: string): Promise<AppStateData | null> {
  if (!db) return null;
  try {
    const userStateRef = doc(db, 'users', uid, 'appState', 'current');
    const snap = await getDoc(userStateRef);
    if (snap.exists()) {
      return snap.data() as AppStateData;
    }
    return null;
  } catch (err) {
    console.error('Failed to load user data from Firestore:', err);
    throw err;
  }
}

// Save user state to Firestore
export async function saveUserDataToFirestore(uid: string, data: AppStateData): Promise<void> {
  if (!db) return;
  try {
    const userStateRef = doc(db, 'users', uid, 'appState', 'current');
    await setDoc(userStateRef, {
      ...data,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.error('Failed to save user data to Firestore:', err);
    throw err;
  }
}
