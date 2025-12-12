import { ref, onValue, onDisconnect, set, remove, serverTimestamp, push, type DatabaseReference } from 'firebase/database';
import { rtdb } from '../config/firebase';

class PresenceService {
    private connectedRef: DatabaseReference;
    private myConnectionRef: DatabaseReference | null = null;
    private userId: string | null = null;
    private unsubscribe: (() => void) | null = null;

    constructor() {
        this.connectedRef = ref(rtdb, '.info/connected');
    }

    /**
     * Start tracking presence for a user
     */
    initialize(userId?: string) {
        // Clean up any existing presence/listeners first
        this.goOffline();

        this.userId = userId || `anon_${Math.random().toString(36).substr(2, 9)}`;

        this.unsubscribe = onValue(this.connectedRef, (snap) => {
            if (snap.val() === true) {
                // We're connected (or reconnected)!

                // Remove previous ref if it exists (e.g. from a previous connection state)
                if (this.myConnectionRef) {
                    remove(this.myConnectionRef).catch(() => { });
                }

                // Create a reference for this user's presence
                const listRef = ref(rtdb, 'status/online');
                this.myConnectionRef = push(listRef);

                // When I disconnect, remove this device
                onDisconnect(this.myConnectionRef).remove();

                // Set my status to online
                set(this.myConnectionRef, {
                    userId: this.userId,
                    lastSeen: serverTimestamp(),
                    userAgent: navigator.userAgent
                });
            }
        });
    }

    /**
     * Stop tracking (e.g. on logout)
     */
    goOffline() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (this.myConnectionRef) {
            remove(this.myConnectionRef).catch(() => { });
            this.myConnectionRef = null;
        }
    }
}

export const presenceService = new PresenceService();
export default presenceService;
