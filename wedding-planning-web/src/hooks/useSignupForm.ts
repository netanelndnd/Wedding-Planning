import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface SignupFormData {
  partner1Name: string;
  partner2Name: string;
  email: string;
  password: string;
  confirmPassword: string;
  weddingDate: string;
}

/**
 * useSignupForm Hook
 * -----------------
 * Handles signup form logic with performance optimizations:
 * - Dynamic imports for Firebase
 * - useCallback for memoized functions
 * - Parallel imports with Promise.all
 * - After successful registration, redirects to login page
 */
export function useSignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    partner1Name: '',
    partner2Name: '',
    email: '',
    password: '',
    confirmPassword: '',
    weddingDate: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isMockMode } = useAuth();

  // Memoize handleChange to prevent unnecessary re-renders
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Memoize handleSignup
  const handleSignup = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('הסיסמאות לא תואמות');
      return;
    }

    setLoading(true);

    if (isMockMode) {
      // In Mock Mode, simulate registration and redirect to login
      setTimeout(() => {
        router.push('/login?registered=true');
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      // Dynamic imports - parallel loading for better performance
      const [
        { createUserWithEmailAndPassword },
        { setDoc, doc, Timestamp, addDoc, collection },
        { auth, db }
      ] = await Promise.all([
        import('firebase/auth'),
        import('firebase/firestore'),
        import('@/lib/firebase')
      ]);
      
      console.log('Starting user creation...');
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      console.log('User created:', user.uid);

      // Create couple document
      await setDoc(doc(db, 'couples', user.uid), {
        id: user.uid,
        partner1Name: formData.partner1Name,
        partner2Name: formData.partner2Name,
        weddingDate: formData.weddingDate ? Timestamp.fromDate(new Date(formData.weddingDate)) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('✅ Couple document created successfully!');
      
      // Create default Epic for tasks
      console.log('Creating default epic...');
      
      const epicRef = await addDoc(collection(db, 'epics'), {
        title: 'משימות כלליות',
        description: 'משימות חשובות לתכנון החתונה',
        coupleId: user.uid,
        category: 'general',
        color: '#ec4899',
        order: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      console.log('✅ Default Epic created!');
      
      // Create default tasks
      const defaultTasks = [
        {
          title: '🏛️ הזמנת אולם',
          description: 'לבחור ולהזמין אולם לחתונה',
          priority: 'high',
          category: 'venue',
        },
        {
          title: '📸 שכירת צלם',
          description: 'לבחור צלם מקצועי לחתונה',
          priority: 'high',
          category: 'photography',
        },
        {
          title: '🎵 שכירת תקליטן או זמר',
          description: 'לבחור תקליטן או זמר לחתונה',
          priority: 'medium',
          category: 'entertainment',
        },
        {
          title: '🕍 תיאום עם רב',
          description: 'לתאם פגישה עם רב לחתונה',
          priority: 'high',
          category: 'ceremony',
        },
        {
          title: '👰 קניית שמלת כלה',
          description: 'לבחור ולהזמין שמלת כלה',
          priority: 'high',
          category: 'attire',
        },
        {
          title: '🤵 קניית חליפת חתן',
          description: 'לבחור ולהזמין חליפה לחתן',
          priority: 'medium',
          category: 'attire',
        },
      ];
      
      // Add all default tasks
      console.log(`Creating ${defaultTasks.length} default tasks...`);
      
      const taskPromises = defaultTasks.map((task, index) => {
        console.log(`📝 Creating task ${index + 1}/${defaultTasks.length}: ${task.title}`);
        return addDoc(collection(db, 'tasks'), {
          ...task,
          coupleId: user.uid,
          epicId: epicRef.id,
          status: 'pending',
          assignedTo: [],
          subtasks: [],
          order: index,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      });
      
      console.log('⏳ Waiting for all tasks to be created...');
      await Promise.all(taskPromises);
      
      console.log('✅ All default tasks created successfully!');
      console.log('✅ Registration complete! User:', user.uid);
      
      // Success! Show a brief message then redirect to dashboard
      setLoading(false);
      
      console.log('→ Redirecting to dashboard in 500ms...');
      
      // Small delay for UX, then navigate to dashboard
      setTimeout(() => {
        console.log('→ Navigating now...');
        router.push('/dashboard');
      }, 500);
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      setError(err.message || 'שגיאה ברישום');
      setLoading(false);
    }
  }, [formData, isMockMode, router]);

  return {
    formData,
    handleChange,
    error,
    loading,
    handleSignup,
    isMockMode,
  };
}

