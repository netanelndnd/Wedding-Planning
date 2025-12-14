import { NextRequest, NextResponse } from 'next/server';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db, isMockMode } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const { action, email, password, partner1Name, partner2Name, weddingDate } = await req.json();

    if (isMockMode) {
      // Mock Mode - Return success for all actions
      if (action === 'signup') {
        return NextResponse.json(
          { message: 'Mock user created successfully', uid: 'mock-user-123' },
          { status: 201 }
        );
      }
      if (action === 'signin') {
        return NextResponse.json(
          { message: 'Mock signed in successfully', uid: 'mock-user-123' },
          { status: 200 }
        );
      }
      if (action === 'signout') {
        return NextResponse.json({ message: 'Mock signed out successfully' }, { status: 200 });
      }
      return NextResponse.json({ message: 'Action simulated' }, { status: 200 });
    }

    if (action === 'signup') {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create couple document
      await setDoc(doc(db, 'couples', user.uid), {
        id: user.uid,
        partner1Name,
        partner2Name,
        weddingDate: weddingDate ? Timestamp.fromDate(new Date(weddingDate)) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return NextResponse.json(
        { message: 'User created successfully', uid: user.uid },
        { status: 201 }
      );
    }

    if (action === 'signin') {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return NextResponse.json(
        { message: 'Signed in successfully', uid: user.uid },
        { status: 200 }
      );
    }

    if (action === 'signout') {
      await signOut(auth);
      return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
    }

    if (action === 'resetPassword') {
      await sendPasswordResetEmail(auth, email);
      return NextResponse.json(
        { message: 'Password reset email sent' },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 400 }
    );
  }
}
