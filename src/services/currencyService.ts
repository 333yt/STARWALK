import { CurrencyCode, CurrencyConfig } from '../types';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'TWD', symbol: 'NT$', name: '新台幣 (TWD)', flag: '🇹🇼', defaultRateToTWD: 1.0 },
  { code: 'JPY', symbol: '¥', name: '日圓 (JPY)', flag: '🇯🇵', defaultRateToTWD: 0.215 },
  { code: 'KRW', symbol: '₩', name: '韓元 (KRW)', flag: '🇰🇷', defaultRateToTWD: 0.0238 },
  { code: 'USD', symbol: '$', name: '美元 (USD)', flag: '🇺🇸', defaultRateToTWD: 32.2 },
  { code: 'CNY', symbol: '¥', name: '人民幣 (CNY)', flag: '🇨🇳', defaultRateToTWD: 4.52 },
  { code: 'HKD', symbol: 'HK$', name: '港幣 (HKD)', flag: '🇭🇰', defaultRateToTWD: 4.12 },
  { code: 'EUR', symbol: '€', name: '歐元 (EUR)', flag: '🇪🇺', defaultRateToTWD: 34.8 },
  { code: 'GBP', symbol: '£', name: '英鎊 (GBP)', flag: '🇬🇧', defaultRateToTWD: 41.5 },
  { code: 'SGD', symbol: 'S$', name: '新加坡幣 (SGD)', flag: '🇸🇬', defaultRateToTWD: 24.5 },
  { code: 'THB', symbol: '฿', name: '泰銖 (THB)', flag: '🇹🇭', defaultRateToTWD: 0.94 }
];

export interface FetchRateResult {
  rate: number; // 1 foreign currency = rate TWD
  provider: string;
  timeString: string;
}

const RATE_CACHE: Record<string, { rate: number; timestamp: number; provider: string }> = {};
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes cache

export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return CURRENCIES.find(c => c.code === code) || CURRENCIES[0];
}

export async function fetchLiveExchangeRateToTWD(
  fromCurrency: CurrencyCode,
  forceRefresh = false
): Promise<FetchRateResult> {
  if (fromCurrency === 'TWD') {
    return {
      rate: 1.0,
      provider: '中央銀行 (1:1)',
      timeString: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };
  }

  const now = Date.now();
  const cached = RATE_CACHE[fromCurrency];

  if (!forceRefresh && cached && now - cached.timestamp < CACHE_DURATION_MS) {
    return {
      rate: cached.rate,
      provider: cached.provider,
      timeString: new Date(cached.timestamp).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };
  }

  // Try API 1: Frankfurter API
  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${fromCurrency}&to=TWD`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.TWD) {
        const rate = Number(data.rates.TWD);
        const provider = 'Frankfurter API / 歐洲中央銀行';
        RATE_CACHE[fromCurrency] = { rate, timestamp: now, provider };
        return {
          rate,
          provider,
          timeString: new Date(now).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
        };
      }
    }
  } catch (err) {
    console.warn(`Frankfurter API fetch failed for ${fromCurrency}, trying backup API...`, err);
  }

  // Try API 2: open.er-api.com
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`, {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && data.rates.TWD) {
        const rate = Number(data.rates.TWD);
        const provider = 'Exchange Rate API (即時匯率)';
        RATE_CACHE[fromCurrency] = { rate, timestamp: now, provider };
        return {
          rate,
          provider,
          timeString: new Date(now).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
        };
      }
    }
  } catch (err) {
    console.warn(`Backup exchange rate API failed for ${fromCurrency}`, err);
  }

  // Fallback to internal reference rate
  const config = getCurrencyConfig(fromCurrency);
  const fallbackRate = config.defaultRateToTWD;
  const provider = '系統基準參考匯率 (備用)';
  RATE_CACHE[fromCurrency] = { rate: fallbackRate, timestamp: now, provider };
  
  return {
    rate: fallbackRate,
    provider,
    timeString: new Date(now).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  };
}

/**
 * Calculates converted TWD value accurately avoiding JS float errors
 */
export function calculateTwdAmount(originalAmount: number, rate: number): number {
  if (isNaN(originalAmount) || isNaN(rate) || originalAmount <= 0 || rate <= 0) {
    return 0;
  }
  return Math.round((originalAmount * rate) * 100) / 100;
}

/**
 * Formats multi-currency string for UI display
 * e.g., "¥ 10,000 (NT$ 2,150)" or "NT$ 2,150"
 */
export function formatMultiCurrencyDisplay(
  twdAmount: number,
  originalAmount?: number,
  originalCurrency?: CurrencyCode
): string {
  if (!originalCurrency || originalCurrency === 'TWD' || !originalAmount) {
    return `NT$ ${Math.round(twdAmount).toLocaleString()}`;
  }

  const config = getCurrencyConfig(originalCurrency);
  return `${config.symbol} ${originalAmount.toLocaleString()} (NT$ ${Math.round(twdAmount).toLocaleString()})`;
}

export interface CurrencySumItem {
  code: CurrencyCode;
  symbol: string;
  flag: string;
  name: string;
  amount: number;
  twdAmount: number;
}

export interface BudgetCurrencyBreakdown {
  isSingleCurrency: boolean;
  sums: CurrencySumItem[];
  totalTWD: number;
}

/**
 * Groups concert budget line items by currency and sums amounts separately per currency.
 * If all items use the same currency, isSingleCurrency is true.
 */
export function calculateBudgetCurrencySums(
  items: { amount: number; currency?: CurrencyCode }[],
  mainCurrency: CurrencyCode = 'TWD'
): BudgetCurrencyBreakdown {
  const sumMap = new Map<CurrencyCode, { amount: number; twdAmount: number }>();
  let totalTWD = 0;

  items.forEach(item => {
    const amt = item.amount || 0;
    const curr = item.currency || mainCurrency;
    const config = getCurrencyConfig(curr);
    const twd = Math.round(amt * (config.defaultRateToTWD || 1));
    totalTWD += twd;

    if (amt > 0) {
      const existing = sumMap.get(curr) || { amount: 0, twdAmount: 0 };
      existing.amount += amt;
      existing.twdAmount += twd;
      sumMap.set(curr, existing);
    }
  });

  if (sumMap.size === 0) {
    sumMap.set(mainCurrency, { amount: 0, twdAmount: 0 });
  }

  const sums: CurrencySumItem[] = [];
  sumMap.forEach((val, code) => {
    const config = getCurrencyConfig(code);
    sums.push({
      code,
      symbol: config.symbol,
      flag: config.flag,
      name: config.name,
      amount: val.amount,
      twdAmount: val.twdAmount
    });
  });

  return {
    isSingleCurrency: sums.length <= 1,
    sums,
    totalTWD
  };
}
