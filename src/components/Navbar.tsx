import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  PlusCircle,
  Volume2,
  VolumeX,
  Cloud,
  Palette,
  User as UserIcon,
  LogIn,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Theme } from '../types';

interface NavbarProps {
  onOpenQuickTx: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickTx }) => {
  const {
    theme,
    setTheme,
    isSoundEnabled,
    toggleSound,
    setIsFirebaseModalOpen,
    totalLiquidAssets,
    availableUnallocatedFunds,
    isSyncing,
    syncError,
    isCloudSynced
  } = useApp();

  const {
    user,
    userProfile,
    loading: authLoading,
    setIsAuthModalOpen,
    setIsProfileModalOpen,
    isFirebaseReady
  } = useAuth();

  const themeOptions: { id: Theme; label: string; icon: string }[] = [
    { id: 'starlight', label: '✨ 星光簡約風', icon: '✨' },
    { id: 'pink', label: '🌸 夢幻應援粉', icon: '🌸' },
    { id: 'midnight', label: '🌙 午夜舞台暗色風', icon: '🌙' }
  ];

  const memberName = userProfile?.displayName || user?.displayName || '經紀人';
  const memberAvatar = userProfile?.photoURL || user?.photoURL;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                STAR WALK
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:block">
              追星旅程與生活養成 · 記帳是工具，演唱會是目標
            </p>
          </div>
        </div>

        {/* Central Mini Wallet & Cloud Sync Status (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500 mr-1.5">總流動資金</span>
            <span className="font-semibold text-slate-900 dark:text-white font-mono tabular-nums">
              NT$ {totalLiquidAssets.toLocaleString()}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/50 text-pink-700 dark:text-pink-300">
            <span className="text-pink-500 dark:text-pink-400 mr-1.5">可用未分配資金</span>
            <span className="font-semibold font-mono tabular-nums">
              NT$ {availableUnallocatedFunds.toLocaleString()}
            </span>
          </div>

          {/* Sync status indicator */}
          {user && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                syncError
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
                  : isSyncing
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900 text-purple-600 dark:text-purple-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
              }`}
              title={syncError || (isSyncing ? '同步至 Firestore 中...' : '已與雲端同步')}
            >
              {syncError ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>同步異常</span>
                </>
              ) : isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>同步中</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>雲端已同步</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Transaction Button */}
          <button
            onClick={onOpenQuickTx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg shadow-sm hover:shadow transition-all transform active:scale-95 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>⚡ 快速記帳</span>
          </button>

          {/* Theme Selector Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Palette className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden sm:inline">
                {themeOptions.find(t => t.id === theme)?.icon}
              </span>
            </div>
            <div className="absolute right-0 mt-1 w-44 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="text-[10px] font-semibold text-slate-400 px-2 py-1">
                🎨 打造你的專屬事務所
              </div>
              {themeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center justify-between transition-colors ${
                    theme === opt.id
                      ? 'bg-pink-500 text-white font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {theme === opt.id && <span className="text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Toggle */}
          <button
            onClick={toggleSound}
            title={isSoundEnabled ? '音效開啟' : '音效靜音'}
            className="p-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-pink-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Cloud Database / Firebase Settings Modal button */}
          <button
            onClick={() => setIsFirebaseModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
            title="查看 Firebase 雲端資料庫設定"
          >
            <Cloud className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">{user ? '雲端資料' : 'Firebase 設定'}</span>
          </button>

          {/* Member Authentication & Profile Button */}
          {authLoading ? (
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ) : user ? (
            /* Logged-in member: Shows personal avatar and nickname, opens profile modal */
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer"
              title="點擊編輯個人資料或登出"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-pink-400/80 shadow-xs bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {memberAvatar ? (
                  <img
                    src={memberAvatar}
                    alt={memberName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(memberName || 'U')[0]?.toUpperCase()}</span>
                )}
              </div>
              <span className="hidden sm:block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[90px] truncate">
                {memberName}
              </span>
            </button>
          ) : (
            /* Not logged in: Show Login / Register trigger */
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/60 border border-pink-200 dark:border-pink-800 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>登入 / 註冊</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
