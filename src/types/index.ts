export type Theme = 'starlight' | 'pink' | 'midnight';

export type TxType = 'expense' | 'income';

export type CategoryGroup = 'daily' | 'idol';

export type DailyCategory = 
  | '飲食'
  | '交通'
  | '購物'
  | '娛樂'
  | '生活用品'
  | '其他';

export type IdolCategory =
  | '小卡、特典卡'
  | '專輯、唱片'
  | '官方周邊'
  | '非官方周邊、娃娃'
  | '演唱會、見面會'
  | '交通、住宿、旅遊'
  | '應援、集資、生日活動'
  | '代購、代付、運費'
  | '影音、會員、平台訂閱'
  | '拍立得、簽售、線下活動'
  | '其他追星支出';

export type IncomeCategory =
  | '薪水'
  | '零用錢'
  | '獎金'
  | '其他收入';

export type AccountType = 'cash' | 'bank' | 'line_pay' | 'credit_card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number; // For credit card, positive represents unpaid balance or credit limit
  cardPaymentSourceId?: string; // If line_pay or credit card pays via a bank account
  note?: string;
}

export interface DetailedItemInfo {
  itemName: string;
  photoUrl?: string;
  groupName: string;
  artistName: string;
  memberName?: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  shippingFee: number;
  otherFee: number;
  platform: string;
  isArrived: boolean;
  syncToCollection: boolean;
  linkedCollectibleId?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TxType;
  amount: number;
  categoryGroup: CategoryGroup;
  category: string;
  accountId: string;
  note: string;
  detailedItem?: DetailedItemInfo;
  createdAt: number;
}

export interface MonthlyBudget {
  yearMonth: string; // YYYY-MM
  budgetLimit: number;
}

export interface ConcertBudgetPlan {
  ticket: number;
  travel: number;
  lodging: number;
  merchandise: number;
  other: number;
  total: number;
}

export interface ConcertTask {
  id: string;
  concertId: string;
  title: string;
  isCompleted: boolean;
  dueDate?: string;
  xpReward: number;
}

export interface FundAllocationRecord {
  id: string;
  concertId: string;
  type: 'allocate' | 'withdraw';
  amount: number;
  date: string; // YYYY-MM-DD
  note: string;
  createdAt: number;
}

export interface TicketStub {
  id: string;
  concertId: string;
  photoUrl?: string;
  memo: string;
  actualSpend: number;
  createdAt: string;
}

export interface ConcertGoal {
  id: string;
  title: string;
  artist: string;
  date?: string; // YYYY-MM-DD
  country: string;
  city: string;
  venue: string;
  budgetPlan: ConcertBudgetPlan;
  allocatedFund: number;
  coverImage: string;
  notes: string;
  status: 'planning' | 'saving' | 'ready' | 'completed';
  isPrimary: boolean;
  completedAt?: string;
  ticketStub?: TicketStub;
}

export type CollectibleStatus =
  | '想收'
  | '已購入'
  | '待到貨'
  | '已到貨'
  | '贈送取得'
  | '交換取得'
  | '已轉售';

export interface Collectible {
  id: string;
  name: string;
  photoUrl: string;
  group: string;
  artist: string;
  member: string;
  category: string;
  quantity: number;
  price: number;
  purchaseDate: string; // YYYY-MM-DD
  channel: string;
  status: CollectibleStatus;
  note: string;
  linkedTransactionId?: string;
}

export interface DailyMission {
  id: string;
  title: string;
  xp: number;
  isCompleted: boolean;
  type: 'daily_record' | 'weekly_review' | 'budget_check' | 'concert_task' | 'habit_goal';
  description: string;
  completedDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface CharacterProfile {
  name: string;
  level: number;
  xp: number;
  avatarUrl: string;
  currentOutfit: string;
  unlockedOutfits: string[];
  agencyPoints: number; // Virtual idols agency currency
  agencyStageIndex: number; // 0 to 5
}
