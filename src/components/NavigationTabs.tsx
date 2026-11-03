import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Ticket,
  CalendarDays,
  BarChart3,
  HeartHandshake,
  Gamepad2,
  Sparkles
} from 'lucide-react';

interface TabItem {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  badge?: string;
}

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: TabItem[] = [
    { id: 'home', name: '🏠 星途首頁', shortName: '首頁', icon: Home },
    { id: 'concerts', name: '🎫 演唱會旅程', shortName: '旅程', icon: Ticket },
    { id: 'bookkeeping', name: '📅 追星記帳', shortName: '記帳', icon: CalendarDays },
    { id: 'analytics', name: '📊 財務分析', shortName: '分析', icon: BarChart3 },
    { id: 'collectibles', name: '💖 追星收藏冊', shortName: '收藏', icon: HeartHandshake },
    { id: 'character', name: '🎮 角色與任務', shortName: '養成', icon: Gamepad2 },
    { id: 'memories', name: '🎟️ 星途回憶館', shortName: '回憶', icon: Sparkles }
  ];

  return (
    <>
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block w-full border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-pink-600 dark:text-pink-400 shadow-sm border border-slate-200/80 dark:border-slate-700 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <nav className="grid grid-cols-7 h-16 items-center px-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 transition-colors ${
                  isActive
                    ? 'text-pink-600 dark:text-pink-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-pink-100 dark:bg-pink-950/60' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">
                  {tab.shortName}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
