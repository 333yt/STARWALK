import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Cloud,
  HardDrive,
  Download,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  ExternalLink,
  Save
} from 'lucide-react';
import {
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig,
  isConfigured
} from '../services/firebase';

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 預設拒絕所有未授權存取
    match /{document=**} {
      allow read, write: if false;
    }

    // 會員專屬資料隔離：只有登入者本人可以讀寫自己的資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{subcollection=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`;

export const FirebaseSetupModal: React.FC = () => {
  const {
    isFirebaseModalOpen,
    setIsFirebaseModalOpen,
    resetToCleanState,
    loadDemoDataForTesting,
    resetAllDataToDefault,
    transactions,
    concerts,
    collectibles,
    accounts,
    isCloudSynced,
    syncError
  } = useApp();

  const { user, isFirebaseReady } = useAuth();

  const [copiedRules, setCopiedRules] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'rules' | 'backup'>('status');

  // Config input state
  const currentConfig = getStoredFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig?.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig?.projectId || '');
  const [appId, setAppId] = useState(currentConfig?.appId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig?.messagingSenderId || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isFirebaseModalOpen) return null;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_SNIPPET);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      alert('請至少填寫 apiKey 與 projectId');
      return;
    }
    saveStoredFirebaseConfig({
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      appId: appId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim()
    });
    setSaveSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleClearConfig = () => {
    if (window.confirm('確定要清除自訂 Firebase 設定並還原預設嗎？')) {
      clearStoredFirebaseConfig();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      app: 'STAR WALK V2.0',
      userId: user?.uid || 'guest',
      userEmail: user?.email || 'guest',
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

  const handleCleanReset = () => {
    if (window.confirm('確定要清空所有資料為全新乾淨初始狀態嗎？此操作將清除所有演唱會、記帳與收藏。')) {
      resetToCleanState();
      setIsFirebaseModalOpen(false);
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm('確定要載入開發展示測試資料嗎？此操作將覆蓋目前資料為展示樣本。')) {
      loadDemoDataForTesting();
      setIsFirebaseModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🏢 Firebase 雲端資料庫與帳號管理中心
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                驗證連線、設定安全規則與手動配置指南
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

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold px-6 pt-2 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            連線狀態
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Firebase 配置
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'rules'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Firestore 安全規則
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 px-3 border-b-2 transition-all ${
              activeTab === 'backup'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            帳本備份匯出
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-600 dark:text-slate-300 max-h-[65vh] overflow-y-auto">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  isFirebaseReady
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60'
                }`}
              >
                <CheckCircle2
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    isFirebaseReady ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
                  }`}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isFirebaseReady ? '🟢 Firebase 服務已成功連線' : '🟡 尚未載入完整 Firebase 配置'}
                  </h4>
                  <p className="mt-1 leading-relaxed text-slate-600 dark:text-slate-300">
                    {user
                      ? `目前已登入會員：${user.email || user.displayName || user.uid}。資料透過專屬 UID 隔離存取於 Firestore 雲端資料庫。`
                      : '目前處於訪客／本機離線模式。註冊或登入會員後，將自動同步至個人的 Firestore 帳號。'}
                  </p>
                </div>
              </div>

              {/* Instructions for user console */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span>您需要在 Firebase Console 完成的 3 個步驟：</span>
                </h5>
                <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed text-slate-600 dark:text-slate-300">
                  <li>
                    <strong>啟用驗證方式 (Authentication)</strong>：進入 Firebase Console →
                    Authentication → Sign-in method，啟用 <strong>Email/Password</strong> 及{' '}
                    <strong>Google</strong> 登入。
                  </li>
                  <li>
                    <strong>新增授權網域 (Authorized Domains)</strong>：在 Authentication → Settings →
                    Authorized domains，加入 <code>333yt.github.io</code> 及您的預覽網域。
                  </li>
                  <li>
                    <strong>啟用 Cloud Firestore</strong>：建立資料庫並將分頁中的「Firestore 安全規則」貼入
                    Rules 頁籤發布，確保 UID 隔離安全。
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSaveConfig} className="space-y-3">
              <p className="leading-relaxed">
                若您部署於 GitHub Pages，可在此直接填入 Firebase 專案設定值（儲存於瀏覽器
                LocalStorage，不用每次重編）：
              </p>

              {saveSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  設定已儲存！頁面即將重新載入啟用連線...
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium mb-1">apiKey *</label>
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1">projectId *</label>
                  <input
                    type="text"
                    required
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    placeholder="my-star-walk"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium mb-1">authDomain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={e => setAuthDomain(e.target.value)}
                    placeholder="my-star-walk.firebaseapp.com"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1">appId</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={e => setAppId(e.target.value)}
                    placeholder="1:123456:web:abcd"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>儲存 Firebase 設定並重新載入</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearConfig}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-rose-200 text-rose-600 hover:bg-rose-50"
                >
                  清除自訂設定
                </button>
              </div>
            </form>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  嚴格 UID 隔離的 Firestore 規則：
                </span>
                <button
                  onClick={handleCopyRules}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-pink-500 text-white font-bold hover:bg-pink-600 transition-colors text-[11px]"
                >
                  {copiedRules ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRules ? '已複製規則' : '一鍵複製規則'}</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{FIRESTORE_RULES_SNIPPET}</pre>
              </div>

              <p className="text-[11px] text-slate-400">
                請登入 Firebase Console → 您的專案 → Build → Firestore Database → Rules，將上方規則貼上並點擊
                「發布 (Publish)」即可完成權限防護。
              </p>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-pink-500" />
                  <span>本機與帳號資料備份</span>
                </h5>
                <p className="mb-3 text-slate-500">
                  將目前所有記帳、演唱會目標與周邊收藏資料匯出為 JSON 檔案，以供離線歸檔：
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={handleExportData}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors"
                  >
                    <Download className="w-4 h-4 text-blue-500" />
                    <span>匯出 JSON 備份</span>
                  </button>
                  <button
                    onClick={handleCleanReset}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>清空為全新空白</span>
                  </button>
                  <button
                    onClick={handleLoadDemo}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-medium transition-colors"
                  >
                    <HardDrive className="w-4 h-4 text-purple-500" />
                    <span>載入開發展示資料</span>
                  </button>
                </div>
              </div>
            </div>
          )}
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
