import React from 'react';
import { useApp } from '../context/AppContext';

interface TabItem {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
}

export const NavigationTabs: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const tabs: TabItem[] = [
    { id: 'home', name: '經紀日誌｜月曆', shortName: '首頁', emoji: '🏠' },
    { id: 'concerts', name: '演唱會旅程', shortName: '旅程', emoji: '🎫' },
    { id: 'bookkeeping', name: '公司帳本', shortName: '帳本', emoji: '📋' },
    { id: 'analytics', name: '財務管理室', shortName: '分析', emoji: '📊' },
    { id: 'collectibles', name: '追星收藏冊', shortName: '收藏', emoji: '💖' },
    { id: 'character', name: '角色與任務', shortName: '養成', emoji: '👗' },
    { id: 'memories', name: '星途回憶館', shortName: '回憶', emoji: '🎟️' }
  ];

  return (
    <>
      {/* Top Bookmark Navigation Bar */}
      <div className="border-b-2 border-dashed border-[#E6D7C3] bg-[#FFF9EE]/90 backdrop-blur-xs sticky top-[61px] z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FFE3EC] text-[#FF3B75] border-2 border-[#4A3728] shadow-[2.5px_2.5px_0px_#4A3728] -translate-y-0.5'
                      : 'bg-white/90 text-[#4A3728] border-2 border-transparent hover:border-[#D8C2B0] hover:bg-white'
                  }`}
                >
                  <span className="text-sm">{tab.emoji}</span>
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF7]/95 backdrop-blur-md border-t-2 border-[#4A3728] pb-safe shadow-lg">
        <nav className="grid grid-cols-7 h-14 items-center px-1">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 transition-all ${
                  isActive
                    ? 'text-[#FF3B75] font-black'
                    : 'text-[#8C7365] hover:text-[#4A3728]'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-[#FFE3EC] border border-[#4A3728] shadow-2xs' : ''
                  }`}
                >
                  <span className="text-base leading-none">{tab.emoji}</span>
                </div>
                <span className="text-[10px] font-bold mt-0.5 whitespace-nowrap">
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
