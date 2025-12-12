import { doc, setDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

interface DeviceInfo {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    timezone: string;
    isPWA: boolean;
}

class InstallTrackingService {
    private installId: string | null = null;
    private initialized: boolean = false;

    /**
     * Initialize and track installation
     */
    async initialize(): Promise<void> {
        if (this.initialized) return;

        try {
            // Check if already tracked
            const tracked = localStorage.getItem('installTracked');
            this.installId = localStorage.getItem('installRef');

            if (tracked && this.installId) {
                // Just update last active
                await this.updateLastActive();
                this.initialized = true;
                return;
            }

            // Create new install tracking
            await this.trackNewInstallation();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing install tracking:', error);
        }
    }

    /**
     * Track a new installation
     */
    private async trackNewInstallation(): Promise<void> {
        // Generate unique install ID
        this.installId = `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('installRef', this.installId);

        const deviceInfo = this.getDeviceInfo();

        try {
            const installRef = doc(db, 'installs', this.installId);
            await setDoc(installRef, {
                installId: this.installId,
                installedAt: serverTimestamp(),
                lastActive: serverTimestamp(),
                deviceInfo,
                version: '1.0.0',
                userId: null // Will be linked when user signs in
            });

            // Increment global install count
            await this.incrementInstallCount();

            // Increment daily install count
            await this.incrementDailyInstall();

            // Mark as tracked
            localStorage.setItem('installTracked', 'true');

            console.log('Installation tracked:', this.installId);
        } catch (error) {
            console.error('Error tracking installation:', error);
        }
    }

    /**
     * Update last active timestamp
     */
    async updateLastActive(): Promise<void> {
        if (!this.installId) return;

        try {
            const installRef = doc(db, 'installs', this.installId);
            await updateDoc(installRef, {
                lastActive: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating last active:', error);
        }
    }

    /**
     * Link installation to user account
     */
    async linkToUser(userId: string): Promise<void> {
        if (!this.installId) return;

        try {
            const installRef = doc(db, 'installs', this.installId);
            await updateDoc(installRef, {
                userId,
                linkedAt: serverTimestamp()
            });

            console.log('Installation linked to user:', userId);
        } catch (error) {
            console.error('Error linking installation to user:', error);
        }
    }

    /**
     * Get device information
     */
    private getDeviceInfo(): DeviceInfo {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            isPWA: window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true ||
                document.referrer.includes('android-app://')
        };
    }

    /**
     * Increment global install count
     */
    private async incrementInstallCount(): Promise<void> {
        try {
            const metricsRef = doc(db, 'dashboard', 'metrics');
            await setDoc(metricsRef, {
                installCount: increment(1),
                lastUpdated: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error incrementing install count:', error);
        }
    }

    /**
     * Increment daily install count
     */
    private async incrementDailyInstall(): Promise<void> {
        try {
            const today = new Date().toISOString().split('T')[0];
            const analyticsRef = doc(db, 'analytics', 'daily', today);
            await setDoc(analyticsRef, {
                date: today,
                installs: increment(1),
                timestamp: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error incrementing daily install:', error);
        }
    }

    /**
     * Get current install ID
     */
    getInstallId(): string | null {
        return this.installId;
    }

    /**
     * Check if installation is tracked
     */
    isTracked(): boolean {
        return !!localStorage.getItem('installTracked');
    }
}

export const installTrackingService = new InstallTrackingService();
export default installTrackingService;
