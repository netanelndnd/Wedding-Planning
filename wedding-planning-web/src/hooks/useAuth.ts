import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, isMockMode } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
      setLoading(true);
      return;
    }
    
    setUser(firebaseUser);
    
    if (!firebaseUser) {
      setCoupleData(null);
      setLoading(false);
      return;
    }

    const fetchCoupleData = async () => {
      try {
        const coupleDoc = await getDoc(doc(db, 'couples', firebaseUser.uid));
        if (coupleDoc.exists()) {
          const data = coupleDoc.data();
          setCoupleData({
            ...data,
            id: firebaseUser.uid,
            weddingDate: data.weddingDate?.toDate?.() || data.weddingDate,
            createdAt: data.createdAt?.toDate?.() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
          } as Couple);
        }
      } catch (err) {
        console.error('Error fetching couple data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupleData();
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
    console.log('useAuth state:', { 
      user: user?.uid, 
      loading, 
      isAuthenticated: !!user,
      isMockMode,
      firebaseUser: firebaseUser?.uid 
    });
  }, [user, loading, firebaseUser]);

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
