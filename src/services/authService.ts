import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    type User,
    sendPasswordResetEmail,
    sendEmailVerification
} from 'firebase/auth';
import { ref, set, get, update, runTransaction, serverTimestamp as rtdbTimestamp } from 'firebase/database';
import { auth, rtdb, googleProvider } from '../config/firebase';
import installTrackingService from './installTrackingService';

class AuthService {
    /**
     * Sign up with email and password
     */
    async signUp(email: string, password: string, displayName: string): Promise<User> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name
            await updateProfile(user, { displayName });

            // Send verification email
            await sendEmailVerification(user);

            // Create Firestore user document
            await this.createUserDocument(user, displayName);

            return user;
        } catch (error: any) {
            console.error('Sign up error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string): Promise<User> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await this.updateLastLogin(userCredential.user.uid);

            // Link current install to this user
            await installTrackingService.linkToUser(userCredential.user.uid);

            return userCredential.user;
        } catch (error: any) {
            console.error('Sign in error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Sign in with Google
     */
    async signInWithGoogle(): Promise<User> {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user document exists, create if not
            await this.createUserDocument(user, user.displayName || '');
            await this.updateLastLogin(user.uid);

            // Link current install to this user
            await installTrackingService.linkToUser(user.uid);

            return user;
        } catch (error: any) {
            console.error('Google sign in error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Sign out
     */
    async signOut(): Promise<void> {
        try {
            await firebaseSignOut(auth);
        } catch (error: any) {
            console.error('Sign out error:', error);
            throw new Error('Failed to sign out');
        }
    }

    /**
     * Send password reset email
     */
    async resetPassword(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
            console.error('Password reset error:', error);
            throw new Error(this.getErrorMessage(error.code));
        }
    }

    /**
     * Create user document in RTDB
     */
    private async createUserDocument(user: User, displayName: string): Promise<void> {
        const userRef = ref(rtdb, `users/${user.uid}`);

        try {
            // Check if user already exists
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
                return; // User exists, do not overwrite
            }

            const deviceInfo = this.getDeviceInfo();
            const installRef = this.getOrCreateInstallRef();

            await set(userRef, {
                uid: user.uid,
                email: user.email,
                displayName: displayName || user.displayName || '',
                photoURL: user.photoURL || '',
                emailVerified: user.emailVerified,
                providerId: user.providerData[0]?.providerId || 'password',
                createdAt: rtdbTimestamp(),
                lastLogin: rtdbTimestamp(),
                deviceInfo,
                installRef,
                preferences: {
                    theme: localStorage.getItem('app_theme') || 'dark',
                    compactMode: false,
                    autoplayTrailers: true,
                    notifications: false
                },
                stats: {
                    totalItems: 0,
                    totalMovies: 0,
                    totalShows: 0,
                    lastActive: rtdbTimestamp()
                }
            });

            // Link install to user
            await installTrackingService.linkToUser(user.uid);

            // Increment user count in dashboard metrics
            await this.incrementMetric('userCount');
            await this.incrementDailySignup();

        } catch (error) {
            console.error('Error creating user document:', error);
        }
    }

    /**
     * Update last login timestamp
     */
    private async updateLastLogin(uid: string): Promise<void> {
        try {
            const user = auth.currentUser;
            const userRef = ref(rtdb, `users/${uid}`);
            const updates: any = {
                lastLogin: rtdbTimestamp(),
                'stats/lastActive': rtdbTimestamp()
            };

            // Update verification status if user object is available
            if (user) {
                updates['emailVerified'] = user.emailVerified;
                updates['providerId'] = user.providerData[0]?.providerId || 'password';
            }

            await update(userRef, updates);
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    /**
     * Get device information
     */
    private getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    /**
     * Get or create install reference
     */
    private getOrCreateInstallRef(): string {
        let installRef = localStorage.getItem('installRef');
        if (!installRef) {
            installRef = `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('installRef', installRef);
        }
        return installRef;
    }

    /**
     * Increment dashboard metric
     */
    private async incrementMetric(metric: string): Promise<void> {
        try {
            const metricsRef = ref(rtdb, 'dashboard/metrics');
            await runTransaction(metricsRef, (currentData) => {
                if (currentData === null) {
                    const initialData: any = {
                        installCount: 0,
                        userCount: 0,
                        monthlyActiveUsers: 0,
                        lastUpdated: rtdbTimestamp()
                    };
                    initialData[metric] = 1;
                    return initialData;
                }
                return {
                    ...currentData,
                    [metric]: (currentData[metric] || 0) + 1,
                    lastUpdated: rtdbTimestamp()
                };
            });
        } catch (error) {
            console.error('Error incrementing metric:', error);
        }
    }

    /**
     * Increment daily signup count
     */
    private async incrementDailySignup(): Promise<void> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const analyticsRef = ref(rtdb, `analytics/daily/${today}`);

            await runTransaction(analyticsRef, (currentData) => {
                if (currentData === null) {
                    return {
                        date: today,
                        signups: 1,
                        installs: 0,
                        timestamp: rtdbTimestamp()
                    };
                }
                return {
                    ...currentData,
                    signups: (currentData.signups || 0) + 1,
                    timestamp: rtdbTimestamp()
                };
            });
        } catch (error) {
            console.error('Error incrementing daily signup:', error);
        }
    }

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (user: User | null) => void): () => void {
        return onAuthStateChanged(auth, callback);
    }

    /**
     * Get current user
     */
    getCurrentUser(): User | null {
        return auth.currentUser;
    }

    /**
     * Get user-friendly error messages
     */
    private getErrorMessage(errorCode: string): string {
        const errorMessages: Record<string, string> = {
            'auth/email-already-in-use': 'This email is already registered',
            'auth/invalid-email': 'Invalid email address',
            'auth/operation-not-allowed': 'Operation not allowed',
            'auth/weak-password': 'Password should be at least 6 characters',
            'auth/user-disabled': 'This account has been disabled',
            'auth/user-not-found': 'No account found with this email',
            'auth/wrong-password': 'Incorrect password',
            'auth/too-many-requests': 'Too many attempts. Please try again later',
            'auth/network-request-failed': 'Network error. Please check your connection',
            'auth/popup-closed-by-user': 'Sign in cancelled',
            'auth/cancelled-popup-request': 'Sign in cancelled'
        };

        return errorMessages[errorCode] || 'An error occurred. Please try again';
    }
}

export const authService = new AuthService();
export default authService;
