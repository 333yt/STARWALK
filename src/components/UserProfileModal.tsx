import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { processAvatarImage } from '../utils/imageUtils';
import {
  X,
  User,
  Upload,
  Trash2,
  Copy,
  Check,
  LogOut,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const {
    user,
    userProfile,
    isProfileModalOpen,
    setIsProfileModalOpen,
    updateUserProfileData,
    logout
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(userProfile?.photoURL || user?.photoURL || null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);

  if (!isProfileModalOpen || !user) return null;

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const result = await processAvatarImage(file, 256, 0.85);
      setPreviewPhoto(result.dataUrl);
      setPhotoChanged(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '圖片處理失敗，請重新選擇。');
    }
  };

  const handleRemovePhoto = () => {
    setPreviewPhoto('');
    setPhotoChanged(true);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSaving(true);

    try {
      const updates: { displayName?: string; photoURL?: string } = {
        displayName: displayName.trim() || '星途經紀人'
      };
      if (photoChanged) {
        updates.photoURL = previewPhoto || '';
      }

      await updateUserProfileData(updates);
      setSuccessMsg('個人資料與會員頭貼已成功更新！');
      setTimeout(() => {
        setIsProfileModalOpen(false);
      }, 900);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : '更新失敗，請檢查網路連線。');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('確定要登出目前會員帳號嗎？')) {
      await logout();
      setIsProfileModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-500 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                👤 我的個人檔案
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                管理你的 STAR WALK 會員暱稱與個人頭貼
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700 dark:text-slate-200">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center gap-3 py-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-400/80 shadow-lg bg-gradient-to-tr from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {previewPhoto ? (
                  <img
                    src={previewPhoto}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(displayName || user.email || 'S')[0]?.toUpperCase()}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px]"
              >
                <Upload className="w-4 h-4 mb-0.5" />
                <span>更換頭貼</span>
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                上傳新照片
              </button>
              {previewPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  移除頭貼
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <HelpCircle className="w-3.5 h-3.5 text-pink-500" />
              <span>支援 JPG、PNG、WebP，自動中心裁切縮放為 256×256 px</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                經紀人暱稱
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="輸入您的顯示暱稱"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            {/* Readonly Account Details */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">會員帳號 (Email)：</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {user.email || 'Google 授權用戶'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">專屬會員 ID (UID)：</span>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <span className="truncate max-w-[140px] text-slate-600 dark:text-slate-400">
                    {user.uid}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUid}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title="複製 UID"
                  >
                    {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Independent Avatar Note */}
            <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 text-[11px] text-purple-800 dark:text-purple-300 space-y-1">
              <div className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                <span>會員頭貼與遊戲角色獨立運作</span>
              </div>
              <p className="leading-relaxed opacity-90">
                此處設置為您的會員帳號個人頭貼（顯示於頂部導覽列）。CharacterView
                內的遊戲角色娃娃換裝與舞台造型，不會覆蓋或影響此個人頭貼。
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>登出帳號</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 rounded-xl text-white font-bold bg-pink-500 hover:bg-pink-600 transition-all shadow-md active:scale-95 disabled:opacity-60"
              >
                {isSaving ? '儲存中...' : '儲存變更'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
