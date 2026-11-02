import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase/firebaseConfig';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile from Firestore
  const syncProfile = async (firebaseUser) => {
    if (!firebaseUser || !db) return null;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        return data;
      } else {
        // Create initial profile in Firestore
        const newProfile = {
          uid: firebaseUser.uid,
          fullName: firebaseUser.displayName || 'AICheck User',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || '',
          role: 'user', // Default role MUST be user
          createdAt: new Date().toISOString(),
          plan: 'Starter',
          totalAnalyses: 0,
          emailVerified: firebaseUser.emailVerified || false,
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.error('Error syncing user profile from Firestore:', err);
      return null;
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      // Check if temporary demo session exists in local storage
      const savedDemo = localStorage.getItem('aicheck_demo_user');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          setUser(parsed);
          setUserProfile(parsed);
        } catch (e) {
          localStorage.removeItem('aicheck_demo_user');
        }
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncProfile(currentUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email and password login
  const loginWithEmail = async (email, password, remember = true) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase credentials not configured. Please fill in client/.env or use guided setup.');
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const profile = await syncProfile(userCredential.user);
    return { user: userCredential.user, profile };
  };

  // Email and password registration
  const registerWithEmail = async (email, password, fullName) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase credentials not configured. Please fill in client/.env or use guided setup.');
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();
    const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    await updateProfile(userCredential.user, { displayName: cleanName });

    // Send verification email
    try {
      await sendEmailVerification(userCredential.user);
    } catch (verifErr) {
      console.warn('Could not send email verification automatically:', verifErr);
    }

    // Initialize in Firestore
    const newProfile = {
      uid: userCredential.user.uid,
      fullName: cleanName,
      email: cleanEmail,
      photoURL: '',
      role: 'user',
      createdAt: new Date().toISOString(),
      plan: 'Starter',
      totalAnalyses: 0,
      emailVerified: false,
    };

    if (db) {
      await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
      setUserProfile(newProfile);
    }

    return { user: userCredential.user, profile: newProfile };
  };

  // Google Sign-In
  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase credentials not configured. Please fill in client/.env or use guided setup.');
    }
    const userCredential = await signInWithPopup(auth, googleProvider);
    const profile = await syncProfile(userCredential.user);
    return { user: userCredential.user, profile };
  };

  // Password reset email
  const resetPassword = async (email) => {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase credentials not configured. Please check client/.env.');
    }
    const cleanEmail = (email || '').trim().toLowerCase();
    return sendPasswordResetEmail(auth, cleanEmail);
  };

  // Send email verification
  const sendVerification = async () => {
    if (!auth?.currentUser) throw new Error('No user currently signed in.');
    return sendEmailVerification(auth.currentUser);
  };

  // Update profile
  const updateUserProfileData = async ({ fullName, photoURL }) => {
    if (!auth?.currentUser) throw new Error('No user currently signed in.');
    
    await updateProfile(auth.currentUser, {
      displayName: fullName,
      photoURL: photoURL || auth.currentUser.photoURL,
    });

    if (db) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userDocRef, {
        fullName: fullName,
        ...(photoURL && { photoURL }),
      });
    }

    await syncProfile(auth.currentUser);
  };

  // Logout
  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem('aicheck_demo_user');
    setUser(null);
    setUserProfile(null);
    toast.success('Logged out successfully');
  };

  // Development setup test login helper (clearly labeled)
  const setDemoSession = (demoData) => {
    localStorage.setItem('aicheck_demo_user', JSON.stringify(demoData));
    setUser(demoData);
    setUserProfile(demoData);
  };

  const value = {
    user,
    userProfile,
    role: userProfile?.role || 'user',
    plan: userProfile?.plan || 'Starter',
    loading,
    isFirebaseConfigured,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    resetPassword,
    sendVerification,
    updateUserProfileData,
    logout,
    setDemoSession,
    refreshProfile: () => syncProfile(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
