import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Cloud Functions Service
 * Provides typed wrappers for calling Cloud Functions
 */

interface GetUserCountResult {
    success: boolean;
    count: number;
    timestamp: any;
}

interface SetAdminResult {
    success: boolean;
    message: string;
    uid: string;
    isAdmin: boolean;
    timestamp: any;
}

class CloudFunctionsService {
    /**
     * Get total user count from Firebase Authentication
     * Requires admin privileges
     */
    async getUserCount(): Promise<number> {
        try {
            const getUserCountFn = httpsCallable<void, GetUserCountResult>(functions, 'getUserCount');
            const result = await getUserCountFn();
            return result.data.count;
        } catch (error) {
            console.error('Error getting user count:', error);
            throw new Error('Failed to get user count');
        }
    }

    /**
     * Grant or revoke admin privileges for a user
     * Requires admin privileges
     * 
     * @param uid - User ID to modify
     * @param isAdmin - true to grant admin, false to revoke
     */
    async setAdmin(uid: string, isAdmin: boolean): Promise<SetAdminResult> {
        try {
            const setAdminFn = httpsCallable<{ uid: string; isAdmin: boolean }, SetAdminResult>(
                functions,
                'setAdmin'
            );
            const result = await setAdminFn({ uid, isAdmin });
            return result.data;
        } catch (error: any) {
            console.error('Error setting admin claim:', error);

            // Handle specific error codes
            if (error.code === 'permission-denied') {
                throw new Error('You do not have permission to set admin claims');
            } else if (error.code === 'unauthenticated') {
                throw new Error('You must be logged in to perform this action');
            } else if (error.code === 'invalid-argument') {
                throw new Error('Invalid user ID or admin value');
            }

            throw new Error('Failed to set admin claim');
        }
    }

    /**
     * Setup first admin user (for initial setup only)
     * This is an HTTP endpoint, not a callable function
     * 
     * @param email - Email of user to make admin
     */
    async setupFirstAdmin(email: string): Promise<void> {
        try {
            // Get the function URL from Firebase config
            const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
            const region = 'us-central1'; // Default region
            const url = `https://${region}-${projectId}.cloudfunctions.net/setupFirstAdmin`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to setup admin');
            }

            const result = await response.json();
            console.log('Admin setup successful:', result);
        } catch (error) {
            console.error('Error setting up first admin:', error);
            throw error;
        }
    }
}

export const cloudFunctionsService = new CloudFunctionsService();
export default cloudFunctionsService;
