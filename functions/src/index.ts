import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Get total user count from Firebase Authentication
 * Only accessible by admin users
 */
export const getUserCount = functions.https.onCall(async (data, context) => {
    // Verify the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to call this function'
        );
    }

    // Verify the caller has admin privileges
    if (!context.auth.token.admin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only administrators can get user count'
        );
    }

    try {
        // Get all users from Firebase Authentication
        const listUsersResult = await admin.auth().listUsers();

        return {
            success: true,
            count: listUsersResult.users.length,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
    } catch (error) {
        console.error('Error getting user count:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to get user count'
        );
    }
});

/**
 * Set or remove admin custom claim for a user
 * Only accessible by existing admin users
 */
export const setAdmin = functions.https.onCall(async (data, context) => {
    // Verify the caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User must be authenticated to call this function'
        );
    }

    // Verify the caller has admin privileges
    if (!context.auth.token.admin) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only administrators can set admin claims'
        );
    }

    // Validate input
    const { uid, isAdmin } = data;

    if (!uid || typeof uid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'UID is required and must be a string'
        );
    }

    if (typeof isAdmin !== 'boolean') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'isAdmin must be a boolean value'
        );
    }

    try {
        // Set custom user claims
        await admin.auth().setCustomUserClaims(uid, { admin: isAdmin });

        // Log the action
        console.log(`Admin claim ${isAdmin ? 'granted to' : 'revoked from'} user: ${uid}`);

        return {
            success: true,
            message: `Admin privileges ${isAdmin ? 'granted to' : 'revoked from'} user ${uid}`,
            uid: uid,
            isAdmin: isAdmin,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };
    } catch (error) {
        console.error('Error setting admin claim:', error);
        throw new functions.https.HttpsError(
            'internal',
            'Failed to set admin claim'
        );
    }
});

/**
 * Triggered when a new user is created
 * Automatically updates dashboard metrics
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
    try {
        const db = admin.firestore();
        const metricsRef = db.doc('dashboard/metrics');

        // Increment user count
        await metricsRef.set({
            userCount: admin.firestore.FieldValue.increment(1),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        console.log(`User created: ${user.uid}, metrics updated`);
    } catch (error) {
        console.error('Error updating metrics on user create:', error);
    }
});

/**
 * Triggered when a user is deleted
 * Automatically updates dashboard metrics
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
    try {
        const db = admin.firestore();
        const metricsRef = db.doc('dashboard/metrics');

        // Decrement user count
        await metricsRef.set({
            userCount: admin.firestore.FieldValue.increment(-1),
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Optionally delete user's Firestore data
        const userRef = db.doc(`users/${user.uid}`);
        await userRef.delete();

        console.log(`User deleted: ${user.uid}, metrics updated`);
    } catch (error) {
        console.error('Error updating metrics on user delete:', error);
    }
});

/**
 * Scheduled function to calculate monthly active users
 * Runs daily at midnight UTC
 */
export const calculateMonthlyActiveUsers = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('UTC')
    .onRun(async (context) => {
        try {
            const db = admin.firestore();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Query users active in last 30 days
            const usersSnapshot = await db.collection('users')
                .where('stats.lastActive', '>=', admin.firestore.Timestamp.fromDate(thirtyDaysAgo))
                .get();

            const monthlyActiveUsers = usersSnapshot.size;

            // Update dashboard metrics
            const metricsRef = db.doc('dashboard/metrics');
            await metricsRef.set({
                monthlyActiveUsers: monthlyActiveUsers,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            console.log(`Monthly active users calculated: ${monthlyActiveUsers}`);
        } catch (error) {
            console.error('Error calculating monthly active users:', error);
        }
    });

/**
 * HTTP endpoint to manually trigger admin claim setup
 * For initial setup only - should be secured or removed in production
 */
export const setupFirstAdmin = functions.https.onRequest(async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    // Get email from request body
    const { email } = req.body;

    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }

    try {
        // Find user by email
        const user = await admin.auth().getUserByEmail(email);

        // Set admin claim
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        res.status(200).json({
            success: true,
            message: `Admin privileges granted to ${email}`,
            uid: user.uid
        });
    } catch (error) {
        console.error('Error setting up first admin:', error);
        res.status(500).json({
            error: 'Failed to set up admin',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
