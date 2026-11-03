import {
  Account,
  ConcertGoal,
  ConcertTask,
  Collectible,
  DailyMission,
  Achievement,
  CharacterProfile,
  Transaction,
  MonthlyBudget,
  FundAllocationRecord
} from '../types';

export const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'acc_cash',
    name: '💵 現金錢包',
    type: 'cash',
    balance: 4500,
    note: '隨身現金與應援零錢'
  },
  {
    id: 'acc_bank',
    name: '🏦 國泰世華銀行',
    type: 'bank',
    balance: 78500,
    note: '主帳戶與儲蓄基金'
  },
  {
    id: 'acc_linepay',
    name: '📱 LINE Pay (綁定銀行)',
    type: 'line_pay',
    balance: 2800,
    cardPaymentSourceId: 'acc_bank',
    note: '日常手機感應支付'
  },
  {
    id: 'acc_card',
    name: '💳 玉山 U Bear 信用卡',
    type: 'credit_card',
    balance: 5200, // Current bill to be settled
    cardPaymentSourceId: 'acc_bank',
    note: '購票與海外代購'
  }
];

export const INITIAL_CONCERTS: ConcertGoal[] = [
  {
    id: 'cg_twice_taipei',
    title: 'TWICE 5TH WORLD TOUR <READY TO BE> IN TAIPEI',
    artist: 'TWICE',
    date: '2026-11-28',
    country: '台灣',
    city: '台北',
    venue: '台北小巨蛋',
    budgetPlan: {
      ticket: 6800,
      travel: 1200,
      lodging: 3500,
      merchandise: 5000,
      other: 2000,
      total: 18500
    },
    allocatedFund: 12500,
    coverImage: '/src/assets/images/idol_character_stage_star_1793698980767.jpg',
    notes: '一定要搶到搖滾區特區序號！應援棒電池已備妥 🍭',
    status: 'saving',
    isPrimary: true
  },
  {
    id: 'cg_svt_tokyo',
    title: 'SEVENTEEN [RIGHT HERE] WORLD TOUR IN TOKYO',
    artist: 'SEVENTEEN',
    date: '2026-12-19',
    country: '日本',
    city: '東京',
    venue: '東京巨蛋 (Tokyo Dome)',
    budgetPlan: {
      ticket: 7800,
      travel: 14000,
      lodging: 12000,
      merchandise: 6000,
      other: 3200,
      total: 43000
    },
    allocatedFund: 14500,
    coverImage: '/src/assets/images/idol_character_superstar_1793698981923.jpg',
    notes: '跨海看巨蛋公演！機票早鳥優惠持續關注中 💎',
    status: 'saving',
    isPrimary: false
  },
  {
    id: 'cg_ive_kaohsiung',
    title: 'IVE THE 1ST WORLD TOUR <SHOW WHAT I HAVE> ENCORE',
    artist: 'IVE',
    date: '2026-10-12',
    country: '台灣',
    city: '高雄',
    venue: '高雄巨蛋',
    budgetPlan: {
      ticket: 5800,
      travel: 2600,
      lodging: 3200,
      merchandise: 2400,
      other: 1000,
      total: 15000
    },
    allocatedFund: 15000,
    coverImage: '/src/assets/images/idol_character_trainee_1793698980118.jpg',
    notes: '完美落幕！安可舞台真的太感動了 🎀',
    status: 'completed',
    isPrimary: false,
    completedAt: '2026-10-12',
    ticketStub: {
      id: 'stub_ive_01',
      concertId: 'cg_ive_kaohsiung',
      photoUrl: '/src/assets/images/idol_character_trainee_1793698980118.jpg',
      memo: '在二樓看台區全場大合唱 I AM，全員發光閃耀！今晚的感動會收藏一輩子 ✨',
      actualSpend: 14650,
      createdAt: '2026-10-13'
    }
  }
];

export const INITIAL_CONCERT_TASKS: ConcertTask[] = [
  // TWICE Taipei tasks
  { id: 'ct_1', concertId: 'cg_twice_taipei', title: '確認拓元官方售票時間與實名制規則', isCompleted: true, xpReward: 15 },
  { id: 'ct_2', concertId: 'cg_twice_taipei', title: '成功搶下搖滾區特區入場門票', isCompleted: true, xpReward: 25 },
  { id: 'ct_3', concertId: 'cg_twice_taipei', title: '訂購高鐵來回早鳥票與捷運卡加值', isCompleted: true, xpReward: 15 },
  { id: 'ct_4', concertId: 'cg_twice_taipei', title: '預訂小巨蛋周邊友善平價飯店', isCompleted: false, xpReward: 15 },
  { id: 'ct_5', concertId: 'cg_twice_taipei', title: '檢查應援棒 CandyBong 藍牙連線與 4 號電池', isCompleted: false, xpReward: 10 },
  { id: 'ct_6', concertId: 'cg_twice_taipei', title: '整理演唱會手幅、防噪耳塞與後背包', isCompleted: false, xpReward: 10 },
  { id: 'ct_7', concertId: 'cg_twice_taipei', title: '到達場館領取場外應援小卡與排隊入場', isCompleted: false, xpReward: 30 },

  // SVT Tokyo tasks
  { id: 'ct_10', concertId: 'cg_svt_tokyo', title: '加入日本官方會員抽票申請', isCompleted: true, xpReward: 20 },
  { id: 'ct_11', concertId: 'cg_svt_tokyo', title: '確認護照效期超過 6 個月', isCompleted: true, xpReward: 10 },
  { id: 'ct_12', concertId: 'cg_svt_tokyo', title: '比價並預訂台北-東京成田/羽田機票', isCompleted: false, xpReward: 20 },
  { id: 'ct_13', concertId: 'cg_svt_tokyo', title: '克拉棒三代藍牙配對與更新', isCompleted: false, xpReward: 10 },
  { id: 'ct_14', concertId: 'cg_svt_tokyo', title: '準備日本網卡 eSIM 與 Suica 交通卡', isCompleted: false, xpReward: 15 }
];

export const INITIAL_FUND_ALLOCATIONS: FundAllocationRecord[] = [
  {
    id: 'fa_1',
    concertId: 'cg_twice_taipei',
    type: 'allocate',
    amount: 5000,
    date: '2026-10-15',
    note: '啟動 TWICE 台北場演唱會專屬儲蓄基金',
    createdAt: Date.now() - 15 * 86400000
  },
  {
    id: 'fa_2',
    concertId: 'cg_twice_taipei',
    type: 'allocate',
    amount: 4500,
    date: '2026-10-28',
    note: '發薪日分配生活結餘至 TWICE 基金',
    createdAt: Date.now() - 6 * 86400000
  },
  {
    id: 'fa_3',
    concertId: 'cg_twice_taipei',
    type: 'allocate',
    amount: 3000,
    date: '2026-11-01',
    note: '省下飲料聚餐開銷存入演唱會基金',
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'fa_4',
    concertId: 'cg_svt_tokyo',
    type: 'allocate',
    amount: 14500,
    date: '2026-10-20',
    note: '東京巨蛋遠征第一階段專款儲備',
    createdAt: Date.now() - 14 * 86400000
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_01',
    date: '2026-11-01',
    type: 'income',
    amount: 42000,
    categoryGroup: 'daily',
    category: '薪水',
    accountId: 'acc_bank',
    note: '10月份正職工作薪資入帳',
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'tx_02',
    date: '2026-11-01',
    type: 'expense',
    amount: 130,
    categoryGroup: 'daily',
    category: '飲食',
    accountId: 'acc_linepay',
    note: '早午餐三明治套餐與燕麥拿鐵',
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'tx_03',
    date: '2026-11-01',
    type: 'expense',
    amount: 1250,
    categoryGroup: 'idol',
    category: '官方周邊',
    accountId: 'acc_card',
    note: 'TWICE 官方手燈 CandyBong ∞ 補給',
    detailedItem: {
      itemName: 'CandyBong ∞ 官方應援棒',
      photoUrl: '/src/assets/images/idol_character_stage_star_1793698980767.jpg',
      groupName: 'TWICE',
      artistName: 'TWICE',
      itemType: '應援手燈',
      quantity: 1,
      unitPrice: 1250,
      shippingFee: 0,
      otherFee: 0,
      platform: 'JYP SHOP 官方快閃店',
      isArrived: true,
      syncToCollection: true,
      linkedCollectibleId: 'col_candybong'
    },
    createdAt: Date.now() - 2 * 86400000
  },
  {
    id: 'tx_04',
    date: '2026-11-02',
    type: 'expense',
    amount: 120,
    categoryGroup: 'daily',
    category: '交通',
    accountId: 'acc_cash',
    note: '台北捷運悠遊卡自動儲值',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'tx_05',
    date: '2026-11-02',
    type: 'expense',
    amount: 380,
    categoryGroup: 'idol',
    category: '小卡、特典卡',
    accountId: 'acc_bank',
    note: '收一張志效 With YOU-th 預購特典閃卡',
    detailedItem: {
      itemName: 'With YOU-th 志效特典小卡',
      photoUrl: '/src/assets/images/idol_character_superstar_1793698981923.jpg',
      groupName: 'TWICE',
      artistName: 'TWICE',
      memberName: '志效 (Jihyo)',
      itemType: '小卡',
      quantity: 1,
      unitPrice: 380,
      shippingFee: 38,
      otherFee: 0,
      platform: 'Facebook 換卡社團社友出讓',
      isArrived: true,
      syncToCollection: true,
      linkedCollectibleId: 'col_jihyo_card'
    },
    createdAt: Date.now() - 86400000
  },
  {
    id: 'tx_06',
    date: '2026-11-03',
    type: 'expense',
    amount: 185,
    categoryGroup: 'daily',
    category: '飲食',
    accountId: 'acc_linepay',
    note: '健康雙主菜日式便當與無糖茶',
    createdAt: Date.now()
  },
  {
    id: 'tx_07',
    date: '2026-11-03',
    type: 'expense',
    amount: 520,
    categoryGroup: 'idol',
    category: '專輯、唱片',
    accountId: 'acc_card',
    note: 'SEVENTEEN 12th Mini Album 預購版 (淨漢封面)',
    detailedItem: {
      itemName: 'SEVENTEEN 12th Mini Album SPILL THE FEELS',
      photoUrl: '/src/assets/images/idol_character_stage_star_1793698980767.jpg',
      groupName: 'SEVENTEEN',
      artistName: 'SEVENTEEN',
      memberName: '全體 / 淨漢盤',
      itemType: 'CD專輯',
      quantity: 1,
      unitPrice: 520,
      shippingFee: 60,
      otherFee: 0,
      platform: '五大唱片官網',
      isArrived: false,
      syncToCollection: true,
      linkedCollectibleId: 'col_svt_album'
    },
    createdAt: Date.now()
  }
];

export const INITIAL_COLLECTIBLES: Collectible[] = [
  {
    id: 'col_candybong',
    name: 'CandyBong ∞ 官方應援棒',
    photoUrl: '/src/assets/images/idol_character_stage_star_1793698980767.jpg',
    group: 'TWICE',
    artist: 'TWICE',
    member: '全體',
    category: '官方周邊',
    quantity: 1,
    price: 1250,
    purchaseDate: '2026-11-01',
    channel: 'JYP SHOP 官方快閃店',
    status: '已到貨',
    note: '附贈全員手燈吊繩與專用防塵收納袋',
    linkedTransactionId: 'tx_03'
  },
  {
    id: 'col_jihyo_card',
    name: 'With YOU-th 志效特典小卡',
    photoUrl: '/src/assets/images/idol_character_superstar_1793698981923.jpg',
    group: 'TWICE',
    artist: 'TWICE',
    member: '志效 (Jihyo)',
    category: '小卡、特典卡',
    quantity: 1,
    price: 380,
    purchaseDate: '2026-11-02',
    channel: '社團收卡',
    status: '已到貨',
    note: '無瑕疵對光無損！已放進硬卡套珍藏',
    linkedTransactionId: 'tx_05'
  },
  {
    id: 'col_svt_album',
    name: 'SEVENTEEN 12th Mini Album SPILL THE FEELS',
    photoUrl: '/src/assets/images/idol_character_stage_star_1793698980767.jpg',
    group: 'SEVENTEEN',
    artist: 'SEVENTEEN',
    member: '全體 / 淨漢盤',
    category: '專輯、唱片',
    quantity: 1,
    price: 520,
    purchaseDate: '2026-11-03',
    channel: '五大唱片官網',
    status: '待到貨',
    note: '等待韓方發行空運抵台通知',
    linkedTransactionId: 'tx_07'
  },
  {
    id: 'col_plush_bunny',
    name: 'NAVELY 娜璉兔兔官方毛絨娃娃吊飾',
    photoUrl: '/src/assets/images/idol_character_trainee_1793698980118.jpg',
    group: 'TWICE',
    artist: 'TWICE',
    member: '娜璉 (Nayeon)',
    category: '非官方周邊、娃娃',
    quantity: 1,
    price: 680,
    purchaseDate: '2026-10-18',
    channel: '首爾聖水快閃連線代購',
    status: '已到貨',
    note: '掛在追星後背包上看演唱會超吸睛！'
  }
];

export const INITIAL_MONTHLY_BUDGET: MonthlyBudget = {
  yearMonth: '2026-11',
  budgetLimit: 22000 // Monthly expense ceiling
};

export const INITIAL_DAILY_MISSIONS: DailyMission[] = [
  {
    id: 'ms_daily_record',
    title: '📝 完成今日第一筆收支記帳',
    xp: 10,
    isCompleted: true,
    type: 'daily_record',
    description: '保持清楚金流是看演唱會的基石！',
    completedDate: '2026-11-03'
  },
  {
    id: 'ms_budget_check',
    title: '🎯 檢視本週消費預算與剩餘額度',
    xp: 20,
    isCompleted: false,
    type: 'budget_check',
    description: '每週核對一次預算進度，避免不知不覺超支'
  },
  {
    id: 'ms_concert_task',
    title: '🎟️ 前進一步！推進一項演唱會準備任務',
    xp: 15,
    isCompleted: false,
    type: 'concert_task',
    description: '核對門票、交通、住宿或應援配備'
  },
  {
    id: 'ms_weekly_review',
    title: '📊 檢視本週消費分析圖表',
    xp: 30,
    isCompleted: false,
    type: 'weekly_review',
    description: '分析日常與追星開銷比例，健康理財'
  },
  {
    id: 'ms_habit_goal',
    title: '💧 達成今日生活自律小習慣（自己煮飯或少喝一杯手搖）',
    xp: 10,
    isCompleted: false,
    type: 'habit_goal',
    description: '自律生活，多存 50 元放入演唱會專用金庫！'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_record',
    title: '星途啟程記帳家',
    description: '累計完成第一次生活記帳紀錄',
    icon: '✨',
    isUnlocked: true,
    unlockedAt: '2026-10-15',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_save_10k',
    title: '萬人搖滾區蓄力',
    description: '單一演唱會專用基金累計儲蓄超過 NT$ 10,000',
    icon: '💎',
    isUnlocked: true,
    unlockedAt: '2026-10-28',
    progress: 12500,
    maxProgress: 10000
  },
  {
    id: 'ach_collect_5',
    title: '卡冊閃耀收藏家',
    description: '收藏冊中登錄超過 4 件珍貴追星收藏品',
    icon: '🎀',
    isUnlocked: true,
    unlockedAt: '2026-11-02',
    progress: 4,
    maxProgress: 4
  },
  {
    id: 'ach_first_concert',
    title: '巨蛋現場見證者',
    description: '圓滿完成一場演唱會並生成珍藏紀念票根',
    icon: '🏟️',
    isUnlocked: true,
    unlockedAt: '2026-10-13',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'ach_streak_7',
    title: '自律經紀人一週連霸',
    description: '連續 7 天完成當日記帳任務',
    icon: '👑',
    isUnlocked: false,
    progress: 3,
    maxProgress: 7
  }
];

export const INITIAL_CHARACTER_PROFILE: CharacterProfile = {
  name: '小星經紀人',
  level: 4,
  xp: 145, // Next level requires 200 XP
  avatarUrl: '/src/assets/images/idol_character_trainee_1793698980118.jpg',
  currentOutfit: '粉嫩帽T練舞服',
  unlockedOutfits: ['粉嫩帽T練舞服', '星光閃耀打歌服', '深藍天界女帝禮服'],
  agencyPoints: 850,
  agencyStageIndex: 1 // 1: Street Busking / rookie star
};
