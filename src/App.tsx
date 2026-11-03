import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NavigationTabs } from './components/NavigationTabs';
import { QuickTransactionModal } from './components/QuickTransactionModal';
import { FirebaseSetupModal } from './components/FirebaseSetupModal';

import { HomeView } from './views/HomeView';
import { ConcertsView } from './views/ConcertsView';
import { BookkeepingView } from './views/BookkeepingView';
import { AnalyticsView } from './views/AnalyticsView';
import { CollectiblesView } from './views/CollectiblesView';
import { CharacterView } from './views/CharacterView';
import { MemoriesView } from './views/MemoriesView';

const MainAppContent: React.FC = () => {
  const { activeTab, theme } = useApp();
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [quickTxDate, setQuickTxDate] = useState<string | undefined>(undefined);

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
          ? 'bg-slate-950 text-slate-100'
          : theme === 'pink'
          ? 'bg-rose-50/40 text-slate-900'
          : 'bg-slate-50/70 text-slate-900'
      }`}
    >
      {/* Top Navbar */}
      <Navbar onOpenQuickTx={handleOpenQuickTx} />

      {/* Navigation Sub-bar */}
      <NavigationTabs />

      {/* Main View Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200/60 dark:border-slate-800/60 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>STAR WALK｜追星旅程與生活養成 V2.0</span>
          <div className="flex items-center gap-2">
            <span>記帳是工具</span>
            <span>·</span>
            <span>收藏是回憶</span>
            <span>·</span>
            <span>遊戲是動力</span>
            <span>·</span>
            <span className="text-pink-600 dark:text-pink-400 font-semibold">演唱會是目標</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
