import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, isMockMode } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Couple } from '@/types';

// Mock User for testing
const MOCK_USER = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

const MOCK_COUPLE: Couple = {
  id: 'mock-user-123',
  partner1Name: 'ישראל',
  partner2Name: 'ישראלה',
  weddingDate: new Date('2025-10-10'),
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function useAuth() {
  // Only use useAuthState if auth is available
  const authState = auth ? useAuthState(auth) : [null, false, null];
  const [firebaseUser, firebaseLoading, firebaseError] = authState;
  
  const [user, setUser] = useState<any>(null);
  const [couple, setCoupleData] = useState<Couple | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useAuth effect triggered', {
      hasAuth: !!auth,
      isMockMode,
      firebaseLoading,
      firebaseUser: firebaseUser ? 'exists' : 'null',
    });

    if (!auth || isMockMode) {
      // Mock Mode
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setCoupleData(MOCK_COUPLE);
      }
      setLoading(false);
      return;
    }

    // Firebase Mode
    if (firebaseLoading) {
      console.log('⏳ Waiting for auth to load...');
      setLoading(true);
      return;
    }
    
    console.log('👤 Auth loaded, user:', firebaseUser ? 'exists' : 'null');
    setUser(firebaseUser);
    
    // Type guard to check if firebaseUser is a User object
    if (!firebaseUser || typeof firebaseUser !== 'object' || !('uid' in firebaseUser)) {
      console.log('⚠️ No valid user found, clearing couple data');
      setCoupleData(null);
      setLoading(false);
      return;
    }

    // Subscribe to couple data for real-time updates
    // At this point, firebaseUser is guaranteed to be a User object
    const userId = firebaseUser.uid;
    console.log('🔍 Setting up couple data subscription for user:', userId);
    const coupleRef = doc(db, 'couples', userId);
    
    // First, try to get the data immediately (one-time read)
    // This ensures we have the data even if onSnapshot hasn't fired yet
    getDoc(coupleRef)
      .then((coupleDoc) => {
        if (coupleDoc.exists()) {
          const data = coupleDoc.data();
          console.log('📖 Initial couple data read (immediate):', {
            partner1Name: data.partner1Name,
            partner2Name: data.partner2Name,
            hasWeddingDate: !!data.weddingDate,
          });
          
          // Set the data immediately so it's available right away
          const coupleData: Couple = {
            ...data,
            id: userId,
            photoURL: data.photoURL || undefined,
            weddingDate: data.weddingDate?.toDate?.() || data.weddingDate,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as Couple;
          
          setCoupleData(coupleData);
          setLoading(false);
        } else {
          console.warn('⚠️ No couple data found on initial read for user:', userId);
          setCoupleData(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('❌ Error in initial couple data read:', err);
        setCoupleData(null);
        setLoading(false);
      });
    
    // Use onSnapshot for real-time updates
    // This will keep the data in sync if it changes
    const unsubscribe = onSnapshot(
      coupleRef,
      (coupleDoc) => {
        console.log('📡 Couple data snapshot received (real-time update), exists:', coupleDoc.exists());
        if (coupleDoc.exists()) {
          const data = coupleDoc.data();
          console.log('📋 Raw couple data from Firestore (snapshot):', data);
          
          const coupleData: Couple = {
            ...data,
            id: userId,
            photoURL: data.photoURL || undefined,
            weddingDate: data.weddingDate?.toDate?.() || data.weddingDate,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as Couple;
          
          console.log('✅ Couple data updated from snapshot:', {
            id: coupleData.id,
            partner1Name: coupleData.partner1Name,
            partner2Name: coupleData.partner2Name,
            weddingDate: coupleData.weddingDate,
          });
          
          // Update the data (this will trigger a re-render if data changed)
          setCoupleData(coupleData);
        } else {
          console.warn('⚠️ No couple data found in snapshot for user:', userId);
          setCoupleData(null);
        }
        // Don't set loading to false here - it's already set by getDoc
        // This is just for real-time updates
      },
      (err) => {
        console.error('❌ Error in couple data subscription:', err);
        console.error('Error details:', {
          code: err.code,
          message: err.message,
          stack: err.stack,
        });
        // Only clear data if we don't already have it from getDoc
        // Don't set loading to false here - it's already set by getDoc
      }
    );

    // Cleanup subscription on unmount or user change
    return () => {
      unsubscribe();
    };
  }, [firebaseUser, firebaseLoading]);

  // Mock Login Function
  const mockLogin = () => {
    localStorage.setItem('mockUser', JSON.stringify(MOCK_USER));
    setUser(MOCK_USER);
    setCoupleData(MOCK_COUPLE);
    window.location.href = '/dashboard';
  };

  // Mock Logout Function
  const mockLogout = () => {
    localStorage.removeItem('mockUser');
    setUser(null);
    setCoupleData(null);
    window.location.href = '/login';
  };

  // Logout Function (handles both Firebase and Mock modes)
  const logout = async () => {
    try {
      if (isMockMode) {
        mockLogout();
        return;
      }

      // Firebase logout
      if (auth) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
      }
      
      // Clear state
      setUser(null);
      setCoupleData(null);
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Debug logging
  useEffect(() => {
    const firebaseUserId = firebaseUser && typeof firebaseUser === 'object' && 'uid' in firebaseUser 
      ? (firebaseUser as { uid: string }).uid 
      : null;
    
    console.log('useAuth state:', { 
      user: user?.uid, 
      loading, 
      isAuthenticated: !!user,
      isMockMode,
      firebaseUser: firebaseUserId,
      couple: couple ? `${couple.partner1Name} & ${couple.partner2Name}` : null,
    });
  }, [user, loading, firebaseUser, couple, isMockMode]);

  return {
    user,
    couple,
    loading: loading,
    error: firebaseError,
    isAuthenticated: !!user,
    mockLogin: isMockMode ? mockLogin : undefined,
    mockLogout: isMockMode ? mockLogout : undefined,
    logout, // Universal logout function
    isMockMode,
  };
}
