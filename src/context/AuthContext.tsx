import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, isConfigured } from '../services/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateUserProfileData: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapFirebaseError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const msg = err.message;

  if (msg.includes('auth/invalid-email')) return '電子郵件格式不正確，請重新輸入。';
  if (msg.includes('auth/user-not-found') || msg.includes('auth/invalid-credential')) {
    return '電子郵件或密碼不正確，請確認後重新輸入。';
  }
  if (msg.includes('auth/wrong-password')) return '密碼不正確，請重新輸入。';
  if (msg.includes('auth/email-already-in-use')) return '此電子郵件已被註冊，請直接登入或使用忘記密碼。';
  if (msg.includes('auth/weak-password')) return '密碼安全性不足，請設定至少 6 個字元的密碼。';
  if (msg.includes('auth/popup-closed-by-user')) return 'Google 登入視窗已關閉，請重新嘗試。';
  if (msg.includes('auth/unauthorized-domain')) {
    return '此網域尚未在 Firebase Console 加入授權網域 (Authorized domains)。請至 Firebase 設定。';
  }
  if (msg.includes('auth/operation-not-allowed')) {
    return '此登入方式尚未在 Firebase Console 啟用。請在 Firebase Console 啟用 Email/Password 或 Google 登入。';
  }
  if (msg.includes('auth/network-request-failed')) return '網路連線失敗，請檢查網路連線狀態。';

  return err.message;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Monitor auth state changes
  useEffect(() => {
    if (!auth || !isConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      setAuthError(null);

      if (currentUser && db) {
        const userDocRef = doc(db, 'users', currentUser.uid);

        // Subscribe to real-time updates for user profile doc
        const unwatchDoc = onSnapshot(
          userDocRef,
          async docSnap => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data() as UserProfile);
            } else {
              // Create initial profile document if it doesn't exist
              const initialProfile: UserProfile = {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || '星途經紀人',
                photoURL: currentUser.photoURL || '',
                createdAt: Date.now(),
                updatedAt: Date.now()
              };
              try {
                await setDoc(userDocRef, initialProfile);
                setUserProfile(initialProfile);
              } catch (e) {
                console.error('Error creating user profile document:', e);
              }
            }
            setLoading(false);
          },
          err => {
            console.error('Snapshot error for user profile:', err);
            setLoading(false);
          }
        );

        return () => unwatchDoc();
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Register with email and password
  const registerWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth) throw new Error('Firebase 服務尚未初始化，請先設定 Firebase 設定檔。');
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const cleanName = name.trim() || '星途經紀人';

      // Update Firebase Auth profile
      await updateFirebaseProfile(cred.user, { displayName: cleanName });

      // Create Firestore user document
      if (db) {
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cleanName,
          photoURL: '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        setUserProfile(profile);
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      const msg = mapFirebaseError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Login with email and password
  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase 服務尚未初始化，請先設定 Firebase 設定檔。');
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      setIsAuthModalOpen(false);
    } catch (err) {
      const msg = mapFirebaseError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Login with Google Popup
  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase 服務尚未初始化，請先設定 Firebase 設定檔。');
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Ensure user profile in Firestore
      if (db && result.user) {
        const ref = doc(db, 'users', result.user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          const profile: UserProfile = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName || '星途經紀人',
            photoURL: result.user.photoURL || '',
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          await setDoc(ref, profile);
          setUserProfile(profile);
        }
      }
      setIsAuthModalOpen(false);
    } catch (err) {
      const msg = mapFirebaseError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Logout
  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setAuthError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Send Password Reset
  const sendPasswordReset = async (email: string) => {
    if (!auth) throw new Error('Firebase 服務尚未初始化。');
    setAuthError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const msg = mapFirebaseError(err);
      setAuthError(msg);
      throw new Error(msg);
    }
  };

  // Update User Profile (Nickname, Avatar)
  const updateUserProfileData = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error('尚未登入會員');

    const cleanUpdates: Partial<UserProfile> = {
      updatedAt: Date.now()
    };
    if (updates.displayName !== undefined) {
      cleanUpdates.displayName = updates.displayName.trim();
    }
    if (updates.photoURL !== undefined) {
      cleanUpdates.photoURL = updates.photoURL;
    }

    // 1. Update Auth profile
    if (auth?.currentUser) {
      try {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: cleanUpdates.displayName,
          photoURL: cleanUpdates.photoURL
        });
      } catch (e) {
        console.warn('Update Auth profile warning:', e);
      }
    }

    // 2. Update Firestore document `users/{uid}`
    if (db) {
      const ref = doc(db, 'users', user.uid);
      await updateDoc(ref, cleanUpdates);
    }

    setUserProfile(prev => (prev ? { ...prev, ...cleanUpdates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isFirebaseReady: isConfigured && !!auth && !!db,
        authError,
        setAuthError,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        updateUserProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
