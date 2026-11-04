import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { CoverScreen } from './components/CoverScreen';
import { Navbar } from './components/Navbar';
import { NavigationTabs } from './components/NavigationTabs';
import { QuickTransactionModal } from './components/QuickTransactionModal';
import { FirebaseSetupModal } from './components/FirebaseSetupModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';

import { HomeView } from './views/HomeView';
import { ConcertsView } from './views/ConcertsView';
import { BookkeepingView } from './views/BookkeepingView';
import { AnalyticsView } from './views/AnalyticsView';
import { CollectiblesView } from './views/CollectiblesView';
import { CharacterView } from './views/CharacterView';
import { MemoriesView } from './views/MemoriesView';

const MainAppContent: React.FC = () => {
  const {
    hasEntered,
    activeTab,
    theme,
    showImportPrompt,
    importGuestDataToAccount,
    dismissImportPrompt
  } = useApp();

  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [quickTxDate, setQuickTxDate] = useState<string | undefined>(undefined);

  if (!hasEntered) {
    return (
      <>
        <CoverScreen />
        <FirebaseSetupModal />
        <AuthModal />
      </>
    );
  }

  const handleOpenQuickTxWithDate = (date: string) => {
    setQuickTxDate(date);
    setIsQuickTxOpen(true);
  };

  const handleOpenQuickTx = () => {
    setQuickTxDate(undefined);
    setIsQuickTxOpen(true);
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'midnight'
          ? 'bg-[#0d1117] text-slate-100'
          : 'bg-[#fffdf7] text-[#4A3728]'
      }`}
    >
      {/* Top Navbar */}
      <Navbar onOpenQuickTx={handleOpenQuickTx} />

      {/* Navigation Sub-bar */}
      <NavigationTabs />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Guest Data Import Banner (Shown only when a new user signs up and previous local demo data exists) */}
        {showImportPrompt && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-[#4A3728] dark:border-pink-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#4A3728]">
            <div>
              <h4 className="text-sm font-bold text-[#4A3728] dark:text-white flex items-center gap-2">
                <span>✨ 發現未綁定帳號的舊展示／本機記帳資料</span>
              </h4>
              <p className="text-xs text-[#8C7365] dark:text-slate-300 mt-0.5">
                您希望將登入前在本機操作的記帳與收藏資料匯入至目前的專屬會員帳號，還是保留全新空白帳本？
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={importGuestDataToAccount}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#FF5C8A] hover:bg-[#FF4785] rounded-xl border border-[#4A3728] transition-all shadow-xs"
              >
                📥 匯入本機資料
              </button>
              <button
                onClick={dismissImportPrompt}
                className="px-3.5 py-1.5 text-xs font-medium border border-[#4A3728] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
              >
                ✨ 保留全新空白帳本
              </button>
            </div>
          </div>
        )}

        {activeTab === 'home' && <HomeView onOpenQuickTx={handleOpenQuickTx} />}
        {activeTab === 'concerts' && <ConcertsView />}
        {activeTab === 'bookkeeping' && (
          <BookkeepingView onOpenQuickTxWithDate={handleOpenQuickTxWithDate} />
        )}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'collectibles' && <CollectiblesView />}
        {activeTab === 'character' && <CharacterView />}
        {activeTab === 'memories' && <MemoriesView />}
      </main>

      {/* Floating Modals */}
      <QuickTransactionModal
        isOpen={isQuickTxOpen}
        onClose={() => setIsQuickTxOpen(false)}
        defaultDate={quickTxDate}
      />

      <FirebaseSetupModal />
      <AuthModal />
      <UserProfileModal />

      {/* Footer */}
      <footer className="mt-12 border-t-2 border-[#4A3728]/15 dark:border-slate-800 py-6 text-center text-xs text-[#8C7365] dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>STAR WALK｜追星旅程與生活養成 V2.5</span>
          <div className="flex items-center gap-2">
            <span>記帳是工具</span>
            <span>·</span>
            <span>收藏是回憶</span>
            <span>·</span>
            <span>遊戲是動力</span>
            <span>·</span>
            <span className="text-[#FF5C8A] dark:text-pink-400 font-bold">演唱會是目標</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
