import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, LogIn, UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    sendPasswordReset,
    authError,
    setAuthError
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setResetSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!displayName.trim()) {
          setAuthError('請填寫經紀人暱稱');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setAuthError('密碼長度需至少 6 個字元');
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, displayName);
      } else if (mode === 'login') {
        await loginWithEmail(email, password);
      } else if (mode === 'forgot') {
        if (!email.trim()) {
          setAuthError('請輸入註冊時使用的電子郵件');
          setIsSubmitting(false);
          return;
        }
        await sendPasswordReset(email);
        setResetSuccessMessage('重設密碼信件已寄出！請至您的電子信箱檢查（包括垃圾郵件匣）。');
      }
    } catch {
      // Error handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
    } catch {
      // handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md my-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-500 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                🌟 STAR WALK 會員登入 / 註冊
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Firebase 雲端同步 · 跨裝置保存追星記帳與旅程
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setAuthError(null);
              setIsAuthModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {authError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Primary Hero: Google One-Click Login */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-pink-200/70 dark:border-pink-900/50 text-center space-y-3.5">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-300 border border-pink-200/50">
                ✨ Firebase 官方推薦驗證
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
                使用 Google 帳號一鍵登入
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                免記密碼 · 快速安全 · 即刻解鎖 Firestore 雲端即時同步
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-pink-400 dark:hover:border-pink-500 text-slate-800 dark:text-slate-100 text-xs font-bold flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSubmitting ? 'Google 連線授權中...' : '使用 Google 帳號快速登入'}</span>
            </button>
          </div>

          {/* Toggle for Email/Password fallback */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors"
            >
              <span>使用電子郵件與密碼登入或註冊</span>
              {showEmailForm ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showEmailForm && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              {/* Tab switch */}
              {mode !== 'forgot' && (
                <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => {
                      setMode('login');
                      setAuthError(null);
                    }}
                    className={`flex-1 pb-1.5 text-xs font-bold text-center border-b-2 transition-all ${
                      mode === 'login'
                        ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    登入帳號
                  </button>
                  <button
                    onClick={() => {
                      setMode('register');
                      setAuthError(null);
                    }}
                    className={`flex-1 pb-1.5 text-xs font-bold text-center border-b-2 transition-all ${
                      mode === 'register'
                        ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                        : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    註冊帳號
                  </button>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {mode === 'register' && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                      經紀人暱稱 *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="例如：小星經紀人"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">
                    電子信箱 *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="your-email@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-slate-700 dark:text-slate-300 font-medium">
                        密碼 *
                      </label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setAuthError(null);
                            setResetSuccessMessage(null);
                          }}
                          className="text-[11px] text-pink-500 hover:underline"
                        >
                          忘記密碼？
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="至少 6 個字元"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-sm transition-all active:scale-98 disabled:opacity-60 flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>處理中...</span>
                    ) : mode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>以信箱密碼登入</span>
                      </>
                    ) : mode === 'register' ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>註冊信箱帳號</span>
                      </>
                    ) : (
                      <span>寄送密碼重設信件</span>
                    )}
                  </button>
                </div>
              </form>

              {mode === 'forgot' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setAuthError(null);
                      setResetSuccessMessage(null);
                    }}
                    className="text-xs text-pink-500 hover:underline font-semibold"
                  >
                    ← 返回登入
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
