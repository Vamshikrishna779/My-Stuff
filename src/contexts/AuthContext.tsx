import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import authService from '../services/authService';

interface UserDocument {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    createdAt: any;
    lastLogin: any;
    deviceInfo: any;
    installRef?: string;
    admin?: boolean; // Admin status from Firestore
    preferences?: {
        theme: string;
        compactMode: boolean;
        autoplayTrailers: boolean;
        notifications: boolean;
    };
    stats?: {
        totalItems: number;
        totalMovies: number;
        totalShows: number;
        lastActive: any;
    };
}

interface AuthContextType {
    user: User | null;
    userDoc: UserDocument | null;
    isAdmin: boolean;
    loading: boolean;
    signUp: (email: string, password: string, displayName: string) => Promise<User>;
    signIn: (email: string, password: string) => Promise<User>;
    signInWithGoogle: () => Promise<User>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChange(async (user) => {
            setUser(user);

            if (user) {
                // Listen to user document changes in real-time
                const userRef = doc(db, 'users', user.uid);
                const unsubscribeDoc = onSnapshot(
                    userRef,
                    (doc) => {
                        if (doc.exists()) {
                            const userData = doc.data() as UserDocument;
                            setUserDoc(userData);
                            // Check admin status from Firestore document
                            setIsAdmin(!!userData.admin);
                        }
                    },
                    (error) => {
                        console.error('Error listening to user document:', error);
                    }
                );

                setLoading(false);

                // Cleanup function for user document listener
                return () => {
                    unsubscribeDoc();
                };
            } else {
                setUserDoc(null);
                setIsAdmin(false);
                setLoading(false);
            }
        });

        // Cleanup auth state listener
        return () => {
            unsubscribe();
        };
    }, []);

    const value: AuthContextType = {
        user,
        userDoc,
        isAdmin,
        loading,
        signUp: authService.signUp.bind(authService),
        signIn: authService.signIn.bind(authService),
        signInWithGoogle: authService.signInWithGoogle.bind(authService),
        signOut: authService.signOut.bind(authService),
        resetPassword: authService.resetPassword.bind(authService)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export default AuthContext;
