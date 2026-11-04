import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Music,
  Wallet,
  Sparkle,
  Image,
  Palette,
  UserCheck,
  Globe
} from 'lucide-react';
import { HandDrawnSticker } from './HandDrawnSticker';

export const CoverScreen: React.FC = () => {
  const { theme, setTheme, enterApp } = useApp();
  const { user, userProfile, loginWithGoogle, setIsAuthModalOpen } = useAuth();

  const memberName = userProfile?.displayName || user?.displayName || '經紀人';
  const memberAvatar = userProfile?.photoURL || user?.photoURL;

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col justify-between journal-paper-bg transition-colors duration-300">
      {/* Decorative Floating Stickers */}
      <div className="absolute top-12 left-8 hidden md:block opacity-85">
        <HandDrawnSticker sticker="ticket" size={52} className="-rotate-6" />
      </div>
      <div className="absolute top-20 right-10 hidden md:block opacity-85">
        <HandDrawnSticker sticker="photocard" size={52} className="rotate-12" />
      </div>
      <div className="absolute bottom-24 left-12 hidden lg:block opacity-85">
        <HandDrawnSticker sticker="lightstick" size={52} className="rotate-6" />
      </div>
      <div className="absolute bottom-20 right-16 hidden lg:block opacity-85">
        <HandDrawnSticker sticker="sparkles" size={44} className="-rotate-12" />
      </div>

      {/* Top Cover Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B9D] via-[#C86BFF] to-[#9B6BFF] border-[2.5px] border-[#4A3728] dark:border-slate-700 shadow-[3px_3px_0px_#4A3728] dark:shadow-[3px_3px_0px_#1e293b] flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5 fill-white text-white" />
          </div>
          <span className="text-xl font-black tracking-wider text-[#4A3728] dark:text-slate-100">
            STAR WALK
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Quick Switcher */}
          <div className="flex items-center p-1 rounded-full bg-white dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 shadow-[2px_2px_0px_#4A3728] dark:shadow-[2px_2px_0px_#1e293b]">
            <button
              onClick={() => setTheme('starlight')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                theme === 'starlight'
                  ? 'bg-[#FFE3EC] text-[#FF5C8A] border border-[#4A3728]'
                  : 'text-[#8C7365] dark:text-slate-400 hover:text-[#4A3728]'
              }`}
            >
              ✨ 簡約風
            </button>
            <button
              onClick={() => setTheme('midnight')}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                theme === 'midnight'
                  ? 'bg-slate-900 text-purple-300 border border-purple-500'
                  : 'text-[#8C7365] dark:text-slate-400 hover:text-[#4A3728]'
              }`}
            >
              🌙 暗色風
            </button>
          </div>

          {/* User Sign In Status Badge */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#E4FBF0] dark:bg-emerald-950/80 border-2 border-[#4A3728] dark:border-emerald-700 text-xs font-black text-[#1E8E68] dark:text-emerald-300 shadow-[2px_2px_0px_#4A3728]">
              <UserCheck className="w-4 h-4" />
              <span>已登入：{memberName}</span>
            </div>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border-2 border-[#4A3728] dark:border-slate-700 text-xs font-black text-[#4A3728] dark:text-slate-200 shadow-[2px_2px_0px_#4A3728] hover:bg-[#FFF0F5] transition-all"
            >
              <span>Google 登入</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Cover Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-8 flex-1 flex flex-col items-center justify-center text-center z-10">
        {/* Brand Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFE3EC] dark:bg-rose-950/80 border-2 border-[#4A3728] dark:border-rose-700 text-[#FF4785] dark:text-rose-300 text-xs font-black shadow-[3px_3px_0px_#4A3728] dark:shadow-[3px_3px_0px_#1e293b] mb-6 animate-float-slow">
          <Sparkles className="w-4 h-4 fill-[#FF5C8A]" />
          <span>星途經紀養成手帳 · STAR WALK</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black text-[#4A3728] dark:text-slate-100 tracking-tight leading-tight mb-4">
          記帳是工具，收藏是回憶<br />
          <span className="bg-gradient-to-r from-[#FF4785] via-[#A855F7] to-[#6366F1] bg-clip-text text-transparent">
            演唱會是目標
          </span>
        </h1>

        <p className="text-sm sm:text-lg font-bold text-[#8C7365] dark:text-slate-300 max-w-2xl leading-relaxed mb-8">
          結合「追星記帳、演唱會儲蓄、虛擬角色養成、周邊小卡收藏」的互動式手帳 APP。<br className="hidden sm:block" />
          記錄每一筆應援支出，步步實現夢想中的舞台冒險。
        </p>

        {/* Big CTA Enter Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mb-12">
          <button
            onClick={enterApp}
            className="w-full sm:w-auto px-10 py-4 rounded-full bg-gradient-to-r from-[#FF4785] via-[#B833FF] to-[#6366F1] text-white text-lg font-black border-3 border-[#4A3728] dark:border-slate-200 shadow-[6px_6px_0px_#4A3728] dark:shadow-[6px_6px_0px_#382a1f] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_#4A3728] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#4A3728] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>✨ 開始旅程 Start Journey</span>
            <ArrowRight className="w-6 h-6 stroke-[3] group-hover:translate-x-1 transition-transform" />
          </button>

          {!user && (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white dark:bg-slate-800 text-[#4A3728] dark:text-slate-200 text-sm font-black border-2 border-[#4A3728] dark:border-slate-700 shadow-[3px_3px_0px_#4A3728] hover:bg-[#FFF0F5] dark:hover:bg-slate-700 transition-all"
            >
              登入／註冊會員
            </button>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full">
          <div className="sketch-card p-4 text-left flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="w-9 h-9 rounded-xl bg-[#FFE3EC] border-2 border-[#4A3728] flex items-center justify-center text-[#FF5C8A] mb-3">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#4A3728] dark:text-slate-100">演唱會目標</h3>
              <p className="text-[11px] font-bold text-[#8C7365] dark:text-slate-400 mt-1">門票住宿與專屬倒數</p>
            </div>
          </div>

          <div className="sketch-card p-4 text-left flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="w-9 h-9 rounded-xl bg-[#E4FBF0] border-2 border-[#4A3728] flex items-center justify-center text-[#1E9E73] mb-3">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#4A3728] dark:text-slate-100">多國貨幣記帳</h3>
              <p className="text-[11px] font-bold text-[#8C7365] dark:text-slate-400 mt-1">日韓泰歐美即時匯率</p>
            </div>
          </div>

          <div className="sketch-card p-4 text-left flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="w-9 h-9 rounded-xl bg-[#EFE6FF] border-2 border-[#4A3728] flex items-center justify-center text-[#8A5CF5] mb-3">
              <Sparkle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#4A3728] dark:text-slate-100">角色經紀養成</h3>
              <p className="text-[11px] font-bold text-[#8C7365] dark:text-slate-400 mt-1">累積經驗升級與服裝</p>
            </div>
          </div>

          <div className="sketch-card p-4 text-left flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div className="w-9 h-9 rounded-xl bg-[#FFF6D6] border-2 border-[#4A3728] flex items-center justify-center text-[#D97706] mb-3">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#4A3728] dark:text-slate-100">周邊小卡收藏</h3>
              <p className="text-[11px] font-bold text-[#8C7365] dark:text-slate-400 mt-1">兩面相片與票根回憶</p>
            </div>
          </div>
        </div>
      </main>

      {/* Cover Footer */}
      <footer className="w-full py-4 text-center text-xs font-bold text-[#8C7365] dark:text-slate-400 z-10 border-t-2 border-[#4A3728]/10 dark:border-slate-800">
        STAR WALK｜追星旅程與生活養成 · 專屬手帳管理系統
      </footer>
    </div>
  );
};
