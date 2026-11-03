import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Cloud, HardDrive, Download, Upload, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const FirebaseSetupModal: React.FC = () => {
  const {
    isFirebaseModalOpen,
    setIsFirebaseModalOpen,
    resetAllDataToDefault,
    transactions,
    concerts,
    collectibles,
    accounts
  } = useApp();

  const [copied, setCopied] = useState(false);

  if (!isFirebaseModalOpen) return null;

  const handleExportData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: 'STAR WALK V2.0',
      accounts,
      transactions,
      concerts,
      collectibles
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `star_walk_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('確定要將所有記帳、演唱會與收藏資料重設為初始展示資料嗎？')) {
      resetAllDataToDefault();
      setIsFirebaseModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🏢 資料儲存與 Firebase 雲端整合中心
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                本機展示模式與雲端資料庫切換指南
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsFirebaseModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300">
          {/* Current Status Banner */}
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                目前運行模式：🟢 本機離線展示模式 (Local Storage 已啟動)
              </h4>
              <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-1 leading-relaxed">
                所有新增的記帳、演唱會目標進度、基金分配、收藏小卡與養成經驗值均透過瀏覽器
                LocalStorage 即時安全保存，重新整理或重開分頁不會遺失。
              </p>
            </div>
          </div>

          {/* Backup & Management Tools */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-pink-500" />
              <span>本機資料備份與還原</span>
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportData}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>匯出 JSON 帳本備份</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重設所有展示資料</span>
              </button>
            </div>
          </div>

          {/* Firebase Cloud Upgrade Path */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>升級正式 Firebase 雲端資料庫說明</span>
            </h5>
            <p className="leading-relaxed">
              STAR WALK 採用了一致的標準資料模型（包含 users, accounts, transactions,
              concert_goals, collectibles, xp_events 等），可隨時無縫綁定 Firebase Firestore 與 Authentication。
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-slate-500 dark:text-slate-400">
              <li>於 AI Studio 中透過 Firebase 整合工具建立專屬雲端專案。</li>
              <li>啟用 Google Sign-in 或 Email 登入驗證。</li>
              <li>自動將目前本機已建立的記帳與收藏資料同步至 Firestore 用戶集合。</li>
            </ol>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => setIsFirebaseModalOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-pink-600 rounded-xl hover:bg-slate-800 transition-colors"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
