import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Plus,
  Zap,
  Volume2,
  VolumeX,
  Cloud,
  Palette,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  User as UserIcon
} from 'lucide-react';
import { Theme } from '../types';

interface NavbarProps {
  onOpenQuickTx: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickTx }) => {
  const {
    theme,
    setTheme,
    exitToCover,
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
    loginWithGoogle
  } = useAuth();

  const themeOptions: { id: Theme; label: string; icon: string }[] = [
    { id: 'starlight', label: '✨ 簡約風', icon: '✨' },
    { id: 'midnight', label: '🌙 暗色風', icon: '🌙' }
  ];

  const memberName = userProfile?.displayName || user?.displayName || '經紀人';
  const memberAvatar = userProfile?.photoURL || user?.photoURL;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-b-[2.5px] border-[#4A3728] transition-colors duration-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Hand-Drawn Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B9D] via-[#C86BFF] to-[#9B6BFF] border-[2.5px] border-[#4A3728] shadow-[3px_3px_0px_#4A3728] flex items-center justify-center text-white transform hover:rotate-6 transition-transform">
            <Sparkles className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-wider text-[#4A3728]">
                STAR WALK
              </span>
              <span className="hidden sm:inline-block text-[11px] font-black px-2 py-0.5 rounded-full bg-[#FFE3EC] text-[#FF5C8A] border border-[#4A3728]">
                星途經紀養成所
              </span>
            </div>
            <p className="text-[11px] font-bold text-[#8C7365] hidden md:block">
              追星旅程與生活養成 · 記帳是工具，演唱會是目標
            </p>
          </div>
        </div>

        {/* Middle: Financial Metrics Pills */}
        <div className="hidden lg:flex items-center gap-2.5">
          <div className="sticker-btn-soft px-3.5 py-1 rounded-2xl bg-[#F3F6FA] text-left flex flex-col">
            <span className="text-[10px] font-bold text-[#8C7365] leading-tight">
              總流動資金
            </span>
            <span className="font-mono-num text-xs font-black text-[#4A3728]">
              NT$ {totalLiquidAssets.toLocaleString()}
            </span>
          </div>

          <div className="sticker-btn-soft px-3.5 py-1 rounded-2xl bg-[#FFF0F6] text-left flex flex-col">
            <span className="text-[10px] font-bold text-[#FF5C8A] leading-tight">
              可用未分配資金
            </span>
            <span className="font-mono-num text-xs font-black text-[#FF5C8A]">
              NT$ {availableUnallocatedFunds.toLocaleString()}
            </span>
          </div>

          {/* Sync Status Badge */}
          {user && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-[#4A3728] text-xs font-black shadow-[2px_2px_0px_#4A3728] ${
                syncError
                  ? 'bg-[#FFE3EC] text-[#FF3B75]'
                  : isSyncing
                  ? 'bg-[#EFE6FF] text-[#8A5CF5]'
                  : 'bg-[#E4FBF0] text-[#1E9E73]'
              }`}
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1E9E73]" />
                  <span>雲端已同步</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Tactile Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Primary Quick Record Button */}
          <button
            onClick={onOpenQuickTx}
            className="sticker-btn px-4 py-2 rounded-full bg-gradient-to-r from-[#FF4785] to-[#B833FF] text-white text-xs sm:text-sm font-black flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <Zap className="w-3.5 h-3.5 fill-[#FFD84D] text-[#FFD84D]" />
            <span>快速記一筆</span>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative group">
            <button
              type="button"
              className="sticker-btn-soft px-3 py-1.5 rounded-full bg-white text-xs font-black text-[#4A3728] flex items-center gap-1"
            >
              <Palette className="w-4 h-4 text-[#FF5C8A]" />
              <span className="hidden sm:inline">風格</span>
            </button>
            <div className="absolute right-0 mt-1 w-48 p-2 bg-[#FFFDF7] border-2 border-[#4A3728] rounded-2xl shadow-[4px_4px_0px_#4A3728] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="text-[10px] font-black text-[#8C7365] px-2 py-1">
                🎨 打造你的專屬事務所
              </div>
              {themeOptions.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-xl flex items-center justify-between transition-colors my-0.5 ${
                    theme === opt.id
                      ? 'bg-[#FFE3EC] text-[#FF5C8A] border border-[#4A3728]'
                      : 'text-[#4A3728] hover:bg-[#FFF5F8]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {theme === opt.id && <span className="text-[10px]">✓</span>}
                </button>
              ))}

              <div className="my-1 border-t border-[#4A3728]/15" />
              <button
                onClick={exitToCover}
                className="w-full text-left px-2.5 py-1.5 text-xs font-bold text-[#8C7365] hover:text-[#FF5C8A] hover:bg-[#FFF0F5] rounded-xl transition-colors flex items-center gap-1.5"
              >
                <span>🏠 返回封面頁</span>
              </button>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`sticker-btn-soft w-9 h-9 rounded-full flex items-center justify-center ${
              isSoundEnabled ? 'bg-[#FFE3EC] text-[#FF5C8A]' : 'bg-white text-[#8C7365]'
            }`}
            title={isSoundEnabled ? '音效開啟' : '音效靜音'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Cloud Database Modal Trigger */}
          <button
            onClick={() => setIsFirebaseModalOpen(true)}
            className="sticker-btn-soft px-3 py-1.5 rounded-full bg-[#E4FBF0] text-[#1E8E68] text-xs font-black flex items-center gap-1.5"
            title="查看 Firebase 雲端狀態"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{user ? '雲端備份' : '雲端設定'}</span>
          </button>

          {/* Member Profile Button */}
          {authLoading ? (
            <div className="w-8 h-8 rounded-full bg-[#E2CFC0] animate-pulse border-2 border-[#4A3728]" />
          ) : user ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="sticker-btn-soft p-1 rounded-full bg-[#FFE3EC] flex items-center gap-1.5"
              title="個人檔案與登出"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#4A3728] bg-gradient-to-tr from-[#FF5C8A] to-[#9B6BFF] flex items-center justify-center text-white text-xs font-bold">
                {memberAvatar ? (
                  <img src={memberAvatar} alt={memberName} className="w-full h-full object-cover" />
                ) : (
                  <span>{(memberName || 'U')[0]?.toUpperCase()}</span>
                )}
              </div>
              <span className="hidden sm:block text-xs font-black text-[#4A3728] max-w-[80px] truncate pr-2">
                {memberName}
              </span>
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="sticker-btn px-3 py-1.5 rounded-full bg-white text-xs font-black text-[#4A3728] flex items-center gap-1.5"
            >
              <span>Google 登入</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
